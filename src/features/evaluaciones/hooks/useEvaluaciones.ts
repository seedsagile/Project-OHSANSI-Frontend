// src/features/evaluaciones/hooks/useEvaluaciones.ts

import { useState, useEffect } from 'react';
import { useAuth } from '@/auth/login/hooks/useAuth';
import { evaluacionService } from '../services/evaluacionService';
import type { Area, Competidor, CalificacionData } from '../types/evaluacion.types';
import toast from 'react-hot-toast';

export const useEvaluaciones = () => {
  const { userId, user } = useAuth();
  const [areas, setAreas] = useState<Area[]>([]);
  const [competidores, setCompetidores] = useState<Competidor[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCompetidores, setLoadingCompetidores] = useState(false);

  // Cargar áreas y niveles del evaluador al montar el componente
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
        setCompetidores(response.data.competidores);
        toast.success(`Se encontraron ${response.data.competidores.length} competidores`);
      } else {
        setCompetidores([]);
        toast.info(response.message || 'No se encontraron competidores');
      }
    } catch (error) {
      console.error('Error al cargar competidores:', error);
      toast.error('Error al cargar los competidores');
      setCompetidores([]);
    } finally {
      setLoadingCompetidores(false);
    }
  };

  // Guardar evaluación
  const guardarEvaluacion = async (
    idCompetidor: number,
    nota: number,
    observaciones?: string
  ) => {
    try {
      // TODO: Verificar con backend qué ID debe ir en la URL (idCompetencia)
      // Por ahora usamos 1 como placeholder
      const idCompetencia = 1;
      
      // TODO: Verificar qué es id_evaluadorAN
      // Por ahora usamos 1 como placeholder
      const data: CalificacionData = {
        nota,
        observaciones: observaciones || '',
        id_competidor: idCompetidor,
        id_evaluadorAN: 1,
        estado: false,
      };

      const response = await evaluacionService.guardarEvaluacion(idCompetencia, data);
      
      // Actualizar el estado del competidor en la lista
      setCompetidores(prev =>
        prev.map(c =>
          c.id_competidor === idCompetidor
            ? { ...c, calificacion: nota, observaciones, estado: 'Calificado' as const }
            : c
        )
      );

      toast.success('Evaluación guardada exitosamente');
      return response;
    } catch (error) {
      console.error('Error al guardar evaluación:', error);
      toast.error('Error al guardar la evaluación');
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
    cargarCompetidores,
    guardarEvaluacion,
  };
};