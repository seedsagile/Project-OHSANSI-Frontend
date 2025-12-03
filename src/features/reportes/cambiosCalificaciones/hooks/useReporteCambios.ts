import { useState, useCallback } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { reporteService } from '../services/reporteService';
import type { MetaPaginacion } from '../types';

export function useReporteCambios() {
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);
  const [selectedNiveles, setSelectedNiveles] = useState<Set<number>>(new Set());
  const [isShowingAll, setIsShowingAll] = useState<boolean>(true);
  
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const {
    data: response,
    isLoading,
    isError,
    isPlaceholderData,
    refetch,
  } = useQuery({
    queryKey: [
      'reporteHistorial',
      isShowingAll ? 'ALL' : selectedAreaId,
      isShowingAll ? 'ALL' : Array.from(selectedNiveles).sort((a, b) => a - b).join(','),
      pagination.pageIndex,
      pagination.pageSize
    ],
    
    queryFn: () => {
      const apiPage = pagination.pageIndex + 1;
      
      if (isShowingAll) {
        return reporteService.obtenerHistorial(null, [], apiPage, pagination.pageSize);
      }
      
      if (selectedAreaId || selectedNiveles.size > 0) {
        return reporteService.obtenerHistorial(
            selectedAreaId, 
            Array.from(selectedNiveles), 
            apiPage, 
            pagination.pageSize
          );
      }

      return Promise.resolve({ 
        success: true, data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } 
      });
    },

    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 1, 
    retry: 1,
    refetchOnWindowFocus: false,
    enabled: isShowingAll || !!selectedAreaId || selectedNiveles.size > 0,
  });

  const historialData = response?.data || [];
  const metaData: MetaPaginacion = response?.meta || { total: 0, page: 1, limit: 10, totalPages: 0 };
  const rowCount = metaData.total;

  const _resetPagination = useCallback(() => setPagination(prev => ({ ...prev, pageIndex: 0 })), []);
  
  const handleAreaChange = useCallback((areaId: number) => {
    if (selectedAreaId !== areaId) {
      setIsShowingAll(false);
      setSelectedNiveles(new Set());
    }
    setSelectedAreaId(areaId);
    _resetPagination();
  }, [selectedAreaId, _resetPagination]);

  const handleToggleNivel = useCallback((nivelId: number) => {
    setIsShowingAll(false);
    setSelectedNiveles((prev) => {
      const next = new Set(prev);
      if (next.has(nivelId)) next.delete(nivelId);
      else next.add(nivelId);
      return next;
    });
    _resetPagination();
  }, [_resetPagination]);

  const handleToggleAllNiveles = useCallback((idsNivelesDisponibles: number[]) => {
    setIsShowingAll(false);
    setSelectedNiveles((prev) => {
      const allSelected = idsNivelesDisponibles.every(id => prev.has(id));
      return allSelected ? new Set() : new Set(idsNivelesDisponibles);
    });
    _resetPagination();
  }, [_resetPagination]);

  const handleMostrarTodo = useCallback(() => {
    setIsShowingAll(true);
    setSelectedAreaId(null);
    setSelectedNiveles(new Set());
    _resetPagination();
  }, [_resetPagination]);

  const isFilteredModeActive = !!selectedAreaId || selectedNiveles.size > 0;

  return {
    selectedAreaId,
    selectedNiveles,
    isShowingAll,
    historialData,
    metaData,
    pagination,
    setPagination,
    rowCount,
    isLoading: isLoading || (isPlaceholderData && !isError), 
    isError,
    handleAreaChange,
    handleToggleNivel,
    handleToggleAllNiveles,
    handleMostrarTodo,
    refetch: () => refetch(),
    hasResultados: historialData.length > 0,
    hasFiltrosRequeridos: isFilteredModeActive,
  };
}