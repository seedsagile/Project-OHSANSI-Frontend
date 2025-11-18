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

  // Cargar áreas y niveles del evaluador
  useEffect(() => {
    const fetchAreasNiveles = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const response = await evaluacionService.getAreasNivelesByEvaluador(userId);
        setAreas(response.areas);
        console.log('Áreas y niveles cargadas:', response);
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
        const competidoresMapeados = response.data.competidores.map((comp) => {
          // Buscar evaluación con estado "1" (finalizada) o con nota > 0
          const evaluacionFinalizada = comp.evaluaciones?.find(
            ev => ev.estado === "1" || parseFloat(ev.nota) > 0
          );
          
          const tieneEvaluacion = !!evaluacionFinalizada;
          
          return {
            ...comp,
            // Si tiene evaluación finalizada, está calificado
            estado: tieneEvaluacion ? ('Calificado' as const) : ('Pendiente' as const),
            // Extraer la nota (convertir string a number)
            calificacion: evaluacionFinalizada ? parseFloat(evaluacionFinalizada.nota) : undefined,
            // Extraer las observaciones
            observaciones: evaluacionFinalizada?.observaciones || undefined,
            // Guardar el ID de la evaluación finalizada
            id_evaluacion: evaluacionFinalizada?.id_evaluacion,
          };
        });
        
        setCompetidores(competidoresMapeados);
        toast.success(`Se encontraron ${competidoresMapeados.length} competidores`);
      } else {
        setCompetidores([]);
        toast(`No se encontraron competidores`, { icon: 'ℹ️' });
      }
    } catch (error) {
      console.error('Error al cargar competidores:', error);
      toast.error('Error al cargar los competidores');
      setCompetidores([]);
    } finally {
      setLoadingCompetidores(false);
    }
  };

  // Función placeholder para guardar (no hace nada por ahora)
  const guardarEvaluacion = async (
    ci: string,
    nota: number,
    observaciones?: string
  ): Promise<void> => {
    console.log('📝 Guardando evaluación (placeholder):', { ci, nota, observaciones });
    toast.success('Evaluación guardada (modo prueba)');
    
    // Actualizar localmente para mostrar la nota
    setCompetidores(prev =>
      prev.map(c =>
        c.ci === ci
          ? { 
              ...c, 
              calificacion: nota, 
              observaciones, 
              estado: 'Calificado' as const
            }
          : c
      )
    );
  };

  return {
    userId,
    user,
    areas,
    competidores,
    loading,
    loadingCompetidores,
    cargarCompetidores,
    guardarEvaluacion,
  };
};