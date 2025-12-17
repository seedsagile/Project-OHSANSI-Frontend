import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { examenesService } from '../services/examenesServices';
import { useAuth } from '@/auth/login/hooks/useAuth';
import { echo } from '@/lib/echo';
import type { Examen, EstadoExamen } from '../types';

export function useGestorExamenes() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);
  const [selectedNivelId, setSelectedNivelId] = useState<number | null>(null);
  const [competenciaId, setCompetenciaId] = useState<number | null>(null);

  const estructuraQuery = useQuery({
    queryKey: ['estructuraExamenes', userId],
    queryFn: () => examenesService.obtenerEstructura(userId!),
    enabled: !!userId,
  });

  const estructura = estructuraQuery.data || [];

  useEffect(() => {
    if (selectedAreaId && selectedNivelId) {
      const area = estructura.find(a => a.id_area === selectedAreaId);
      const nivel = area?.niveles.find(n => n.id_area_nivel === selectedNivelId);
      
      if (nivel?.id_competencia) {
        setCompetenciaId(nivel.id_competencia);
      } else {
        setCompetenciaId(null);
      }
    }
  }, [selectedAreaId, selectedNivelId, estructura]);

  const examenesQuery = useQuery({
    queryKey: ['examenes', selectedNivelId],
    queryFn: () => examenesService.listarExamenes(selectedNivelId!),
    enabled: !!selectedNivelId,
  });

  useEffect(() => {
    if (!competenciaId) return;

    const canal = echo.private(`competencia.${competenciaId}`);
    
    canal.listen('ExamenEstadoCambiado', (e: { id_examen: number, estado: EstadoExamen }) => {
        console.log('⚡ Cambio estado examen:', e);
        queryClient.setQueryData(['examenes', selectedNivelId], (old: Examen[] | undefined) => {
            if (!old) return [];
            return old.map(ex => ex.id_examen === e.id_examen ? { ...ex, estado_ejecucion: e.estado } : ex);
        });
    });

    return () => {
      canal.stopListening('ExamenEstadoCambiado');
    };
  }, [competenciaId, queryClient, selectedNivelId]);

  const crearMutation = useMutation({
    mutationFn: examenesService.crearExamen,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['examenes'] }),
  });

  const editarMutation = useMutation({
    mutationFn: examenesService.editarExamen,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['examenes'] }),
  });

  const eliminarMutation = useMutation({
    mutationFn: examenesService.eliminarExamen,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['examenes'] }),
  });

  const iniciarMutation = useMutation({
    mutationFn: examenesService.iniciarExamen,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['examenes'] }),
  });

  const finalizarMutation = useMutation({
    mutationFn: examenesService.finalizarExamen,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['examenes'] }),
  });

  return {
    estructura,
    examenes: examenesQuery.data || [],
    isLoading: estructuraQuery.isLoading || examenesQuery.isLoading,
    selectedAreaId,
    setSelectedAreaId,
    selectedNivelId,
    setSelectedNivelId,
    competenciaId,
    acciones: {
        crear: crearMutation,
        editar: editarMutation,
        eliminar: eliminarMutation,
        iniciar: iniciarMutation,
        finalizar: finalizarMutation
    }
  };
}