import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { salaService } from '../services/salaService';
import { useAuth } from '@/auth/login/hooks/useAuth';
import { echo } from '@/lib/echo'; // Asegúrate de que echo esté configurado correctamente
import type { CompetidorSala } from '../types/sala.types';

// Tipos de los eventos de WebSocket
type EventoBloqueo = {
  id_evaluacion: number;
  bloqueado_por: number;
  nombre_juez?: string;
  estado: string; // El backend envía "BLOQUEADO"
};

type EventoLiberacion = {
  id_evaluacion: number;
  nueva_nota: number;
  esta_calificado: boolean;
};

export function useSalaEvaluacion() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  // Estados de Selección
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);
  const [selectedNivelId, setSelectedNivelId] = useState<number | null>(null); 
  const [selectedExamenId, setSelectedExamenId] = useState<number | null>(null);

  // 1. Cargar Estructura (Áreas/Niveles)
  const areasQuery = useQuery({
    queryKey: ['salaAreas', userId],
    queryFn: () => salaService.obtenerAreasNiveles(userId!),
    enabled: !!userId,
  });

  // 2. Cargar Exámenes (cuando hay nivel)
  const examenesQuery = useQuery({
    queryKey: ['salaExamenes', selectedNivelId],
    queryFn: () => salaService.obtenerExamenes(selectedNivelId!),
    enabled: !!selectedNivelId,
  });

  // 3. Cargar Competidores (La Pizarra)
  const competidoresQuery = useQuery({
    queryKey: ['salaCompetidores', selectedExamenId],
    queryFn: () => salaService.obtenerCompetidores(selectedExamenId!),
    enabled: !!selectedExamenId,
    staleTime: Infinity, // Importante: Evitar refetch automático que rompa la experiencia
  });

  // 4. 📻 WEBSOCKETS (CORREGIDO)
  useEffect(() => {
    if (!selectedExamenId) return;

    console.log(`🔌 Conectando al canal: private-examen.${selectedExamenId}`);
    const channel = echo.private(`examen.${selectedExamenId}`);

    channel
      .listen('.CompetidorBloqueado', (e: EventoBloqueo) => {
        console.log('🔒 BLOQUEO recibido:', e);
        
        // Usamos el tipo correcto en oldData
        queryClient.setQueryData<CompetidorSala[]>(['salaCompetidores', selectedExamenId], (oldData) => {
          if (!oldData) return []; // Protección contra undefined

          return oldData.map(comp => {
            // Comparamos IDs asegurando que sean del mismo tipo (números)
            if (Number(comp.id_evaluacion) === Number(e.id_evaluacion)) {
              console.log(`--> Actualizando UI para competidor ${comp.nombre_completo}`); // Debug visual
              return { 
                ...comp, 
                estado_evaluacion: 'Calificando', 
                es_bloqueado: true,               
                bloqueado_por_mi: false,          
                // Importante: Asegurar que nombre_juez_bloqueo exista en tu tipo si lo usas
                // nombre_juez_bloqueo: e.nombre_juez 
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
  }, [selectedExamenId, queryClient]); // Dependencias correctas

  // 5. Mutaciones
  const bloquearMutation = useMutation({
    mutationFn: (idEvaluacion: number) => salaService.bloquearCompetidor(idEvaluacion, userId!),
    
    onSuccess: (_, idEvaluacion) => {
      // 1. Como el WebSocket no me avisará a mí (por toOthers),
      // actualizo mi propia tabla manualmente aquí.
      queryClient.setQueryData<CompetidorSala[]>(['salaCompetidores', selectedExamenId], (oldData) => {
        if (!oldData) return [];
        
        return oldData.map(comp => {
          if (comp.id_evaluacion === idEvaluacion) {
            return { 
              ...comp, 
              estado_evaluacion: 'Calificando', 
              es_bloqueado: true,
              bloqueado_por_mi: true // <--- ¡Esto es clave para tu UI!
            };
          }
          return comp;
        });
      });
      toast.success('Ficha bloqueada para ti');
    },
    
    onError: (err: any) => {
       toast.error('No se pudo bloquear');
       // Si falla, recargamos la lista por seguridad
       queryClient.invalidateQueries({ queryKey: ['salaCompetidores', selectedExamenId] });
    }
  });

  const guardarMutation = useMutation({
    mutationFn: ({ idEvaluacion, payload }: { idEvaluacion: number, payload: any }) => 
      salaService.guardarNota(idEvaluacion, payload),
    // ✅ AGREGAMOS ESTO:
    onSuccess: (_, variables) => {
      queryClient.setQueryData<CompetidorSala[]>(['salaCompetidores', selectedExamenId], (oldData) => {
        if (!oldData) return [];
        return oldData.map(comp => {
          if (comp.id_evaluacion === variables.idEvaluacion) {
            return { 
              ...comp, 
              // Asumimos que si guardó nota, ya está calificado
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

  const descalificarMutation = useMutation({
    mutationFn: ({ idEvaluacion, motivo }: { idEvaluacion: number, motivo: string }) => 
      salaService.descalificarCompetidor(idEvaluacion, { user_id: userId!, motivo }),

    onSuccess: (competidorActualizado) => {
      queryClient.setQueryData<CompetidorSala[]>(['salaCompetidores', selectedExamenId], (oldData = []) => {
        return oldData.map(comp => 
          comp.id_evaluacion === competidorActualizado.id_evaluacion 
            ? {
                ...comp, // 1. Mantenemos nombre, CI, grado, etc.
                estado_evaluacion: 'Descalificado', // 2. Forzamos el estado visual correcto
                nota_actual: 0, // 3. La nota es 0
                es_bloqueado: false,
                bloqueado_por_mi: false
              }
            : comp
        );
      });
      toast.success('Competidor descalificado');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'No se pudo descalificar'),
  });

  return {
    areas: areasQuery.data || [],
    examenes: examenesQuery.data || [],
    competidores: competidoresQuery.data || [],
    
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
      descalificar: descalificarMutation
    }
  };
}