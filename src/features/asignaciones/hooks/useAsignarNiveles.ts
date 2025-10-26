import { useState, useEffect, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { nivelesService } from '../../niveles/services/nivelesService';
import { asignacionesService } from '../services/asignarServices';
import type { AsignacionPayload } from '../types';
import isEqual from 'lodash.isequal';

type ApiErrorResponse = {
  message: string;
};

type ModalState = {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'confirmation';
  onConfirm?: () => void;
};

const initialModalState: ModalState = { isOpen: false, title: '', message: '', type: 'info' };

export function useAsignarNiveles() {
  const queryClient = useQueryClient();
  const [areaSeleccionadaId, setAreaSeleccionadaId] = useState<number | undefined>();
  const [nivelesSeleccionados, setNivelesSeleccionados] = useState<Set<number>>(new Set());
  const [modalState, setModalState] = useState<ModalState>(initialModalState);
  const [nivelesOriginales, setNivelesOriginales] = useState<Set<number>>(new Set());
  const modalTimerRef = useRef<number | undefined>(undefined);

  // Cargar áreas con sus niveles asignados
  const { data: areasConNiveles = [], isLoading: isLoadingAreas } = useQuery({
    queryKey: ['areas-con-niveles'],
    queryFn: asignacionesService.obtenerAreasConNiveles,
  });

  // Cargar nombres de áreas permitidas
  const { data: areasPermitidas = {}, isLoading: isLoadingAreasPermitidas } = useQuery({
    queryKey: ['areas-nombres'],
    queryFn: asignacionesService.obtenerAreasNombres,
  });

  // Cargar todos los niveles disponibles
  const { data: todosLosNiveles = [], isLoading: isLoadingNiveles } = useQuery({
    queryKey: ['niveles'],
    queryFn: nivelesService.obtenerNiveles,
  });

  // Filtrar y ordenar las áreas que están en la lista de áreas permitidas
  const areasOrdenadas = useMemo(() => {
    const areasFiltradas = areasConNiveles.filter(
      (area) => areasPermitidas[area.id_area] !== undefined
    );
    return areasFiltradas.sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [areasConNiveles, areasPermitidas]);

  const nivelesOrdenados = useMemo(
    () => [...todosLosNiveles].sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [todosLosNiveles]
  );

  // Obtener el área seleccionada y sus niveles asignados
  const areaActual = useMemo(
    () => areasOrdenadas.find((area) => area.id_area === areaSeleccionadaId),
    [areasOrdenadas, areaSeleccionadaId]
  );

  // Sincronizar niveles seleccionados cuando cambia el área
  useEffect(() => {
    if (areaActual) {
      const nivelesActivosIds = new Set(
        areaActual.niveles
          .filter((nivel) => nivel.asignado_activo)
          .map((nivel) => nivel.id_nivel)
      );
      setNivelesSeleccionados(nivelesActivosIds);
      setNivelesOriginales(nivelesActivosIds);
    } else {
      setNivelesSeleccionados(new Set());
      setNivelesOriginales(new Set());
    }
  }, [areaActual]);

  const closeModal = () => {
    // Si el modal es de tipo info (advertencia de error), limpiar niveles seleccionados
    if (modalState.type === 'info' && modalState.title.includes('Advertencia')) {
      setNivelesSeleccionados(nivelesOriginales);
    }
    setModalState(initialModalState);
    clearTimeout(modalTimerRef.current);
  };

  // Mutación para guardar asignaciones
  const { mutate: guardarAsignaciones, isPending: isSaving } = useMutation({
    mutationFn: async (payload: AsignacionPayload[]) => {
      return asignacionesService.crearAsignacionesDeArea(payload);
    },
    onSuccess: (response) => {
      const nombreArea = areaActual ? areaActual.nombre : '';
      
      // Validar si realmente se guardó algo
      if (response.success_count === 0 || response.created_count === 0) {
        // No se guardó nada, mostrar advertencia
        const erroresDetalle = response.errors && response.errors.length > 0 
          ? response.errors.join('\n\n') 
          : 'No se pudieron crear las asignaciones.';
        
        setModalState({ 
          isOpen: true, 
          type: 'info', 
          title: '⚠️ Advertencia', 
          message: erroresDetalle,
          onConfirm: () => {
            // Solo limpiar los niveles seleccionados (mantener área)
            setNivelesSeleccionados(nivelesOriginales);
            closeModal();
          }
        });
        return;
      }
      
      // Éxito: se guardó al menos una asignación
      const mensajeExito = `Los niveles fueron asignados correctamente al área "${nombreArea}".`;
      setModalState({ isOpen: true, type: 'success', title: '¡Guardado!', message: mensajeExito });
      
      // Invalida la query para refrescar los datos
      queryClient.invalidateQueries({ queryKey: ['areas-con-niveles'] });
      
      clearTimeout(modalTimerRef.current);
      modalTimerRef.current = window.setTimeout(() => closeModal(), 1500);
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      clearTimeout(modalTimerRef.current);
      const errorMessage = error.response?.data?.message || 'No se pudieron guardar los cambios.';
      setModalState({ 
        isOpen: true, 
        type: 'error', 
        title: 'Error de Conexión', 
        message: errorMessage
      });
    },
  });

  useEffect(() => {
    return () => clearTimeout(modalTimerRef.current);
  }, []);

  const handleGuardar = () => {
    if (!areaSeleccionadaId) return;

    if (nivelesSeleccionados.size === 0) {
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Selección Requerida',
        message: 'Debe seleccionar al menos un nivel para asignar al área.',
      });
      return;
    }

    // Verificar si hay cambios
    if (isEqual(new Set(nivelesOriginales), new Set(nivelesSeleccionados))) {
      setModalState({
        isOpen: true,
        type: 'info',
        title: 'Sin Cambios',
        message: 'No se ha realizado ninguna modificación.',
      });
      clearTimeout(modalTimerRef.current);
      modalTimerRef.current = window.setTimeout(() => closeModal(), 1500);
      return;
    }

    // Crear payload solo con los niveles nuevos (no originales)
    const nivelesNuevos = Array.from(nivelesSeleccionados).filter(
      (id) => !nivelesOriginales.has(id)
    );

    if (nivelesNuevos.length === 0) {
      setModalState({
        isOpen: true,
        type: 'info',
        title: 'Sin Cambios',
        message: 'No se han agregado nuevos niveles.',
      });
      clearTimeout(modalTimerRef.current);
      modalTimerRef.current = window.setTimeout(() => closeModal(), 1500);
      return;
    }

    const payload: AsignacionPayload[] = nivelesNuevos.map((id_nivel) => ({
      id_area: areaSeleccionadaId,
      id_nivel,
      activo: true,
    }));

    guardarAsignaciones(payload);
  };

  const handleToggleNivel = (id_nivel: number) => {
    // No permitir cambiar niveles que ya estaban asignados originalmente
    if (nivelesOriginales.has(id_nivel)) {
      return;
    }

    setNivelesSeleccionados((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id_nivel)) {
        newSet.delete(id_nivel);
      } else {
        newSet.add(id_nivel);
      }
      return newSet;
    });
  };

  const handleCancelarCambios = () => {
    setNivelesSeleccionados(nivelesOriginales);
  };

  const handleChangeArea = (nuevaAreaId: number | undefined) => {
    const hayCambiosSinGuardar = !isEqual(
      new Set(nivelesOriginales),
      new Set(nivelesSeleccionados)
    );

    if (hayCambiosSinGuardar) {
      setModalState({
        isOpen: true,
        type: 'confirmation',
        title: 'Descartar Cambios',
        message:
          'Tienes cambios sin guardar. ¿Estás seguro de que quieres cambiar de área y perderlos?',
        onConfirm: () => {
          setAreaSeleccionadaId(nuevaAreaId);
          closeModal();
        },
      });
    } else {
      setAreaSeleccionadaId(nuevaAreaId);
    }
  };

  return {
    todasLasAreas: areasOrdenadas,
    todosLosNiveles: nivelesOrdenados,
    nivelesOriginales,
    areaSeleccionadaId,
    nivelesSeleccionados,
    handleToggleNivel,
    handleGuardar,
    isLoading: isLoadingAreas || isLoadingNiveles || isLoadingAreasPermitidas,
    isSaving,
    modalState,
    closeModal,
    handleCancelarCambios,
    handleChangeArea,
    setAreaSeleccionadaId,
  };
}