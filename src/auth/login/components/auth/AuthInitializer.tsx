import { useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { authService } from '../../services/authService';

export const AuthInitializer: React.FC = () => {
  const { setLoading, setUser, logout } = useAuthStore();
  
  useEffect(() => {

    const initialToken = useAuthStore.getState().token;

    const validateToken = async () => {
      if (!initialToken) {
        setLoading(false);
        return;
      }
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch {
        console.error('Token inválido. Se limpiará la sesión.');
        logout();
      } finally {
        setLoading(false);
      }
    };

    validateToken();

  }, []);

  return null;
};