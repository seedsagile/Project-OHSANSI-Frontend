// src/features/examenes/hooks/useGestionExamenes.ts
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { examenesService } from '../services/examenesServices';
import type { CrearExamenData } from '../types';

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

export function useGestionExamenes() {
  const queryClient = useQueryClient();
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [confirmationModal, setConfirmationModal] =
    useState<ConfirmationModalState>(initialConfirmationState);
  const [idCompetencia, setIdCompetencia] = useState<number | null>(null);

  // Obtener el id_competencia del localStorage cuando se monta el componente
  useEffect(() => {
    const competenciaId = localStorage.getItem('ultima_competencia_id');
    if (competenciaId) {
      const id = Number(competenciaId);
      setIdCompetencia(id);
      console.log('🔍 [useGestionExamenes] ID de competencia obtenido:', id);
    } else {
      console.warn('⚠️ [useGestionExamenes] No se encontró ID de competencia');
    }
  }, []);

  // Obtener exámenes de la competencia
  const {
    data: examenes,
    isLoading: isLoadingExamenes,
    error,
  } = useQuery({
    queryKey: ['examenes', idCompetencia],
    queryFn: () => examenesService.obtenerExamenesPorCompetencia(idCompetencia!),
    enabled: !!idCompetencia,
  });

  // Debug: Ver si hay error en la query
  useEffect(() => {
    if (error) {
      console.error('❌ [useGestionExamenes] Error en query:', error);
    }
  }, [error]);

  // Debug: Ver los exámenes cuando cambian
  useEffect(() => {
    if (examenes) {
      console.log('📋 [useGestionExamenes] Exámenes obtenidos:', examenes);
      console.log('📊 [useGestionExamenes] Total de exámenes:', examenes?.length || 0);
    }
  }, [examenes]);

  // Mutation para crear examen
  const { mutate, isPending: isCreating } = useMutation({
    mutationFn: (data: CrearExamenData) => {
      if (!idCompetencia) {
        throw new Error('No hay ID de competencia disponible');
      }
      return examenesService.crearExamen(idCompetencia, data);
    },
    onSuccess: (data) => {
      console.log('✅ [useGestionExamenes] Examen creado exitosamente:', data);
      queryClient.invalidateQueries({ queryKey: ['examenes', idCompetencia] });
      setModalCrearAbierto(false);

      setTimeout(() => {
        setConfirmationModal({
          isOpen: true,
          title: '¡Registro Exitoso!',
          message: 'El examen ha sido registrado correctamente.',
          type: 'success',
        });

        setTimeout(() => {
          setConfirmationModal(initialConfirmationState);
        }, 2000);
      }, 250);
    },
    onError: (error: Error) => {
      console.error('❌ [useGestionExamenes] Error al crear:', error);
      setConfirmationModal({
        isOpen: true,
        title: 'Error',
        message: error.message || 'Error al crear el examen',
        type: 'error',
      });
    },
  });

  const handleGuardarExamen = (data: CrearExamenData) => {
    console.log('💾 [useGestionExamenes] Guardando examen:', data);
    mutate(data);
  };

  const abrirModalCrear = () => {
    console.log('🚪 [useGestionExamenes] Abriendo modal');
    setModalCrearAbierto(true);
  };

  const cerrarModalCrear = () => {
    console.log('🚪 [useGestionExamenes] Cerrando modal');
    setModalCrearAbierto(false);
  };

  const cerrarModalConfirmacion = () =>
    setConfirmationModal(initialConfirmationState);

  return {
    examenes: examenes || [],
    isLoadingExamenes,
    isCreating,
    modalCrearAbierto,
    confirmationModal,
    idCompetencia,
    abrirModalCrear,
    cerrarModalCrear,
    cerrarModalConfirmacion,
    handleGuardarExamen,
  };
}