import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { salaService } from '../services/salaService';
import { useAuth } from '@/auth/login/hooks/useAuth';
import { echo } from '@/lib/echo';
import type { CompetidorSala } from '../types/sala.types';

type EventoBloqueo = {
  id_evaluacion: number;
  bloqueado_por: number;
  nombre_juez?: string;
  estado: string;
};

type EventoLiberacion = {
  id_evaluacion: number;
  nueva_nota: number;
  esta_calificado: boolean;
};

export function useSalaEvaluacion() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);
  const [selectedNivelId, setSelectedNivelId] = useState<number | null>(null); 
  const [selectedExamenId, setSelectedExamenId] = useState<number | null>(null);

  const areasQuery = useQuery({
    queryKey: ['salaAreas', userId],
    queryFn: () => salaService.obtenerAreasNiveles(userId!),
    enabled: !!userId,
  });

  const examenesQuery = useQuery({
    queryKey: ['salaExamenes', selectedNivelId],
    queryFn: () => salaService.obtenerExamenes(selectedNivelId!),
    enabled: !!selectedNivelId,
  });

  const competidoresQuery = useQuery({
    queryKey: ['salaCompetidores', selectedExamenId],
    queryFn: () => salaService.obtenerCompetidores(selectedExamenId!),
    enabled: !!selectedExamenId,
    staleTime: Infinity,
  });

  const descalificadosQuery = useQuery({
    queryKey: ['descalificados'],
    queryFn: salaService.obtenerDescalificados,
  });

  // WebSockets
  useEffect(() => {
    if (!selectedExamenId) return;

    console.log(`🔌 Conectando al canal: private-examen.${selectedExamenId}`);
    const channel = echo.private(`examen.${selectedExamenId}`);

    channel
      .listen('.CompetidorBloqueado', (e: EventoBloqueo) => {
        console.log('🔒 BLOQUEO recibido:', e);
        
        queryClient.setQueryData<CompetidorSala[]>(['salaCompetidores', selectedExamenId], (oldData) => {
          if (!oldData) return [];

          return oldData.map(comp => {
            if (Number(comp.id_evaluacion) === Number(e.id_evaluacion)) {
              console.log(`--> Actualizando UI para competidor ${comp.nombre_completo}`);
              return { 
                ...comp, 
                estado_evaluacion: 'Calificando', 
                es_bloqueado: true,               
                bloqueado_por_mi: false,          
              };
            }
            return comp;
          });
        });
      })

      .listen('.CompetidorLiberado', (e: EventoLiberacion) => {
        console.log('🔓 LIBERACIÓN recibida:', e);
        
        queryClient.setQueryData<CompetidorSala[]>(['salaCompetidores', selectedExamenId], (oldData) => {
          if (!oldData) return [];

          return oldData.map(comp => {
            if (Number(comp.id_evaluacion) === Number(e.id_evaluacion)) {
              console.log(`--> Liberando competidor ${comp.nombre_completo} con nota ${e.nueva_nota}`);
              return { 
                ...comp, 
                estado_evaluacion: e.esta_calificado ? 'Calificado' : 'Sin calificar',
                es_bloqueado: false, 
                nota_actual: e.nueva_nota,
                bloqueado_por_mi: false
              };
            }
            return comp;
          });
        });
      });

    return () => {
      echo.leave(`examen.${selectedExamenId}`);
    };
  }, [selectedExamenId, queryClient]);

  const competidoresProcesados = useMemo(() => {
    if (!competidoresQuery.data) return [];
    
    const listaDescalificados = descalificadosQuery.data || [];
    const idsDescalificados = new Set(listaDescalificados.map(d => d.id_competidor));

    return competidoresQuery.data.map(comp => {
      if (idsDescalificados.has(comp.id_competidor)) {
        return {
          ...comp,
          estado_evaluacion: 'Descalificado',
          nota_actual: 0,
          es_bloqueado: false
        } as CompetidorSala;
      }
      return comp;
    });
  }, [competidoresQuery.data, descalificadosQuery.data]);

  // Mutaciones
  const bloquearMutation = useMutation({
    mutationFn: (idEvaluacion: number) => salaService.bloquearCompetidor(idEvaluacion, userId!),
    
    onSuccess: (_, idEvaluacion) => {
      queryClient.setQueryData<CompetidorSala[]>(['salaCompetidores', selectedExamenId], (oldData) => {
        if (!oldData) return [];
        
        return oldData.map(comp => {
          if (comp.id_evaluacion === idEvaluacion) {
            return { 
              ...comp, 
              estado_evaluacion: 'Calificando', 
              es_bloqueado: true,
              bloqueado_por_mi: true
            };
          }
          return comp;
        });
      });
      toast.success('Ficha bloqueada para ti');
    },
    
    onError: () => { 
      toast.error('No se pudo bloquear');
      queryClient.invalidateQueries({ queryKey: ['salaCompetidores', selectedExamenId] });
    }
  });

  const guardarMutation = useMutation({
    mutationFn: ({ idEvaluacion, payload }: { idEvaluacion: number, payload: any }) => 
      salaService.guardarNota(idEvaluacion, payload),
    onSuccess: (_, variables) => {
      queryClient.setQueryData<CompetidorSala[]>(['salaCompetidores', selectedExamenId], (oldData) => {
        if (!oldData) return [];
        return oldData.map(comp => {
          if (comp.id_evaluacion === variables.idEvaluacion) {
            return { 
              ...comp, 
              estado_evaluacion: 'Calificado',
              es_bloqueado: false,
              bloqueado_por_mi: false,
              nota_actual: variables.payload.nota
            };
          }
          return comp;
        });
      });
      toast.success('Nota guardada');
    },
    onError: () => toast.error('Error al guardar nota')
  });

  const desbloquearMutation = useMutation({
    mutationFn: (idEvaluacion: number) => salaService.desbloquearCompetidor(idEvaluacion, userId!),
    onSuccess: (_, idEvaluacion) => {
      queryClient.setQueryData<CompetidorSala[]>(['salaCompetidores', selectedExamenId], (oldData) => {
        if (!oldData) return [];
        return oldData.map(comp => {
          if (comp.id_evaluacion === idEvaluacion) {
            return { 
              ...comp, 
              es_bloqueado: false, 
              bloqueado_por_mi: false 
            };
          }
          return comp;
        });
      });
    }
  });

  // ✅ DESCALIFICACIÓN DESDE EL MODAL (Recibe solo idEvaluacion y motivo)
  const descalificarDesdeModalMutation = useMutation({
    mutationFn: ({ idEvaluacion, motivo }: { idEvaluacion: number, motivo: string }) => 
      salaService.descalificarCompetidor(idEvaluacion, userId!, motivo),

    onSuccess: (_, variables) => {
      // Actualizar UI optimista
      queryClient.setQueryData<CompetidorSala[]>(['salaCompetidores', selectedExamenId], (oldData) => {
        if (!oldData) return [];
        return oldData.map(comp => {
          if (comp.id_evaluacion === variables.idEvaluacion) {
            return { 
              ...comp, 
              estado_evaluacion: 'Descalificado',
              nota_actual: 0,
              es_bloqueado: false,
              bloqueado_por_mi: false
            };
          }
          return comp;
        });
      });

      // Invalidar queries
      queryClient.invalidateQueries({ queryKey: ['descalificados'] });
      queryClient.invalidateQueries({ queryKey: ['salaCompetidores', selectedExamenId] });
      toast.success('Competidor descalificado correctamente');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'No se pudo descalificar'),
  });

  // ✅ DESCALIFICACIÓN DESDE LA TABLA (Recibe competidor completo)
  const descalificarMutation = useMutation({
    mutationFn: ({ idEvaluacion, motivo }: { idEvaluacion: number, motivo: string }) => 
      salaService.descalificarCompetidor(idEvaluacion, userId!, motivo),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['descalificados'] });
      queryClient.invalidateQueries({ queryKey: ['salaCompetidores', selectedExamenId] });
      toast.success('Competidor descalificado');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'No se pudo descalificar'),
  });

  return {
    areas: areasQuery.data || [],
    examenes: examenesQuery.data || [],
    competidores: competidoresProcesados,
    
    isLoadingEstructura: areasQuery.isLoading || examenesQuery.isLoading,
    isLoadingCompetidores: competidoresQuery.isLoading,

    filtros: {
      areaId: selectedAreaId,
      nivelId: selectedNivelId,
      examenId: selectedExamenId
    },
    setters: {
      setAreaId: setSelectedAreaId,
      setNivelId: setSelectedNivelId,
      setExamenId: setSelectedExamenId
    },
    acciones: {
      bloquear: bloquearMutation,
      guardar: guardarMutation,
      desbloquear: desbloquearMutation,
      descalificar: descalificarMutation, // Desde la tabla
      descalificarDesdeModal: descalificarDesdeModalMutation // Desde el modal
    }
  };
}