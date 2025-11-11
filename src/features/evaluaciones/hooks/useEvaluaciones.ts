// src/features/evaluaciones/hooks/useEvaluaciones.ts

import { useState, useEffect } from 'react';
import { useAuth } from '@/auth/login/hooks/useAuth';
import { evaluacionService } from '../services/evaluacionService';
import type { Area, Competidor, CalificacionData } from '../types/evaluacion.types';
import toast from 'react-hot-toast';
import { ConcurrenciaLocal } from '../utils/concurrenciaLocal';

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
        const competidoresMapeados = response.data.competidores.map((comp, index) => ({
          ...comp,
          id_competidor: index + 1,
          estado: comp.estado || ('Pendiente' as const),
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

 // Modificar la función intentarBloquear:
const intentarBloquear = async (ci: string): Promise<boolean> => {
  if (!userId) return false;

  try {
    // Limpiar bloqueos vencidos primero
    ConcurrenciaLocal.limpiarVencidos();

    // Verificar bloqueo local
    if (ConcurrenciaLocal.estaBloqueado(ci, userId)) {
      toast.error('Este competidor está siendo calificado por otro evaluador');
      return false;
    }

    // Intentar bloquear localmente
    const bloqueadoLocal = ConcurrenciaLocal.bloquear(ci, userId);
    
    if (!bloqueadoLocal) {
      toast.error('Este competidor está siendo calificado por otro evaluador');
      return false;
    }

    // Actualizar estado local
    setCompetidores(prev =>
      prev.map(c =>
        c.ci === ci
          ? { ...c, estado: 'En calificacion' as const, bloqueado_por: userId }
          : c
      )
    );
    
    return true;
  } catch (error) {
    console.error('Error al intentar bloquear:', error);
    return false;
  }
};

// Modificar desbloquearCompetidor:
const desbloquearCompetidor = async (ci: string) => {
  if (!userId) return;

  try {
    // Desbloquear localmente
    ConcurrenciaLocal.desbloquear(ci);

    // Actualizar estado local
    setCompetidores(prev =>
      prev.map(c =>
        c.ci === ci && c.estado !== 'Calificado'
          ? { ...c, estado: 'Pendiente' as const, bloqueado_por: undefined }
          : c
      )
    );
  } catch (error) {
    console.error('Error al desbloquear:', error);
  }
};

  // Guardar evaluación
  const guardarEvaluacion = async (
    ci: string,
    nota: number,
    observaciones?: string
  ): Promise<void> => {
    try {
      const idFase = 1;
      
      const competidor = competidores.find(c => c.ci === ci);
      if (!competidor) {
        throw new Error('Competidor no encontrado');
      }

      // Verificar que esté bloqueado por este evaluador
      if (competidor.bloqueado_por && competidor.bloqueado_por !== userId) {
        toast.error('Este competidor está siendo calificado por otro evaluador');
        throw new Error('Competidor bloqueado por otro evaluador');
      }
      
      const data: CalificacionData = {
        nota,
        observaciones: observaciones || '',
        id_competidor: competidor.id_competidor || 0,
        id_evaluadorAN: 1,
        estado: false,
      };

      await evaluacionService.guardarEvaluacion(idFase, data);
      
      // Actualizar a "Calificado" y desbloquear
      setCompetidores(prev =>
        prev.map(c =>
          c.ci === ci
            ? { 
                ...c, 
                calificacion: nota, 
                observaciones, 
                estado: 'Calificado' as const,
                bloqueado_por: undefined 
              }
            : c
        )
      );

      // Desbloquear en el backend
      await desbloquearCompetidor(ci);

      toast.success('Evaluación guardada exitosamente');
    } catch (error) {
      console.error('Error al guardar evaluación:', error);
      
      if (error instanceof Error) {
        if (!error.message.includes('bloqueado')) {
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
    intentarBloquear,
    desbloquearCompetidor,
    guardarEvaluacion,
  };
};