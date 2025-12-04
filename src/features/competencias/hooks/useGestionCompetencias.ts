// src/features/competencias/hooks/useGestionCompetencias.ts
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { competenciasService } from '../services/competenciasServices';
import { useAuth } from '../../../auth/login/hooks/useAuth';
import type { CrearCompetenciaData } from '../types';

type ConfirmationModalState = {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'confirmation' | 'info' | 'error' | 'success';
};

const initialConfirmationState: ConfirmationModalState = {
  isOpen: false,
  title: '',
  message: '',
  type: 'info',
};

export function useGestionCompetencias() {
  const queryClient = useQueryClient();
  const { userId } = useAuth();
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState<ConfirmationModalState>(initialConfirmationState);

  useEffect(() => {
    console.log(' [useGestionCompetencias] userId:', userId);
  }, [userId]);

  const { data: areasConNiveles, isLoading: isLoadingAreas, error } = useQuery({
    queryKey: ['areasConNiveles', userId],
    queryFn: async () => {
      console.log(' [useGestionCompetencias] Llamando API con userId:', userId);
      const result = await competenciasService.obtenerAreasConNiveles(userId!);
      console.log('[useGestionCompetencias] Datos recibidos:', result);
      return result;
    },
    enabled: !!userId,
  });

  useEffect(() => {
    if (error) {
      console.error('❌ [useGestionCompetencias] Error en query:', error);
    }
  }, [error]);


  useEffect(() => {
    if (areasConNiveles) {
      console.log(' [useGestionCompetencias] Áreas disponibles:', areasConNiveles.areas);
      console.log(' [useGestionCompetencias] Total de áreas:', areasConNiveles.areas?.length || 0);
    }
  }, [areasConNiveles]);

  const { mutate, isPending: isCreating } = useMutation({
    mutationFn: competenciasService.crearCompetencia,
    onSuccess: (data) => {
      console.log(' [useGestionCompetencias] Competencia creada exitosamente:', data);
      
      if (data.id_competencia) {
        localStorage.setItem('ultima_competencia_id', data.id_competencia.toString());
        console.log(' [useGestionCompetencias] ID guardado en localStorage:', data.id_competencia);
      }
      
      queryClient.invalidateQueries({ queryKey: ['competencias'] });
      setModalCrearAbierto(false);

      setTimeout(() => {
        setConfirmationModal({
          isOpen: true,
          title: '¡Registro Exitoso!',
          message: 'La competencia ha sido registrada correctamente.',
          type: 'success',
        });

        setTimeout(() => {
          setConfirmationModal(initialConfirmationState);
        }, 2000);
      }, 250);
    },
    onError: (error: Error) => {
      console.error('❌ [useGestionCompetencias] Error al crear:', error);
      setConfirmationModal({
        isOpen: true,
        title: 'Error',
        message: error.message || 'Error al crear la competencia',
        type: 'error',
      });
    },
  });

  const handleGuardarCompetencia = (data: CrearCompetenciaData) => {
    console.log(' [useGestionCompetencias] Guardando competencia:', data);
    mutate(data);
  };

  const abrirModalCrear = () => {
    console.log(' [useGestionCompetencias] Abriendo modal');
    setModalCrearAbierto(true);
  };

  const cerrarModalCrear = () => {
    console.log(' [useGestionCompetencias] Cerrando modal');
    setModalCrearAbierto(false);
  };

  const cerrarModalConfirmacion = () => setConfirmationModal(initialConfirmationState);

  return {
    areasConNiveles: areasConNiveles?.areas || [],
    isLoadingAreas,
    isCreating,
    modalCrearAbierto,
    confirmationModal,
    abrirModalCrear,
    cerrarModalCrear,
    cerrarModalConfirmacion,
    handleGuardarCompetencia,
  };
}