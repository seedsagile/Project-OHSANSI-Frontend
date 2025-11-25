import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { subFasesService, type AreaBackend, type NivelBackend } from '../services/subFasesService';
import { configuracionService } from '../../ConfiguracionFases/services/configuracionService';
import type { Gestion } from '../../ConfiguracionFases/types';

import type { SubFase, EstadoSubFase } from '../types';

export interface UseSubFasesReturn {
  subFases: SubFase[];
  areasOptions: AreaBackend[];
  nivelesOptions: NivelBackend[];
  gestionActual: Gestion | undefined;
  isLoading: boolean;
  isLoadingNiveles: boolean;
  isUpdating: boolean;
  isError: boolean;
  error: Error | null;
  filtros: {
    areaId: number | null;
    nivelId: number | null;
  };
  acciones: {
    seleccionarArea: (id: number) => void;
    setNivelId: React.Dispatch<React.SetStateAction<number | null>>;
    cambiarEstado: (variables: { id: number; estado: EstadoSubFase }) => void;
    puedeIniciar: (fase: SubFase) => boolean;
    puedeFinalizar: (fase: SubFase) => boolean;
  };
}

export function useSubFases(): UseSubFasesReturn {
  const queryClient = useQueryClient();

  const [areaId, setAreaId] = useState<number | null>(null);
  const [nivelId, setNivelId] = useState<number | null>(null);

  const {
    data: gestionActual,
    isLoading: isLoadingGestion,
    isError: isErrorGestion
  } = useQuery({
    queryKey: ['gestionActual'],
    queryFn: configuracionService.obtenerGestionActual,
    staleTime: 1000 * 60 * 60,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const idGestion = gestionActual?.id;

  const {
    data: areasOptions = [],
    isLoading: isLoadingAreas
  } = useQuery({
    queryKey: ['areas'],
    queryFn: subFasesService.obtenerAreas,
    staleTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });

  // C. Niveles
  const {
    data: nivelesOptions = [],
    isLoading: isLoadingNiveles
  } = useQuery({
    queryKey: ['niveles', areaId, idGestion],
    queryFn: () => subFasesService.obtenerNivelesPorArea(areaId!, idGestion!),
    enabled: !!areaId && !!idGestion,
    staleTime: 1000 * 60 * 10,
  });

  // D. Sub-Fases
  const {
    data: subFases = [],
    isLoading: isLoadingSubFases,
    isError: isErrorSubFases,
    error
  } = useQuery({
    queryKey: ['subFases', areaId, nivelId, idGestion],
    queryFn: () => subFasesService.obtenerSubFases(areaId!, nivelId!, idGestion!),
    enabled: !!areaId && !!nivelId && !!idGestion,
    staleTime: 0,
    retry: 1,
  });

  const { mutate: cambiarEstado, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoSubFase }) =>
      subFasesService.cambiarEstadoSubFase(id, estado),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['subFases', areaId, nivelId, idGestion]
      });
      toast.success('Estado de fase actualizado correctamente');
    },

    onError: (err: any) => {
      const mensaje = err.response?.data?.message || err.message || 'Error al actualizar el estado';
      toast.error(mensaje);
    },
  });

  const seleccionarArea = useCallback((id: number) => {
    setAreaId(id);
    setNivelId(null);
  }, []);

  const puedeIniciar = useCallback((fase: SubFase): boolean => {
    if (fase.estado !== 'NO_INICIADA') return false;
    if (fase.orden === 1) return true;

    const faseAnterior = subFases.find((f) => f.orden === fase.orden - 1);
    return faseAnterior?.estado === 'FINALIZADA';
  }, [subFases]);

  const puedeFinalizar = useCallback((fase: SubFase): boolean => {
    return fase.estado === 'EN_EVALUACION';
  }, []);

  return {
    subFases,
    areasOptions,
    nivelesOptions,
    gestionActual,
    isLoading: isLoadingGestion || isLoadingAreas || isLoadingSubFases,
    isLoadingNiveles,
    isUpdating,
    isError: isErrorGestion || isErrorSubFases,
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