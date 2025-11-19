import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { subFasesService } from '../services/subFasesService';
import type { SubFase, EstadoSubFase } from '../types';

export function useSubFases() {
  const queryClient = useQueryClient();

  const [areaId, setAreaId] = useState<number | null>(null);
  const [nivelId, setNivelId] = useState<number | null>(null);

  const { data: areasOptions = [], isLoading: isLoadingAreas } = useQuery({
    queryKey: ['mockAreas'],
    queryFn: subFasesService.obtenerAreasMock,
    staleTime: Infinity,
  });

  const { data: nivelesOptions = [], isLoading: isLoadingNiveles } = useQuery({
    queryKey: ['mockNiveles', areaId],
    queryFn: () => subFasesService.obtenerNivelesPorAreaMock(areaId!),
    enabled: !!areaId,
    staleTime: Infinity,
  });

  const {
    data: subFases = [],
    isLoading: isLoadingSubFases,
    isError,
    error,
  } = useQuery({
    queryKey: ['subFases', areaId, nivelId],
    queryFn: () => subFasesService.obtenerSubFases(areaId!, nivelId!),
    enabled: !!areaId && !!nivelId,
    staleTime: 0,
  });

  const { mutate: cambiarEstado, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoSubFase }) =>
      subFasesService.cambiarEstadoSubFase(id, estado),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subFases'] });
      toast.success('Fase actualizada correctamente');
    },

    onError: (err: Error) => {
      toast.error(err.message || 'No se pudo actualizar el estado');
    },
  });

  const seleccionarArea = useCallback((id: number) => {
    setAreaId(id);
    setNivelId(null);
  }, []);

  const puedeIniciar = useCallback(
    (fase: SubFase): boolean => {
      if (fase.estado !== 'NO_INICIADA') return false;
      if (fase.orden === 1) return true;

      const faseAnterior = subFases.find((f) => f.orden === fase.orden - 1);
      return faseAnterior?.estado === 'FINALIZADA';
    },
    [subFases]
  );

  const puedeFinalizar = useCallback((fase: SubFase): boolean => {
    return fase.estado === 'EN_EVALUACION';
  }, []);

  return {
    subFases,
    areasOptions,
    nivelesOptions,

    isLoading: isLoadingAreas || isLoadingSubFases,
    isLoadingNiveles,
    isUpdating,
    isError,
    error,

    filtros: {
      areaId,
      nivelId,
    },

    acciones: {
      seleccionarArea,
      setNivelId,
      cambiarEstado,
      puedeIniciar,
      puedeFinalizar,
    },
  };
}