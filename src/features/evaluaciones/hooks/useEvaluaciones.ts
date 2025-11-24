// src/features/evaluaciones/hooks/useEvaluaciones.ts

import { useState, useEffect } from 'react';
import { useAuth } from '@/auth/login/hooks/useAuth';
import { evaluacionService } from '../services/evaluacionService';
import type { Area, Competidor } from '../types/evaluacion.types';
import toast from 'react-hot-toast';

export const useEvaluaciones = () => {
  const { userId, user } = useAuth();
  const [areas, setAreas] = useState<Area[]>([]);
  const [competidores, setCompetidores] = useState<Competidor[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCompetidores, setLoadingCompetidores] = useState(false);
  const [idCompetenciaActual, setIdCompetenciaActual] = useState<number | null>(null);
  const [idEvaluadorAN, setIdEvaluadorAN] = useState<number | null>(null);
  const [areaActual, setAreaActual] = useState<number | null>(null);
  const [nivelActual, setNivelActual] = useState<number | null>(null);

  // Cargar áreas y niveles del evaluador
  useEffect(() => {
    const fetchAreasNiveles = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const response = await evaluacionService.getAreasNivelesByEvaluador(userId);
        setAreas(response.areas);
        
        // 👇 GUARDAR id_evaluador del backend
        if (response.evaluador?.id_evaluador) {
          setIdEvaluadorAN(response.evaluador.id_evaluador);
          console.log('🆔 ID Evaluador obtenido:', response.evaluador.id_evaluador);
        }
        
        console.log('📚 Áreas y niveles cargadas:', response);
      } catch (error) {
        console.error('Error al cargar áreas y niveles:', error);
        toast.error('Error al cargar las áreas y niveles asignados');
      } finally {
        setLoading(false);
      }
    };

    fetchAreasNiveles();
  }, [userId]);

  // Función para mapear competidores
  const mapearCompetidores = (competidoresRaw: any[]) => {
    return competidoresRaw.map((comp) => {
      let estadoFinal: 'Pendiente' | 'En Proceso' | 'Calificado' = 'Pendiente';
      let notaFinal: number | undefined = undefined;
      let observacionesFinal: string | undefined = undefined;
      let idEvaluacionFinal: number | undefined = undefined;
      let idEvaluadorAsignado: number | undefined = undefined;

      if (comp.evaluaciones && comp.evaluaciones.length > 0) {
        // 👇 ORDENAR por id_evaluacion DESC para obtener la MÁS RECIENTE primero
        const evaluacionesOrdenadas = [...comp.evaluaciones].sort(
          (a: any, b: any) => b.id_evaluacion - a.id_evaluacion
        );

        // Buscar la evaluación más reciente que esté calificada
        const evaluacionCalificada = evaluacionesOrdenadas.find(
          (ev: any) => ev.estado === "1" || ev.estado === "Calificado" || parseFloat(ev.nota) > 0
        );

        // Buscar si hay alguna evaluación en proceso
        const evaluacionEnProceso = evaluacionesOrdenadas.find(
          (ev: any) => ev.estado === "En Proceso"
        );

        if (evaluacionCalificada) {
          estadoFinal = 'Calificado';
          notaFinal = parseFloat(evaluacionCalificada.nota);
          observacionesFinal = evaluacionCalificada.observaciones || undefined;
          idEvaluacionFinal = evaluacionCalificada.id_evaluacion;
          
          console.log(`📊 Competidor ${comp.nombre} ${comp.apellido}:`, {
            total_evaluaciones: comp.evaluaciones.length,
            id_evaluacion_mas_reciente: evaluacionCalificada.id_evaluacion,
            nota_mostrada: notaFinal,
          });
        } else if (evaluacionEnProceso) {
          estadoFinal = 'En Proceso';
          idEvaluacionFinal = evaluacionEnProceso.id_evaluacion;
          idEvaluadorAsignado = evaluacionEnProceso.id_evaluadorAN || undefined;
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

  // Cargar competidores por área y nivel
  const cargarCompetidores = async (idArea: number, idNivel: number) => {
    try {
      setLoadingCompetidores(true);
      setAreaActual(idArea);
      setNivelActual(idNivel);
      
      const response = await evaluacionService.getCompetidoresByAreaNivel(idArea, idNivel);
      
      if (response.success && response.data.competidores.length > 0) {
        const primerCompetidor = response.data.competidores[0];
        const idOlimpiada = primerCompetidor.id_olimpiada;
        
        if (idOlimpiada) {
          setIdCompetenciaActual(idOlimpiada);
          console.log('🏆 ID Competencia actual:', idOlimpiada);
        }

        const competidoresMapeados = mapearCompetidores(response.data.competidores);
        setCompetidores(competidoresMapeados);
        toast.success(`Se encontraron ${competidoresMapeados.length} competidores`);
      } else {
        setCompetidores([]);
        setIdCompetenciaActual(null);
        toast(`No se encontraron competidores`, { icon: 'ℹ️' });
      }
    } catch (error) {
      console.error('Error al cargar competidores:', error);
      toast.error('Error al cargar los competidores');
      setCompetidores([]);
      setIdCompetenciaActual(null);
    } finally {
      setLoadingCompetidores(false);
    }
  };

  // Actualización silenciosa en segundo plano (sin loading)
  const actualizarEstadosCompetidores = async () => {
    if (!areaActual || !nivelActual) return;

    try {
      const response = await evaluacionService.getCompetidoresByAreaNivel(areaActual, nivelActual);
      
      if (response.success && response.data.competidores.length > 0) {
        const competidoresMapeados = mapearCompetidores(response.data.competidores);
        
        // Solo actualizar si hay cambios reales
        setCompetidores(prev => {
          const hayDiferencias = prev.some((prevComp, index) => {
            const nuevoComp = competidoresMapeados[index];
            return prevComp.estado !== nuevoComp?.estado || 
                   prevComp.calificacion !== nuevoComp?.calificacion;
          });
          
          return hayDiferencias ? competidoresMapeados : prev;
        });
      }
    } catch (error) {
      console.error('Error al actualizar estados:', error);
      // No mostrar error al usuario para no interrumpir
    }
  };

  // PASO 1: Crear evaluación al hacer clic en "Calificar"
  const iniciarEvaluacion = async (competidor: Competidor): Promise<{ success: boolean; idEvaluacion?: number }> => {
    // ✅ Validar que tenemos el id_evaluador
    if (!idEvaluadorAN) {
      console.error('❌ No se encontró idEvaluadorAN');
      toast.error('No se pudo identificar el ID del evaluador');
      return { success: false };
    }

    if (!idCompetenciaActual) {
      console.error('❌ No se encontró idCompetenciaActual');
      toast.error('No se encontró el ID de competencia');
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
        id_competencia: idCompetenciaActual,
        id_evaluadorAN: idEvaluadorAN,
      });

      // 👇 HACER LA PETICIÓN POST
      const response = await evaluacionService.crearEvaluacion(idCompetenciaActual, {
        id_competidor: competidor.id_competidor,
        id_evaluadorAN: idEvaluadorAN,
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
                bloqueado_por: response.id_evaluadorAN,
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

      toast.success('Evaluación guardada exitosamente');
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
    if (!idEvaluadorAN) {
      toast.error('No se pudo identificar el ID del evaluador');
      throw new Error('ID de evaluador no identificado');
    }

    if (!idCompetenciaActual) {
      toast.error('No se encontró el ID de competencia');
      throw new Error('ID de competencia no encontrado');
    }

    try {
      const competidor = competidores.find(c => c.ci === ci);
      if (!competidor) {
        throw new Error('Competidor no encontrado');
      }

      if (!competidor.id_competidor) {
        throw new Error('ID de competidor no válido');
      }

      console.log('✏️ PASO 1/2 - Creando nueva evaluación para modificar:', {
        id_competidor: competidor.id_competidor,
        nombre: `${competidor.nombre} ${competidor.apellido}`,
        id_competencia: idCompetenciaActual,
        id_evaluadorAN: idEvaluadorAN,
        nota_anterior: competidor.calificacion,
        nota_nueva: nuevaNota,
      });

      // PASO 1: Crear nueva evaluación
      const responseCrear = await evaluacionService.crearEvaluacion(idCompetenciaActual, {
        id_competidor: competidor.id_competidor,
        id_evaluadorAN: idEvaluadorAN,
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

      toast.success('Nota modificada exitosamente');
    } catch (error: any) {
      console.error('❌ Error al modificar nota:', error);
      const errorMsg = error?.response?.data?.message || 'Error al modificar la nota';
      toast.error(errorMsg);
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
    idEvaluadorAN,
    cargarCompetidores,
    actualizarEstadosCompetidores,
    iniciarEvaluacion,
    guardarEvaluacion,
    modificarNota,
  };
};