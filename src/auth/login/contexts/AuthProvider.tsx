import React, { useEffect, useMemo, useCallback } from 'react';
import { authService } from '../services/authService';
import { AuthContext } from './AuthContext';
import { useAuthStore } from '../stores/authStore'; // 1. Importa el hook del store
import type { LoginCredentials } from '../types/auth';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const {
    user,
    token,
    loading,
    setUser,
    setToken,
    setLoading,
    logout: zustandLogout,
  } = useAuthStore();

  useEffect(() => {
    const initialToken = useAuthStore.getState().token;

    const validateExistingToken = async () => {
      if (!initialToken) {
        setLoading(false);
        return;
      }
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch {
        console.error('Token inválido. Se limpiará la sesión.');
        zustandLogout();
      } finally {
        setLoading(false);
      }
    };
    validateExistingToken();
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const { user: userData, token: newToken } = await authService.login(credentials);
      setUser(userData);
      setToken(newToken);
    },
    [setUser, setToken]
  );

  const logout = useCallback(() => {
    zustandLogout();
  }, [zustandLogout]);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user && !!token,
      login,
      logout,
    }),
    [user, loading, token, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
