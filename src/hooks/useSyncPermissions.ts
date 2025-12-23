import { useEffect } from 'react';
import { useAuthStore } from '@/auth/login/stores/authStore';
import { useSistemaStore } from '@/features/sistema/stores/useSistemaStore';
import { sistemaService } from '@/features/sistema/services/sistemaService';

export const useSyncPermissions = () => {
  const user = useAuthStore((state) => state.user);
  const { 
    capabilities, 
    setCapabilities, 
    setCapabilitiesLoading, 
    setCapabilitiesError 
  } = useSistemaStore();

  useEffect(() => {
    const sync = async () => {
      if (!user?.id_usuario) return;
      if (capabilities?.user_id === user.id_usuario) return;

      try {
        setCapabilitiesLoading(true);
        const data = await sistemaService.obtenerCapacidadesUsuario(user.id_usuario);
        setCapabilities(data);
      } catch (error) {
        console.error('Error sincronizando permisos:', error);
        setCapabilitiesError('Fallo al cargar permisos');
      } finally {
        setCapabilitiesLoading(false);
      }
    };

    sync();
  }, [user, capabilities, setCapabilities, setCapabilitiesLoading, setCapabilitiesError]);
};