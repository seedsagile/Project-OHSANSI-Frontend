// src/features/evaluaciones/hooks/useEvaluaciones.ts

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/auth/login/hooks/useAuth';
import { evaluacionService } from '../services/evaluacionService';
import type { Area, BackendAreaNivelItem, Competidor } from '../types/evaluacion.types';
import toast from 'react-hot-toast';

export const useEvaluaciones = () => {
  const { userId, user } = useAuth();
  const [areas, setAreas] = useState<Area[]>([]);
  const [competidores, setCompetidores] = useState<Competidor[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCompetidores, setLoadingCompetidores] = useState(false);
  const [idCompetenciaActual, setIdCompetenciaActual] = useState<number | null>(null);
  const [areaNivelMappings, setAreaNivelMappings] = useState<BackendAreaNivelItem[]>([]);
  const [idAreaActual, setIdAreaActual] = useState<number | null>(null);
  const [idNivelActual, setIdNivelActual] = useState<number | null>(null);

  // Cargar ID de competencia desde localStorage al iniciar
  useEffect(() => {
    const storedId = localStorage.getItem('ultima_competencia_id');
    if (storedId) {
      setIdCompetenciaActual(parseInt(storedId, 10));
      console.log('🏆 ID Competencia cargado desde localStorage:', storedId);
    } else {
      console.warn('⚠️ No se encontró "ultima_competencia_id" en localStorage');
    }
  }, []);

  // Función para actualizar la competencia seleccionada
  const setCompetencia = (idCompetencia: number | null) => {
    setIdCompetenciaActual(idCompetencia);
    if (idCompetencia) {
      localStorage.setItem('ultima_competencia_id', idCompetencia.toString());
      console.log('💾 ID Competencia guardado en localStorage:', idCompetencia);
    } else {
      localStorage.removeItem('ultima_competencia_id');
      console.log('🗑️ ID Competencia removido de localStorage');
    }
  };

  // Cargar áreas y niveles del evaluador
  useEffect(() => {
    const fetchAreasNiveles = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const response = await evaluacionService.getAreasNivelesByEvaluador(userId);

        console.log('📚 Respuesta completa del servicio:', response);

        // Validar que areas sea un array
        if (Array.isArray(response.areas)) {
          setAreas(response.areas);
          console.log('✅ Áreas cargadas:', response.areas);
        } else {
          console.error('❌ La respuesta no contiene un array de áreas:', response);
          setAreas([]);
          toast.error('Error: Formato de datos incorrecto');
        }

        if (Array.isArray(response.mappings)) {
          setAreaNivelMappings(response.mappings);
          console.log('✅ Mappings de Area/Nivel cargados:', response.mappings);
        }
      } catch (error) {
        console.error('❌ Error al cargar áreas y niveles:', error);
        toast.error('Error al cargar las áreas y niveles asignados');
        setAreas([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAreasNiveles();
  }, [userId]);

  // Función para mapear competidores
  const mapearCompetidores = (competidoresRaw: Competidor[]) => {
    return competidoresRaw.map(comp => {
      let estadoFinal: 'Pendiente' | 'En Proceso' | 'Calificado' | 'DESCALIFICADO' = 'Pendiente';
      let notaFinal: number | undefined = undefined;
      let observacionesFinal: string | undefined = undefined;
      let idEvaluacionFinal: number | undefined = undefined;
      let idEvaluadorAsignado: number | undefined = undefined;

      if (comp.estado_competidor === 'descalificado') {
        estadoFinal = 'DESCALIFICADO';
        observacionesFinal = comp.observaciones_descalificacion || undefined;
      }

      if (comp.evaluaciones && comp.evaluaciones.length > 0) {
        // Ordenar por id_evaluacion DESC para obtener la más reciente primero
        const evaluacionesOrdenadas = [...comp.evaluaciones].sort(
          (a: any, b: any) => b.id_evaluacion - a.id_evaluacion
        );

        // La evaluación más reciente es la primera en la lista ordenada
        const evaluacionMasReciente = evaluacionesOrdenadas[0];

        if (evaluacionMasReciente) {
          // El estado `true` o `1` significa "Calificado"
          // El estado `false` o `0` significa "En Proceso"
          if (evaluacionMasReciente.estado) {
            estadoFinal = 'Calificado';
            notaFinal = parseFloat(evaluacionMasReciente.nota);
            observacionesFinal = evaluacionMasReciente.observacion || undefined;
            idEvaluacionFinal = evaluacionMasReciente.id_evaluacion;
          } else {
            estadoFinal = 'En Proceso';
            idEvaluacionFinal = evaluacionMasReciente.id_evaluacion;
            idEvaluadorAsignado = evaluacionMasReciente.id_evaluador_an || undefined;
          }
        }
      }

      return {
        ...comp,
        estado: estadoFinal,
        calificacion: notaFinal,
        observaciones: observacionesFinal,
        id_evaluacion: idEvaluacionFinal,
        bloqueado_por: idEvaluadorAsignado,
      };
    });
  };

  // Cargar competidores por id_area e id_nivel
  const cargarCompetidores = async (idCompetencia: number, idArea: number, idNivel: number) => {
    if (!idCompetencia) {
      toast.error('No se ha seleccionado una competencia.');
      setCompetidores([]);
      return;
    }
    try {
      setLoadingCompetidores(true);
      setIdAreaActual(idArea);
      setIdNivelActual(idNivel);

      console.log('🔍 Cargando competidores para:', { idCompetencia, idArea, idNivel });

      const response = await evaluacionService.getCompetidores(idCompetencia, idArea, idNivel);

      if (response.success && response.data.competidores.length > 0) {
        const competidoresMapeados = mapearCompetidores(response.data.competidores);
        setCompetidores(competidoresMapeados);
        toast.success(`Se encontraron ${competidoresMapeados.length} competidores`);
      } else {
        setCompetidores([]);
        toast(`No se encontraron competidores para el área y nivel seleccionados.`, { icon: 'ℹ️' });
      }
    } catch (error) {
      console.error('❌ Error al cargar competidores:', error);
      toast.error('Error al cargar los competidores');
      setCompetidores([]);
    } finally {
      setLoadingCompetidores(false);
    }
  };

  // Actualización silenciosa en segundo plano (sin loading)
  const actualizarEstadosCompetidores = useCallback(async () => {
    if (!idAreaActual || !idNivelActual || !idCompetenciaActual) return;

    try {
      const response = await evaluacionService.getCompetidores(
        idCompetenciaActual,
        idAreaActual,
        idNivelActual
      );

      if (response.success && response.data.competidores.length > 0) {
        const competidoresMapeados = mapearCompetidores(response.data.competidores);

        // Solo actualizar si hay cambios reales para evitar re-renders innecesarios
        setCompetidores(prev => {
          if (JSON.stringify(prev) !== JSON.stringify(competidoresMapeados)) {
            return competidoresMapeados;
          }
          return prev;
        });
      }
    } catch (error) {
      console.error('Error al actualizar estados:', error);
      // No mostrar error al usuario para no interrumpir
    }
  }, [idAreaActual, idNivelActual, idCompetenciaActual]);

  // PASO 1: Crear evaluación al hacer clic en "Calificar"
  const iniciarEvaluacion = async (
    competidor: Competidor,
    idExamen: number,
    idAreaNivel: number
  ): Promise<{ success: boolean; idEvaluacion?: number }> => {
    const mapping = areaNivelMappings.find(m => m.id_area_nivel === idAreaNivel);
    const id_evaluador_an = mapping?.id_evaluador_an;

    if (!id_evaluador_an) {
      toast.error('No se pudo encontrar el ID de asignación del evaluador para esta área/nivel.');
      return { success: false };
    }

    if (!idExamen) {
      console.error('❌ No se recibió idExamen');
      toast.error('No se ha seleccionado un examen para la evaluación');
      return { success: false };
    }

    if (!competidor.id_competidor) {
      console.error('❌ Competidor sin id_competidor');
      toast.error('ID de competidor no válido');
      return { success: false };
    }

    try {
      console.log('🚀 Iniciando evaluación para:', {
        id_competidor: competidor.id_competidor,
        nombre: `${competidor.nombre} ${competidor.apellido}`,
        id_examen: idExamen,
        id_evaluador_an: id_evaluador_an,
      });

      const response = await evaluacionService.crearEvaluacion(idExamen, {
        id_competidor: competidor.id_competidor,
        id_evaluador_an: id_evaluador_an,
      });

      console.log('✅ Evaluación creada exitosamente:', response);

      // Actualizar estado local a "En Proceso"
      setCompetidores(prev =>
        prev.map(c =>
          c.ci === competidor.ci
            ? {
                ...c,
                estado: 'En Proceso' as const,
                id_evaluacion: response.id_evaluacion,
                bloqueado_por: response.id_evaluador_an,
              }
            : c
        )
      );

      return { success: true, idEvaluacion: response.id_evaluacion };
    } catch (error: any) {
      console.error('❌ Error completo al crear evaluación:', {
        error,
        response: error?.response,
        data: error?.response?.data,
        status: error?.response?.status,
      });

      let errorMsg = 'Error al iniciar la evaluación';

      if (error?.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error?.response?.data?.error) {
        errorMsg = error.response.data.error;
      } else if (error?.message) {
        errorMsg = error.message;
      }

      toast.error(errorMsg);
      return { success: false };
    }
  };

  // PASO 2: Finalizar evaluación al hacer clic en "Guardar"
  const guardarEvaluacion = async (
    ci: string,
    nota: number,
    observaciones?: string
  ): Promise<void> => {
    try {
      const competidor = competidores.find(c => c.ci === ci);
      if (!competidor) {
        throw new Error('Competidor no encontrado');
      }

      if (!competidor.id_evaluacion) {
        throw new Error('No se encontró el ID de evaluación');
      }

      console.log('💾 Finalizando evaluación:', {
        id_evaluacion: competidor.id_evaluacion,
        nota,
        observaciones,
      });

      const response = await evaluacionService.finalizarEvaluacion(
        competidor.id_evaluacion,
        {
          nota,
          observaciones: observaciones || '',
        }
      );

      console.log('✅ Evaluación finalizada:', response);

      // Actualizar estado local a "Calificado"
      setCompetidores(prev =>
        prev.map(c =>
          c.ci === ci
            ? {
                ...c,
                calificacion: parseFloat(response.nota),
                observaciones: response.observaciones,
                estado: 'Calificado' as const,
                bloqueado_por: undefined,
              }
            : c
        )
      );
    } catch (error: any) {
      console.error('❌ Error al guardar evaluación:', error);
      const errorMsg = error?.response?.data?.message || 'Error al guardar la evaluación';
      toast.error(errorMsg);
      throw error;
    }
  };

  // MODIFICAR NOTA: Sigue los MISMOS 2 PASOS que calificar
  const modificarNota = async (
    ci: string,
    nuevaNota: number,
    justificacion: string
  ): Promise<void> => {
    const competidor = competidores.find(c => c.ci === ci);
    if (!competidor) {
      throw new Error('Competidor no encontrado');
    }
    const idAreaNivel = areaNivelMappings.find(
      m => m.area === competidor.area && m.nivel === competidor.nivel
    )?.id_area_nivel;

    if (!idAreaNivel) {
      toast.error('No se pudo determinar el área/nivel para la modificación.');
      throw new Error('idAreaNivel no encontrado para modificación');
    }
    
    const mapping = areaNivelMappings.find(m => m.id_area_nivel === idAreaNivel);
    const id_evaluador_an = mapping?.id_evaluador_an;

    if (!id_evaluador_an) {
      toast.error('No se pudo identificar el ID del evaluador para la modificación.');
      throw new Error('ID de evaluador no identificado para modificación');
    }

    if (!idCompetenciaActual) {
      toast.error('No se encontró el ID de competencia');
      throw new Error('ID de competencia no encontrado');
    }

    try {
      if (!competidor.id_competidor) {
        throw new Error('ID de competidor no válido');
      }

      console.log('✏️ PASO 1/2 - Creando nueva evaluación para modificar:', {
        id_competidor: competidor.id_competidor,
        nombre: `${competidor.nombre} ${competidor.apellido}`,
        id_competencia: idCompetenciaActual,
        id_evaluador_an: id_evaluador_an,
        nota_anterior: competidor.calificacion,
        nota_nueva: nuevaNota,
      });

      // PASO 1: Crear nueva evaluación
      // FIXME: modificarNota no tiene un idExamen, se está pasando idCompetenciaActual incorrectamente
      const responseCrear = await evaluacionService.crearEvaluacion(idCompetenciaActual, {
        id_competidor: competidor.id_competidor,
        id_evaluador_an: id_evaluador_an,
      });

      console.log('✅ PASO 1/2 completado - Nueva evaluación creada:', responseCrear);

      // PASO 2: Finalizar evaluación con la nueva nota
      console.log('✏️ PASO 2/2 - Finalizando con nueva nota:', {
        id_evaluacion: responseCrear.id_evaluacion,
        nota: nuevaNota,
        justificacion,
      });

      const responseFinalizar = await evaluacionService.finalizarEvaluacion(
        responseCrear.id_evaluacion,
        {
          nota: nuevaNota,
          observaciones: justificacion,
        }
      );

      console.log('✅ PASO 2/2 completado - Nota modificada:', responseFinalizar);

      // Actualizar estado local
      setCompetidores(prev =>
        prev.map(c =>
          c.ci === ci
            ? {
                ...c,
                calificacion: parseFloat(responseFinalizar.nota),
                observaciones: responseFinalizar.observaciones,
                estado: 'Calificado' as const,
                id_evaluacion: responseFinalizar.id_evaluacion,
                bloqueado_por: undefined,
              }
            : c
        )
      );
    } catch (error: any) {
      console.error('❌ Error al modificar nota:', error);
      const errorMsg = error?.response?.data?.message || 'Error al modificar la nota';
      toast.error(errorMsg);
      throw error;
    }
  };

  const descalificarCompetidor = async (idCompetidor: number, observaciones: string) => {
    const toastId = toast.loading('Descalificando competidor...');
    try {
      await evaluacionService.descalificarCompetidor(idCompetidor, { observaciones });

      setCompetidores(prev =>
        prev.map(c =>
          c.id_competidor === idCompetidor ? { ...c, estado: 'DESCALIFICADO' as const } : c
        )
      );

      toast.success('Competidor descalificado correctamente', { id: toastId });
    } catch (error: any) {
      console.error('❌ Error al descalificar competidor:', error);
      const errorMsg = error?.response?.data?.message || 'Error al descalificar al competidor';
      toast.error(errorMsg, { id: toastId });
      throw error;
    }
  };

  return {
    userId,
    user,
    areas,
    competidores,
    loading,
    loadingCompetidores,
    areaNivelMappings,
    cargarCompetidores,
    actualizarEstadosCompetidores,
    iniciarEvaluacion,
    guardarEvaluacion,
    modificarNota,
    setCompetencia,
    descalificarCompetidor,
  };
};