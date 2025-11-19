import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { configuracionService } from '../services/configuracionService';
import { GESTION_ACTUAL } from '../utils/constants'; // <-- Importamos la constante
import type { 
  PermisoFase, 
  GuardarConfiguracionPayload 
} from '../types';

export function useConfiguracionFases() {
  const queryClient = useQueryClient();

  const { 
    data: matrizData, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['configuracionFases', GESTION_ACTUAL.id],
    queryFn: () => configuracionService.obtenerConfiguracion(GESTION_ACTUAL.gestion),
    refetchOnWindowFocus: false, 
    staleTime: 1000 * 60 * 5,
  });

  const { mutate: guardarCambios, isPending: isSaving } = useMutation({
    mutationFn: configuracionService.guardarConfiguracion,
    onSuccess: () => {
      toast.success('Configuración guardada correctamente');
      queryClient.invalidateQueries({ 
        queryKey: ['configuracionFases', GESTION_ACTUAL.id] 
      });
    },
    onError: (err: Error) => {
      console.error('Error al guardar:', err);
      toast.error(`Error al guardar: ${err.message || 'Intente nuevamente'}`);
    },
  });

  const handleGuardar = useCallback((permisosModificados: PermisoFase[]) => {
    const payload: GuardarConfiguracionPayload = {
      id_gestion: GESTION_ACTUAL.id,
      permisos: permisosModificados,
    };
    guardarCambios(payload);
  }, [guardarCambios]);

  const handleCancelar = useCallback(() => {
    if (confirm('¿Está seguro de descartar los cambios no guardados?')) {
      toast('Recargando datos originales...', { icon: '🔄' });
      refetch();
    }
  }, [refetch]);

  return {
    matrizData,
    gestionActual: GESTION_ACTUAL,
    isLoading,
    isSaving,
    isError,
    errorMessage: error instanceof Error ? error.message : null,
    handleGuardar,
    handleCancelar,
  };
}