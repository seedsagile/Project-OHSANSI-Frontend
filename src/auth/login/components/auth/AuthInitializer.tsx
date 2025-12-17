import React, { useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { authService } from '../../services/authService';
import { useSyncSistema } from '@/hooks/useSyncSistema';

export const AuthInitializer: React.FC = () => {
  useSyncSistema(); 

  const { setUser, setLoading, logout } = useAuthStore();

  useEffect(() => {
    const initApp = async () => {
      const token = useAuthStore.getState().token;

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error al inicializar aplicación:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initApp();
  }, [setUser, setLoading, logout]);

  return null;
};