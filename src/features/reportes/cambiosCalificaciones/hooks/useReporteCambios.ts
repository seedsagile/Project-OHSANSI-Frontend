import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reporteService } from '../services/reporteService';
import type { HistorialCambio } from '../types';

const REGEX_SOLO_NUMEROS = /^[0-9]+$/;
const REGEX_SOLO_ESPECIALES = /^[^a-zA-Z0-9]+$/;

export function useReporteCambios() {
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);
  const [selectedNiveles, setSelectedNiveles] = useState<Set<number>>(new Set());
  const [terminoBusqueda, setTerminoBusqueda] = useState<string>('');
  
  const [isShowingAll, setIsShowingAll] = useState<boolean>(false);

  const {
    data: historialBruto = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<HistorialCambio[], Error>({
    queryKey: [
      'reporteHistorial',
      isShowingAll ? 'ALL' : selectedAreaId,
      isShowingAll ? 'ALL' : Array.from(selectedNiveles).sort().join(',')
    ],
    
    queryFn: () => {
      if (isShowingAll) {
        return reporteService.obtenerHistorial(null, []);
      }
      return selectedAreaId
        ? reporteService.obtenerHistorial(selectedAreaId, Array.from(selectedNiveles))
        : Promise.resolve([]);
    },
        
    enabled: isShowingAll || (!!selectedAreaId && selectedNiveles.size > 0),
    
    staleTime: 1000 * 60 * 5,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const historialFiltrado = useMemo(() => {
    const term = terminoBusqueda.trim();

    if (!term) return historialBruto;

    if (REGEX_SOLO_NUMEROS.test(term)) return historialBruto;

    if (REGEX_SOLO_ESPECIALES.test(term)) return historialBruto;

    const normalize = (str: string) =>
      str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const normalizedTerm = normalize(term);

    return historialBruto.filter((item) => {
      const searchableText = [
        item.nombre_evaluador,
        item.nombre_olimpista,
        item.area,
        item.nivel,
        item.accion,
        item.descripcion,
        item.observacion || '',
      ].join(' ');

      return normalize(searchableText).includes(normalizedTerm);
    });
  }, [historialBruto, terminoBusqueda]);

  const handleAreaChange = useCallback((areaId: number) => {
    setIsShowingAll(false);
    setSelectedAreaId(areaId);
    setSelectedNiveles(new Set());
    setTerminoBusqueda('');
  }, []);

  const handleToggleNivel = useCallback((nivelId: number) => {
    setIsShowingAll(false);
    setSelectedNiveles((prev) => {
      const next = new Set(prev);
      if (next.has(nivelId)) {
        next.delete(nivelId);
      } else {
        next.add(nivelId);
      }
      return next;
    });
  }, []);

  const handleToggleAllNiveles = useCallback((idsNivelesDisponibles: number[]) => {
    setIsShowingAll(false);
    setSelectedNiveles((prev) => {
      const allSelected = idsNivelesDisponibles.every(id => prev.has(id));
      
      if (allSelected) {
        return new Set();
      } else {
        return new Set(idsNivelesDisponibles);
      }
    });
  }, []);

  const handleMostrarTodo = useCallback(() => {
    setIsShowingAll(true);
    setSelectedAreaId(null);
    setSelectedNiveles(new Set());
    setTerminoBusqueda('');
  }, []);

  const handleSearch = useCallback((term: string) => {
    setTerminoBusqueda(term);
  }, []);

  return {
    // Estado
    selectedAreaId,
    selectedNiveles,
    terminoBusqueda,
    isShowingAll,

    // Datos
    historialFiltrado,
    
    // Feedback
    isLoading,
    isError,
    error,

    // Acciones
    handleAreaChange,
    handleToggleNivel,
    handleToggleAllNiveles,
    handleMostrarTodo,
    handleSearch,
    refetch,

    // Helpers para la UI
    hasResultados: historialFiltrado.length > 0,
    // La UI de resultados se muestra si hay filtros válidos O si está en modo "Mostrar Todo"
    hasFiltrosRequeridos: isShowingAll || (!!selectedAreaId && selectedNiveles.size > 0),
  };
}