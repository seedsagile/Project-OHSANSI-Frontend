// src/features/olimpiada/hooks/useOlimpiadas.ts
import { useQuery } from '@tanstack/react-query';
import { olimpiadaService } from '../services/olimpiadaServices';

export function useOlimpiadas() {
  return useQuery({
    queryKey: ['olimpiadas'],
    queryFn: olimpiadaService.obtenerOlimpiadas,
  });
}