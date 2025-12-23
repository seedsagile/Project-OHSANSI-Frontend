import { useEffect } from 'react';
import { useAuthStore } from '@/auth/login/stores/authStore';
import { useSistemaStore } from '@/features/sistema/stores/useSistemaStore';
import { sistemaService } from '@/features/sistema/services/sistemaService';
import { echo } from '@/lib/echo';

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
        console.error('Error sincronizando permisos (HTTP):', error);
        setCapabilitiesError('Fallo al cargar permisos iniciales');
      } finally {
        setCapabilitiesLoading(false);
      }
    };

    sync();
  }, [user?.id_usuario]);
  useEffect(() => {
    if (!user?.id_usuario) return;

    const canalPrivado = `usuario.${user.id_usuario}`;

    console.log(`🔌 Suscribiéndose a cambios en tiempo real: ${canalPrivado}`);
    const channel = echo.private(canalPrivado);

    channel.listen('.MisAccionesActualizadas', (e: any) => {
        console.log('⚡ [WebSocket] Permisos actualizados en caliente:', e);
        if (e.acciones) {
            setCapabilities(e.acciones);
        }
    });

    return () => {
      console.log(`🔌 Desconectando canal: ${canalPrivado}`);
      channel.stopListening('.MisAccionesActualizadas');
      echo.leave(canalPrivado);
    };
  }, [user?.id_usuario, setCapabilities]); 
};