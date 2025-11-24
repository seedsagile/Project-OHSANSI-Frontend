import { useState, useCallback } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { reporteService } from '../services/reporteService';
import type { MetaPaginacion } from '../types';
const REGEX_SOLO_NUMEROS = /^[0-9]+$/;
const REGEX_SOLO_ESPECIALES = /^[^a-zA-Z0-9]+$/;

export function useReporteCambios() {
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);
  const [selectedNiveles, setSelectedNiveles] = useState<Set<number>>(new Set());
  const [terminoBusqueda, setTerminoBusqueda] = useState<string>('');
  const [isShowingAll, setIsShowingAll] = useState<boolean>(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const searchTermToUse = 
    REGEX_SOLO_NUMEROS.test(terminoBusqueda) || REGEX_SOLO_ESPECIALES.test(terminoBusqueda)
      ? '' 
      : terminoBusqueda;

  const {
    data: response,
    isLoading,
    isError,
    error,
    isPlaceholderData,
    refetch,
  } = useQuery({
    queryKey: [
      'reporteHistorial',
      isShowingAll ? 'ALL' : selectedAreaId,
      isShowingAll ? 'ALL' : Array.from(selectedNiveles).sort().join(','),
      pagination.pageIndex,
      pagination.pageSize,
      searchTermToUse
    ],
    
    queryFn: () => {
      const apiPage = pagination.pageIndex + 1;
      
      if (isShowingAll) {
        return reporteService.obtenerHistorial(null, [], apiPage, pagination.pageSize);
      }
      
      return selectedAreaId
        ? reporteService.obtenerHistorial(
            selectedAreaId, 
            Array.from(selectedNiveles), 
            apiPage, 
            pagination.pageSize
          )
        : Promise.resolve({ 
            success: true, 
            data: [], 
            meta: { total: 0, page: 1, limit: 10, totalPages: 0 } 
          });
    },

    placeholderData: keepPreviousData,
    
    enabled: isShowingAll || (!!selectedAreaId && selectedNiveles.size > 0),
    
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const historialData = response?.data || [];
  const metaData: MetaPaginacion = response?.meta || { 
    total: 0, page: 1, limit: 10, totalPages: 0 
  };

  const _resetPagination = () => setPagination(prev => ({ ...prev, pageIndex: 0 }));

  const handleAreaChange = useCallback((areaId: number) => {
    setIsShowingAll(false);
    setSelectedAreaId(areaId);
    setSelectedNiveles(new Set());
    setTerminoBusqueda('');
    _resetPagination();
  }, []);

  const handleToggleNivel = useCallback((nivelId: number) => {
    setIsShowingAll(false);
    setSelectedNiveles((prev) => {
      const next = new Set(prev);
      if (next.has(nivelId)) next.delete(nivelId);
      else next.add(nivelId);
      return next;
    });
    _resetPagination();
  }, []);

  const handleToggleAllNiveles = useCallback((idsNivelesDisponibles: number[]) => {
    setIsShowingAll(false);
    setSelectedNiveles((prev) => {
      const allSelected = idsNivelesDisponibles.every(id => prev.has(id));
      return allSelected ? new Set() : new Set(idsNivelesDisponibles);
    });
    _resetPagination();
  }, []);

  const handleMostrarTodo = useCallback(() => {
    setIsShowingAll(true);
    setSelectedAreaId(null);
    setSelectedNiveles(new Set());
    setTerminoBusqueda('');
    _resetPagination();
  }, []);

  const handleSearch = useCallback((term: string) => {
    setTerminoBusqueda(term);
    _resetPagination();
  }, []);

  return {
    // Estados para UI
    selectedAreaId,
    selectedNiveles,
    terminoBusqueda,
    isShowingAll,
    
    // Datos y Paginación para la Tabla
    historialData,
    metaData,
    pagination,
    setPagination, // Función para que la tabla controle el cambio de pág

    // Estados de Carga
    isLoading: isLoading || (isPlaceholderData && !isError),
    isError,
    error,

    // Acciones
    handleAreaChange,
    handleToggleNivel,
    handleToggleAllNiveles,
    handleMostrarTodo,
    handleSearch,
    refetch,

    // Helpers
    hasResultados: historialData.length > 0,
    hasFiltrosRequeridos: isShowingAll || (!!selectedAreaId && selectedNiveles.size > 0),
  };
}