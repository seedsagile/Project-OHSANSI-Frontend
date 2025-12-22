import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rolesService } from '../services/rolesService';
import type { PermisoRol, MatrizRolesUI } from '../types';

type ModalFeedbackState = {
  isOpen: boolean;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
};

export function useRolesConfig() {
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

  // Query Principal
  const matrizQuery = useQuery<MatrizRolesUI, Error>({
    queryKey: ['configuracionRoles'],
    queryFn: rolesService.obtenerMatriz,
    refetchOnWindowFocus: false,
    staleTime: 0, // Siempre fresco al montar
  });

  // Mutación Guardar
  const { mutate: guardarCambios, isPending: isSaving } = useMutation({
    mutationFn: rolesService.guardarConfiguracion,
    onSuccess: () => {
      setModalFeedback({
        isOpen: true,
        type: 'success',
        title: '¡Guardado Exitoso!',
        message: 'Los permisos de roles han sido actualizados correctamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['configuracionRoles'] });
    },
    onError: (err: Error) => {
      setModalFeedback({
        isOpen: true,
        type: 'error',
        title: 'Error al Guardar',
        message: err.message,
      });
    },
  });

  const handleGuardar = useCallback((permisos: PermisoRol[]) => {
    guardarCambios(permisos);
  }, [guardarCambios]);

  const handleCancelar = useCallback(() => {
    setCancelModalOpen(true);
  }, []);

  const confirmarCancelacion = useCallback(() => {
    setCancelModalOpen(false);
    matrizQuery.refetch();
    setResetKey(prev => prev + 1);
  }, [matrizQuery]);

  const cerrarCancelModal = useCallback(() => {
    setCancelModalOpen(false);
  }, []);

  return {
    matrizData: matrizQuery.data,
    isLoading: matrizQuery.isLoading,
    isError: matrizQuery.isError,
    errorMessage: (matrizQuery.error as Error)?.message,
    isSaving,
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