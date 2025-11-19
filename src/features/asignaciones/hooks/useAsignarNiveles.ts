import { useState, useEffect, useMemo, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { asignacionesService } from '../services/asignarServices';
import type { AsignacionPayload, GradosPorNivel, ModalState, ModalGradosState } from '../types';
import isEqual from 'lodash.isequal';

type ApiErrorResponse = {
  message: string;
};

const initialModalState: ModalState = { isOpen: false, title: '', message: '', type: 'info' };
const initialModalGradosState: ModalGradosState = {
  isOpen: false,
  nivelId: null,
  nombreNivel: '',
  grados: [],
  gradosSeleccionados: new Set(),
  isLoading: false,
};

// Obtener año dinámicamente
const obtenerGestionActual = (): string => {
  return new Date().getFullYear().toString();
};

const GESTION_ACTUAL = obtenerGestionActual();
//const GESTION_ACTUAL = "2024";

export function useAsignarNiveles() {
  const [areaSeleccionadaId, setAreaSeleccionadaId] = useState<number | undefined>();
  const [nivelesSeleccionados, setNivelesSeleccionados] = useState<Set<number>>(new Set());
  const [modalState, setModalState] = useState<ModalState>(initialModalState);
  const [nivelesOriginales, setNivelesOriginales] = useState<Set<number>>(new Set());
  const [gradosPorNivel, setGradosPorNivel] = useState<GradosPorNivel>({});
  const [modalGradosState, setModalGradosState] = useState<ModalGradosState>(initialModalGradosState);
  const [procesoIniciado, setProcesoIniciado] = useState<boolean>(false);
  const [mensajeProcesoIniciado, setMensajeProcesoIniciado] = useState<string>('');
  const modalTimerRef = useRef<number | undefined>(undefined);

  // Cargar áreas con validación de proceso
  const { data: respuestaAreas, isLoading: isLoadingAreas } = useQuery({
    queryKey: ['areas', GESTION_ACTUAL],
    queryFn: () => asignacionesService.obtenerAreas(GESTION_ACTUAL),
  });

  // Determinar si el proceso ha iniciado basado en el mensaje de la API
  useEffect(() => {
    if (respuestaAreas) {
      const procesoHaIniciado = respuestaAreas.message.includes('proceso de evaluación ha iniciado');
      setProcesoIniciado(procesoHaIniciado);
      if (procesoHaIniciado) {
        setMensajeProcesoIniciado(respuestaAreas.message);
      }
    }
  }, [respuestaAreas]);

  const todasLasAreas = useMemo(() => respuestaAreas?.data || [], [respuestaAreas]);

  // Cargar niveles
  const { data: todosLosNiveles = [], isLoading: isLoadingNiveles } = useQuery({
    queryKey: ['niveles'],
    queryFn: asignacionesService.obtenerNiveles,
  });

  // Cargar grados
  const { data: gradosEscolaridad = [], isLoading: isLoadingGrados } = useQuery({
    queryKey: ['grados-escolaridad'],
    queryFn: asignacionesService.obtenerGradosEscolaridad,
  });

  // Cargar niveles y grados ya asignados al área seleccionada
  const { data: datosAsignados, refetch: refetchAsignados } = useQuery({
    queryKey: ['area-niveles-grados', areaSeleccionadaId, GESTION_ACTUAL],
    queryFn: () => 
      areaSeleccionadaId 
        ? asignacionesService.obtenerNivelesYGradosAsignados(GESTION_ACTUAL, areaSeleccionadaId)
        : Promise.resolve(null),
    enabled: !!areaSeleccionadaId,
  });

  const areasOrdenadas = useMemo(
    () => [...todasLasAreas].sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [todasLasAreas]
  );

  const nivelesOrdenados = useMemo(
    () => [...todosLosNiveles].sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [todosLosNiveles]
  );

  const areaActual = useMemo(
    () => areasOrdenadas.find((area) => area.id_area === areaSeleccionadaId),
    [areasOrdenadas, areaSeleccionadaId]
  );

  // Calcular si hay niveles nuevos seleccionados
  const hayNivelesNuevos = useMemo(() => {
    const nivelesNuevos = Array.from(nivelesSeleccionados).filter(
      (id) => !nivelesOriginales.has(id)
    );
    return nivelesNuevos.length > 0;
  }, [nivelesSeleccionados, nivelesOriginales]);

  // Sincronizar niveles y grados asignados
  useEffect(() => {
    if (areaSeleccionadaId && datosAsignados?.data) {
      const nivelesAsignados = new Set<number>();
      const gradosPorNivelAsignados: GradosPorNivel = {};

      datosAsignados.data.niveles_con_grados_agrupados.forEach((nivelData) => {
        nivelesAsignados.add(nivelData.id_nivel);
        gradosPorNivelAsignados[nivelData.id_nivel] = new Set(
          nivelData.grados.map(g => g.id_grado_escolaridad)
        );
      });

      setNivelesSeleccionados(nivelesAsignados);
      setNivelesOriginales(nivelesAsignados);
      setGradosPorNivel(gradosPorNivelAsignados);
    } else if (areaSeleccionadaId) {
      setNivelesSeleccionados(new Set());
      setNivelesOriginales(new Set());
      setGradosPorNivel({});
    } else {
      setNivelesSeleccionados(new Set());
      setNivelesOriginales(new Set());
      setGradosPorNivel({});
    }
  }, [areaSeleccionadaId, datosAsignados]);

  const closeModal = () => {
    if (modalState.type === 'info' && modalState.title.includes('Advertencia')) {
      setNivelesSeleccionados(nivelesOriginales);
    }
    setModalState(initialModalState);
    clearTimeout(modalTimerRef.current);
  };

  const handleAbrirModalGrados = (nivelId: number, nombreNivel: string) => {
    setModalGradosState({
      isOpen: true,
      nivelId,
      nombreNivel,
      grados: gradosEscolaridad,
      gradosSeleccionados: gradosPorNivel[nivelId] || new Set(),
      isLoading: false,
    });
  };

  const handleCerrarModalGrados = () => {
    // Si el proceso ha iniciado, no validar ni desmarcar nada
    if (procesoIniciado) {
      setModalGradosState(initialModalGradosState);
      return;
    }

    // Al cerrar el modal con "Cancelar", verificar si el nivel tiene grados
    // Si NO tiene grados, desmarcarlo
    if (modalGradosState.nivelId !== null) {
      const gradosDelNivel = gradosPorNivel[modalGradosState.nivelId];
      
      if (!gradosDelNivel || gradosDelNivel.size === 0) {
        setNivelesSeleccionados((prev) => {
          const newSet = new Set(prev);
          newSet.delete(modalGradosState.nivelId!);
          return newSet;
        });
      }
    }
    
    setModalGradosState(initialModalGradosState);
  };

  const handleGuardarGrados = (gradosSeleccionados: Set<number>) => {
    if (modalGradosState.nivelId !== null) {
      // Obtener los grados originales del nivel
      const gradosOriginales = gradosPorNivel[modalGradosState.nivelId] || new Set();
      
      // Verificar si hubo cambios
      const huboCambios = !isEqual(
        Array.from(gradosOriginales).sort(),
        Array.from(gradosSeleccionados).sort()
      );

      // Si no hubo cambios, mostrar mensaje
      if (!huboCambios) {
        setModalState({
          isOpen: true,
          type: 'info',
          title: 'Sin Cambios',
          message: 'No se han marcado nuevos grados.',
        });
        clearTimeout(modalTimerRef.current);
        modalTimerRef.current = window.setTimeout(() => closeModal(), 1500);
        setModalGradosState(initialModalGradosState);
        return;
      }

      // Actualizar gradosPorNivel ANTES de cerrar
      if (gradosSeleccionados.size === 0) {
        setNivelesSeleccionados((prev) => {
          const newSet = new Set(prev);
          newSet.delete(modalGradosState.nivelId!);
          return newSet;
        });
        
        setGradosPorNivel((prev) => {
          const newGrados = { ...prev };
          delete newGrados[modalGradosState.nivelId!];
          return newGrados;
        });
      } else {
        setGradosPorNivel((prev) => ({
          ...prev,
          [modalGradosState.nivelId!]: gradosSeleccionados,
        }));
      }
    }
    
    // Cerrar modal directamente (sin validación, porque ya guardamos)
    setModalGradosState(initialModalGradosState);
  };

  const { mutate: guardarAsignaciones, isPending: isSaving } = useMutation({
    mutationFn: async (payload: AsignacionPayload[]) => {
      return asignacionesService.crearAsignacionesDeArea(payload);
    },
    onSuccess: (response) => {
      const nombreArea = areaActual ? areaActual.nombre : '';
      
      if (response.success_count === 0 || response.created_count === 0) {
        const erroresDetalle = response.errors && response.errors.length > 0 
          ? response.errors.join('\n\n') 
          : 'No se pudieron crear las asignaciones.';
        
        setModalState({ 
          isOpen: true, 
          type: 'info', 
          title: '⚠️ Advertencia', 
          message: erroresDetalle,
        });
        return;
      }
    
      const mensajeExito = `Los niveles y grados fueron asignados correctamente al área "${nombreArea}".`;
      
      setModalState({ 
        isOpen: true, 
        type: 'success', 
        title: '¡Guardado!', 
        message: mensajeExito 
      });
      
      refetchAsignados();
      
      clearTimeout(modalTimerRef.current);
      modalTimerRef.current = window.setTimeout(() => closeModal(), 2000);
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

    const nivelesSinGrados = nivelesNuevos.filter(
      (id) => !gradosPorNivel[id] || gradosPorNivel[id].size === 0
    );

    if (nivelesSinGrados.length > 0) {
      const nombreNivel = todosLosNiveles.find((n) => n.id_nivel === nivelesSinGrados[0])?.nombre;
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Grados Requeridos',
        message: `Debe seleccionar grados para todos los niveles. Falta: ${nombreNivel}`,
      });
      return;
    }

    const payload: AsignacionPayload[] = [];
    
    nivelesNuevos.forEach((id_nivel) => {
      const gradosDelNivel = gradosPorNivel[id_nivel];
      if (gradosDelNivel) {
        gradosDelNivel.forEach((id_grado_escolaridad) => {
          payload.push({
            id_area: areaSeleccionadaId,
            id_nivel,
            id_grado_escolaridad,
            activo: true,
          });
        });
      }
    });

    guardarAsignaciones(payload);
  };

  const handleToggleNivel = (id_nivel: number) => {
    if (nivelesOriginales.has(id_nivel)) {
      return;
    }

    setNivelesSeleccionados((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id_nivel)) {
        newSet.delete(id_nivel);
        setGradosPorNivel((prevGrados) => {
          const newGrados = { ...prevGrados };
          delete newGrados[id_nivel];
          return newGrados;
        });
      } else {
        newSet.add(id_nivel);
      }
      return newSet;
    });
  };

  const handleCancelarCambios = () => {
    setNivelesSeleccionados(nivelesOriginales);
    setGradosPorNivel({});
  };

  const handleChangeArea = (nuevaAreaId: number | undefined) => {
    const hayCambiosSinGuardar = !isEqual(
      new Set(nivelesOriginales),
      new Set(nivelesSeleccionados)
    );

    if (hayCambiosSinGuardar && !procesoIniciado) {
      setModalState({
        isOpen: true,
        type: 'confirmation',
        title: 'Descartar Cambios',
        message:
          'Tienes cambios sin guardar. ¿Estás seguro de que quieres cambiar de área y perderlos?',
        onConfirm: () => {
          setAreaSeleccionadaId(nuevaAreaId);
          setGradosPorNivel({});
          closeModal();
        },
      });
    } else {
      setAreaSeleccionadaId(nuevaAreaId);
      setGradosPorNivel({});
    }
  };

  return {
    todasLasAreas: areasOrdenadas,
    todosLosNiveles: nivelesOrdenados,
    nivelesOriginales,
    areaSeleccionadaId,
    nivelesSeleccionados,
    gradosPorNivel,
    handleToggleNivel,
    handleGuardar,
    isLoading: isLoadingAreas || isLoadingNiveles || isLoadingGrados,
    isSaving,
    modalState,
    closeModal,
    handleCancelarCambios,
    handleChangeArea,
    setAreaSeleccionadaId,
    handleAbrirModalGrados,
    handleCerrarModalGrados,
    handleGuardarGrados,
    modalGradosState,
    hayNivelesNuevos,
    procesoIniciado,
    mensajeProcesoIniciado,
  };
}