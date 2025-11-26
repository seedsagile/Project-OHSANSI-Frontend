// src/features/ConfiguracionFases/hooks/useConfiguracionFases.ts

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Importar hook de navegación
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
  const navigate = useNavigate(); // 2. Inicializar navegación

  // --- Estados ---
  const [modalFeedback, setModalFeedback] = useState<ModalFeedbackState>({
    isOpen: false, type: 'info', title: '', message: '',
  });
  const [isCancelModalOpen, setCancelModalOpen] = useState(false);
  
  // (ResetKey ya no es estrictamente necesario si navegamos fuera, pero no estorba)
  const [resetKey] = useState(0);

  const closeModalFeedback = useCallback(() => {
    setModalFeedback((prev) => ({ ...prev, isOpen: false }));
  }, []);

  // --- Queries ---
  const gestionQuery = useQuery<Gestion, Error>({
    queryKey: ['gestionActual'],
    queryFn: configuracionService.obtenerGestionActual,
    staleTime: 1000 * 60 * 60,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const idGestion = gestionQuery.data?.id;

  const configQuery = useQuery<ConfiguracionUI, Error>({
    queryKey: ['configuracionFases', idGestion],
    queryFn: () => configuracionService.obtenerConfiguracion(idGestion!),
    enabled: !!idGestion,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  // --- Mutación ---
  const { mutate: guardarCambios, isPending: isSaving } = useMutation({
    mutationFn: async (permisosModificados: PermisoFase[]) => {
      if (!idGestion || !configQuery.data) throw new Error('Faltan datos.');
      const idsFases = configQuery.data.fases.map((f) => f.id);
      await configuracionService.guardarConfiguracion(idGestion, permisosModificados, idsFases);
    },
    onSuccess: () => {
      setModalFeedback({
        isOpen: true,
        type: 'success',
        title: '¡Configuración Exitosa!',
        message: 'Se configuró correctamente las acciones permitidas por fases.',
      });
      queryClient.invalidateQueries({ queryKey: ['configuracionFases', idGestion] });
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

  // --- Handlers ---

  const handleGuardar = useCallback((permisos: PermisoFase[]) => {
    guardarCambios(permisos);
  }, [guardarCambios]);

  const handleCancelar = useCallback(() => {
    setCancelModalOpen(true);
  }, []);

  // CORRECCIÓN CLAVE: Navegar al dashboard al confirmar
  const confirmarCancelacion = useCallback(() => {
    setCancelModalOpen(false);
    navigate('/dashboard'); // <-- Redirección
  }, [navigate]);

  const cerrarCancelModal = useCallback(() => {
    setCancelModalOpen(false);
  }, []);

  // --- Datos UI ---
  const infoGestionParaUI = gestionQuery.data
    ? {
        id: gestionQuery.data.id,
        gestion: String(gestionQuery.data.gestion),
        estado: gestionQuery.data.esActual ? 'VIGENTE' : 'HISTÓRICO',
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