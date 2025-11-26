import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GESTION_ACTUAL_ANIO } from '@/features/inscritos/constants'; 

type PermisosActivosResponse = {
  faseActiva: {
    id: number;
    nombre: string;
    codigo: string;
  };
  accionesPermitidas: string[];
};

const permisosService = {
  obtenerPermisosActuales: async (): Promise<PermisosActivosResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      faseActiva: {
        id: 2,
        nombre: 'Fase de Calificación',
        codigo: 'EVAL',
      },
      accionesPermitidas: [
        'CARGAR_NOTAS',
        'VALIDAR_CALIF',
        'EXP_REPORTES',
      ],
    };
  },
};

export function usePermisosFase() {
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['permisosFaseActiva', GESTION_ACTUAL_ANIO],
    queryFn: permisosService.obtenerPermisosActuales,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
  });

  const can = useCallback((codigoAccion: string): boolean => {
    if (!data || !data.accionesPermitidas) return false;
    
    return data.accionesPermitidas.includes(codigoAccion);
  }, [data]);

  const phaseIs = useCallback((codigoFase: string): boolean => {
    if (!data || !data.faseActiva) return false;
    return data.faseActiva.codigo === codigoFase;
  }, [data]);

  return {
    isLoading,
    isError: !!error,
    faseActual: data?.faseActiva || null,
    
    can,
    phaseIs,
  };
}