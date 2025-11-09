import { useAuthStore } from '../stores/authStore';
import type { User } from '../types/auth';

export type { User };

export const useAuth = () => {
  const { user, token, loading, logout } = useAuthStore();

  const isAuthenticated = !!user && !!token;

  return {
    user,
    userId: user?.id_usuario, // editado por clau
    loading,
    isAuthenticated,
    logout,
  };
};
