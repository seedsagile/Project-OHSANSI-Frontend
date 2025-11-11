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

  // Guardar evaluación
  const guardarEvaluacion = async (
    ci: string, // Cambiado a CI en lugar de id_competidor
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
      
      const data: CalificacionData = {
        nota,
        observaciones: observaciones || '',
        id_competidor: competidor.id_competidor || 0, // TODO: Verificar con backend
        id_evaluadorAN: 1, // TODO: Verificar con backend
        estado: false,
      };

      await evaluacionService.guardarEvaluacion(idFase, data);
      
      // Actualizar el estado del competidor en la lista
      setCompetidores(prev =>
        prev.map(c =>
          c.ci === ci
            ? { ...c, calificacion: nota, observaciones, estado: 'Calificado' as const }
            : c
        )
      );

      toast.success('Evaluación guardada exitosamente');
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