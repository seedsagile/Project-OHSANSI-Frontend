import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { sistemaService } from '@/features/sistema/services/sistemaService';
import { useSistemaStore } from '@/features/sistema/stores/useSistemaStore';
import { SistemaEstado } from '@/features/sistema/types/sistema.types';
import { echo } from '@/lib/echo';

export const useSyncSistema = () => {
  const { setConfig } = useSistemaStore();

  const { data, refetch, isLoading } = useQuery({
    queryKey: ['sistema-estado'],
    queryFn: sistemaService.getUpdateEstado,
    staleTime: Infinity,
    enabled: !!localStorage.getItem('auth-storage'),
  });

  useEffect(() => {
    if (data) {
      setConfig(data);
    }
  }, [data, setConfig]);

  useEffect(() => {
    const channel = echo.channel('sistema-global');
    
    channel.listen('.EstadoSistemaActualizado', (e: { estado: SistemaEstado }) => {
      console.log('Update de sistema recibido vía WebSocket:', e.estado);
      setConfig(e.estado);
    });

    return () => {
      echo.leaveChannel('sistema-global');
    };
  }, [setConfig]);

  return { 
    config: data, 
    refetch, 
    isLoading 
  };
};