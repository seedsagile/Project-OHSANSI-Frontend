import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { competenciasService } from '../services/competenciasServices';
import { echo } from '@/lib/echo';
import { useAuth } from '@/auth/login/hooks/useAuth';
import type { Competencia, EstadoFase } from '../types';

export function useCompetenciasDashboard() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);

  const [lastUpdatedId, setLastUpdatedId] = useState<number | null>(null);
  const flashTimerRef = useRef<number | null>(null);

  const areasQuery = useQuery({
    queryKey: ['areasResponsable', userId],
    queryFn: () => competenciasService.obtenerAreasResponsable(userId!),
    enabled: !!userId,
  });

  const competenciasQuery = useQuery({
    queryKey: ['competencias', userId, selectedAreaId],
    queryFn: () => competenciasService.listarCompetencias(userId!, selectedAreaId!),
    enabled: !!userId && !!selectedAreaId,
  });

  useEffect(() => {
    if (!competenciasQuery.data || competenciasQuery.data.length === 0) return;

    const canalesSuscritos: any[] = [];

    competenciasQuery.data.forEach((comp) => {
      const canal = echo.private(`competencia.${comp.id_competencia}`);
      
      canal.listen('CompetenciaEstadoCambiado', (e: { estado_fase: EstadoFase }) => {
        console.log(`⚡ [WS] Actualización Competencia ${comp.id_competencia}:`, e.estado_fase);
        
        queryClient.setQueryData(['competencias', userId, selectedAreaId], (oldData: Competencia[] | undefined) => {
          if (!oldData) return [];
          return oldData.map(c => 
            c.id_competencia === comp.id_competencia 
              ? { ...c, estado_fase: e.estado_fase } 
              : c
          );
        });

        setLastUpdatedId(comp.id_competencia);
        
        if (flashTimerRef.current) {
          clearTimeout(flashTimerRef.current);
        }
        
        flashTimerRef.current = window.setTimeout(() => {
          setLastUpdatedId(null);
        }, 2000);
      });

      canalesSuscritos.push(canal);
    });

    return () => {
      canalesSuscritos.forEach(canal => canal.stopListening('CompetenciaEstadoCambiado'));
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    };
  }, [competenciasQuery.data, queryClient, userId, selectedAreaId]);

  
  const publicarMutation = useMutation({
    mutationFn: competenciasService.publicarCompetencia,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['competencias'] }),
  });

  const iniciarMutation = useMutation({
    mutationFn: competenciasService.iniciarCompetencia,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['competencias'] }),
  });

  const cerrarMutation = useMutation({
    mutationFn: competenciasService.cerrarCompetencia,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['competencias'] }),
  });

  const avalarMutation = useMutation({
    mutationFn: ({ id, password }: { id: number, password: string }) => 
      competenciasService.avalarCompetencia(id, userId!, password),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['competencias'] }),
  });

  return {
    areas: areasQuery.data || [],
    competencias: competenciasQuery.data || [],
    isLoading: areasQuery.isLoading || competenciasQuery.isLoading,
    selectedAreaId,
    setSelectedAreaId,
    lastUpdatedId,
    acciones: {
      publicar: publicarMutation,
      iniciar: iniciarMutation,
      cerrar: cerrarMutation,
      avalar: avalarMutation,
    }
  };
}