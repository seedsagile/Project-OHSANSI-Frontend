import React, { createContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { TOKEN_KEY, USER_KEY } from '../utils/constants';
import type { AuthContextType, LoginCredentials, User } from '../types/auth';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useLocalStorage<User | null>(USER_KEY, null);
  const [token, setToken] = useLocalStorage<string | null>(TOKEN_KEY, null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token && !user) {
      validateToken();
    }
  }, []);

  const validateToken = async () => {
    try {
      setLoading(true);
      const currentUser = await authService.getCurrentUser(token!);
      setUser(currentUser);
    } catch (error) {
      console.error('Token inválido:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      const { user: userData, token: newToken } = await authService.login(credentials);
      
      // Verificar que sea evaluador
      if (userData.role !== 'evaluator') {
        throw new Error('Acceso permitido solo para evaluadores');
      }

      setUser(userData);
      setToken(newToken);
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};