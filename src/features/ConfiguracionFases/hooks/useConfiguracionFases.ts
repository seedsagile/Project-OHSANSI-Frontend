import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { configuracionService, type ConfiguracionUI } from '../services/configuracionService';
import type { PermisoFase, Gestion } from '../types';

type ModalFeedbackState = {
  isOpen: boolean;
  type: 'success' | 'error' | 'info' | 'confirmation';
  title: string;
  message: string;
};

export function useConfiguracionFases() {
  const queryClient = useQueryClient();

  const [modalFeedback, setModalFeedback] = useState<ModalFeedbackState>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
  });
  const [isCancelModalOpen, setCancelModalOpen] = useState(false);
  
  const [resetKey, setResetKey] = useState(0);

  const closeModalFeedback = useCallback(() => {
    setModalFeedback((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const gestionQuery = useQuery<Gestion, Error>({
    queryKey: ['gestionActual'],
    queryFn: configuracionService.obtenerGestionActual,
    staleTime: 1000 * 60 * 60,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const gestionData = gestionQuery.data;
  const idGestion = gestionData?.id;

  const configQuery = useQuery<ConfiguracionUI, Error>({
    queryKey: ['configuracionFases', idGestion],
    queryFn: () => configuracionService.obtenerConfiguracion(idGestion!),
    enabled: !!idGestion,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const { mutate: guardarCambios, isPending: isSaving } = useMutation({
    mutationFn: async (permisosModificados: PermisoFase[]) => {
      if (!idGestion || !configQuery.data) {
        throw new Error('No se ha cargado la información necesaria para guardar.');
      }
      const idsFasesActivas = configQuery.data.fases.map((f) => f.id);
      await configuracionService.guardarConfiguracion(
        idGestion,
        permisosModificados,
        idsFasesActivas
      );
    },
    onSuccess: () => {
      setModalFeedback({
        isOpen: true,
        type: 'success',
        title: '¡Guardado Exitoso!',
        message: 'La configuración de fases y permisos se ha actualizado correctamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['configuracionFases', idGestion] });
    },
    onError: (err: Error) => {
      setModalFeedback({
        isOpen: true,
        type: 'error',
        title: 'Error al Guardar',
        message: err.message || 'Ocurrió un problema al intentar guardar los cambios.',
      });
    },
  });

  const handleGuardar = useCallback((permisos: PermisoFase[]) => {
    guardarCambios(permisos);
  }, [guardarCambios]);

  const handleCancelar = useCallback(() => {
    setCancelModalOpen(true);
  }, []);

  const confirmarCancelacion = useCallback(() => {
    setCancelModalOpen(false);
    configQuery.refetch();
    setResetKey(prev => prev + 1);
  }, [configQuery]);

  const cerrarCancelModal = useCallback(() => {
    setCancelModalOpen(false);
  }, []);

  const infoGestionParaUI = gestionData
    ? {
        id: gestionData.id,
        gestion: String(gestionData.gestion),
        estado: gestionData.esActual ? 'VIGENTE' : 'HISTÓRICO',
      }
    : { id: 0, gestion: '...', estado: '...' };

  return {
    matrizData: configQuery.data,
    gestionActual: infoGestionParaUI,
    isLoading: gestionQuery.isLoading || (!!idGestion && configQuery.isLoading),
    isSaving,
    isError: gestionQuery.isError || configQuery.isError,
    errorMessage: (gestionQuery.error as Error)?.message || (configQuery.error as Error)?.message,
    handleGuardar,
    handleCancelar,
    modalFeedback,
    closeModalFeedback,
    isCancelModalOpen,
    confirmarCancelacion,
    cerrarCancelModal,
    resetKey,
  };
}