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

  // Cargar áreas y niveles del evaluador
  useEffect(() => {
    const fetchAreasNiveles = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const response = await evaluacionService.getAreasNivelesByEvaluador(userId);
        setAreas(response.areas);
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

  // Cargar competidores por área y nivel
  const cargarCompetidores = async (idArea: number, idNivel: number) => {
    try {
      setLoadingCompetidores(true);
      const response = await evaluacionService.getCompetidoresByAreaNivel(idArea, idNivel);
      
      if (response.success && response.data.competidores.length > 0) {
        // Extraer id_olimpiada del primer competidor
        const primerCompetidor = response.data.competidores[0];
        const idOlimpiada = primerCompetidor.id_olimpiada;
        
        if (idOlimpiada) {
          setIdCompetenciaActual(idOlimpiada);
          console.log('🏆 ID Competencia actual:', idOlimpiada);
        }

        const competidoresMapeados = response.data.competidores.map((comp) => {
          // Verificar si tiene evaluaciones
          let estadoFinal: 'Pendiente' | 'En Proceso' | 'Calificado' = 'Pendiente';
          let notaFinal: number | undefined = undefined;
          let observacionesFinal: string | undefined = undefined;
          let idEvaluacionFinal: number | undefined = undefined;
          let idEvaluadorAsignado: number | undefined = undefined;

          if (comp.evaluaciones && comp.evaluaciones.length > 0) {
            // Buscar evaluación "Calificado" (estado = "1" o "Calificado")
            const evaluacionCalificada = comp.evaluaciones.find(
              ev => ev.estado === "1" || ev.estado === "Calificado" || parseFloat(ev.nota) > 0
            );

            // Buscar evaluación "En Proceso"
            const evaluacionEnProceso = comp.evaluaciones.find(
              ev => ev.estado === "En Proceso"
            );

            if (evaluacionCalificada) {
              estadoFinal = 'Calificado';
              notaFinal = parseFloat(evaluacionCalificada.nota);
              observacionesFinal = evaluacionCalificada.observaciones || undefined;
              idEvaluacionFinal = evaluacionCalificada.id_evaluacion;
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

  // PASO 1: Crear evaluación al hacer clic en "Calificar"
  const iniciarEvaluacion = async (competidor: Competidor): Promise<{ success: boolean; idEvaluacion?: number }> => {
    if (!userId) {
      toast.error('No se pudo identificar el usuario');
      return { success: false };
    }

    if (!idCompetenciaActual) {
      toast.error('No se encontró el ID de competencia');
      return { success: false };
    }

    if (!competidor.id_competidor) {
      toast.error('ID de competidor no válido');
      return { success: false };
    }

    try {
      console.log('🚀 Iniciando evaluación para:', {
        id_competidor: competidor.id_competidor,
        nombre: `${competidor.nombre} ${competidor.apellido}`,
        id_competencia: idCompetenciaActual,
      });

      // Llamar al API para crear evaluación
      const response = await evaluacionService.crearEvaluacion(idCompetenciaActual, {
        id_competidor: competidor.id_competidor,
        id_evaluadorAN: userId, // Usar el ID del usuario logueado
      });

      console.log('✅ Evaluación creada:', response);

      // Guardar el id_evaluadorAN del response
      setIdEvaluadorAN(response.id_evaluadorAN);

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
      console.error('❌ Error al crear evaluación:', error);
      const errorMsg = error?.response?.data?.message || 'Error al iniciar la evaluación';
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

      // Llamar al API para finalizar evaluación
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

  // Función para recargar competidores (útil para actualizar estados)
  const recargarCompetidores = async () => {
    const areaActual = parseInt(areas.find(a => a.id_area)?.id_area.toString() || '0');
    const nivelActual = parseInt(areas[0]?.niveles[0]?.id_nivel.toString() || '0');
    
    if (areaActual && nivelActual) {
      await cargarCompetidores(areaActual, nivelActual);
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
    iniciarEvaluacion,
    guardarEvaluacion,
    recargarCompetidores,
  };
};