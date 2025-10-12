import { useAuthStore } from '../stores/authStore';
import type { User } from '../types/auth';

export type { User };

export const useAuth = () => {
  const { user, token, loading, logout } = useAuthStore();

  const isAuthenticated = !!user && !!token;

  return {
    user,
    loading,
    isAuthenticated,
    logout,
  };
};