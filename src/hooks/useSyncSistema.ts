import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { sistemaService } from '@/features/sistema/services/sistemaService';
import { useSistemaStore } from '@/features/sistema/stores/useSistemaStore';
import { SistemaStateData } from '@/features/sistema/types/sistema.types';
import { echo } from '@/lib/echo';

export const useSyncSistema = () => {
  const { setSystemData } = useSistemaStore();

  const { data, refetch, isLoading } = useQuery({
    queryKey: ['sistema-estado'],
    queryFn: sistemaService.obtenerEstadoSistema,
    staleTime: Infinity,
    enabled: !!localStorage.getItem('auth-storage'),
  });

  useEffect(() => {
    if (data) {
      setSystemData(data);
    }
  }, [data, setSystemData]);

  useEffect(() => {
    const channel = echo.channel('sistema-global');
    channel.listen('.EstadoSistemaActualizado', (e: { estado: SistemaStateData }) => {
      console.log('Update de sistema recibido vía WebSocket:', e.estado);
      setSystemData(e.estado);
    });

    return () => {
      echo.leaveChannel('sistema-global');
    };
  }, [setSystemData]);

  return { 
    config: data, 
    refetch, 
    isLoading 
  };
};