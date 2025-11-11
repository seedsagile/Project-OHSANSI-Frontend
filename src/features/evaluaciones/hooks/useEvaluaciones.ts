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
        // Mapear competidores y agregar estado "Pendiente" por defecto
        const competidoresMapeados = response.data.competidores.map((comp, index) => ({
          ...comp,
          id_competidor: index + 1, // Generar ID temporal si no viene del backend
          estado: comp.estado || ('Pendiente' as const), // Estado por defecto
        }));
        
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

  // Marcar competidor como "En calificación"
  const marcarEnCalificacion = (ci: string) => {
    setCompetidores(prev =>
      prev.map(c =>
        c.ci === ci
          ? { ...c, estado: 'En calificacion' as const }
          : c
      )
    );
  };

  // Guardar evaluación
  const guardarEvaluacion = async (
    ci: string,
    nota: number,
    observaciones?: string
  ): Promise<void> => {
    try {
      const idFase = 1; // Fase 1 por defecto
      
      // Buscar el competidor por CI
      const competidor = competidores.find(c => c.ci === ci);
      if (!competidor) {
        throw new Error('Competidor no encontrado');
      }

      // Verificar que no esté siendo calificado por otro evaluador
      if (competidor.estado === 'En calificacion') {
        toast.error('Este competidor está siendo calificado por otro evaluador');
        throw new Error('Competidor en proceso de calificación');
      }

      // Verificar que no esté ya calificado
      if (competidor.estado === 'Calificado') {
        toast.error('Este competidor ya ha sido calificado');
        throw new Error('Competidor ya calificado');
      }
      
      const data: CalificacionData = {
        nota,
        observaciones: observaciones || '',
        id_competidor: competidor.id_competidor || 0, // TODO: Verificar con backend
        id_evaluadorAN: 1, // TODO: Verificar con backend
        estado: false,
      };

      await evaluacionService.guardarEvaluacion(idFase, data);
      
      // Actualizar el estado del competidor a "Calificado"
      setCompetidores(prev =>
        prev.map(c =>
          c.ci === ci
            ? { ...c, calificacion: nota, observaciones, estado: 'Calificado' as const }
            : c
        )
      );

      toast.success('Evaluación guardada exitosamente');
    } catch (error) {
      // Si hay error, volver el estado a "Pendiente"
      setCompetidores(prev =>
        prev.map(c =>
          c.ci === ci
            ? { ...c, estado: 'Pendiente' as const }
            : c
        )
      );
      
      console.error('Error al guardar evaluación:', error);
      if (error instanceof Error) {
        if (!error.message.includes('siendo calificado') && !error.message.includes('ya calificado')) {
          toast.error('Error al guardar la evaluación');
        }
      }
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
    marcarEnCalificacion,
    guardarEvaluacion,
  };
};