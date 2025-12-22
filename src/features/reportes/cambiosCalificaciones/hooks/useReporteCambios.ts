import { useState, useCallback } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { reporteService } from '../services/reporteService';
import type { PaginationState } from '@tanstack/react-table';

export const useReporteCambios = () => {
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);
  const [selectedNiveles, setSelectedNiveles] = useState<Set<number>>(new Set());
  const [isShowingAll, setIsShowingAll] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const hasFiltrosRequeridos = isShowingAll || (!!selectedAreaId && selectedNiveles.size > 0);
  const { 
    data: reporteResponse, 
    isLoading, 
    isFetching 
  } = useQuery({
    queryKey: [
      'reporteHistorial', 
      isShowingAll ? 'ALL' : selectedAreaId,
      isShowingAll ? 'ALL' : Array.from(selectedNiveles).sort(),
      pagination.pageIndex, 
      pagination.pageSize
    ],
    queryFn: () => {
      const apiPage = pagination.pageIndex + 1;
      const areaParam = isShowingAll ? null : selectedAreaId;
      const nivelesParam = isShowingAll ? [] : Array.from(selectedNiveles);
      
      return reporteService.obtenerHistorial(
        areaParam,
        nivelesParam,
        apiPage,
        pagination.pageSize,
        '' 
      );
    },
    enabled: hasFiltrosRequeridos,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60, 
  });

  const handleAreaChange = useCallback((id: number) => {
    setSelectedAreaId(id);
    setSelectedNiveles(new Set()); 
    setIsShowingAll(false); 
    setPagination(prev => ({ ...prev, pageIndex: 0 })); 
  }, []);

  const handleToggleNivel = useCallback((idNivel: number) => {
    setSelectedNiveles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(idNivel)) {
        newSet.delete(idNivel);
      } else {
        newSet.add(idNivel);
      }
      return newSet;
    });
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, []);

  const handleToggleAllNiveles = useCallback((idsDisponibles: number[]) => {
    setSelectedNiveles(prev => {
      const todosSeleccionados = idsDisponibles.every(id => prev.has(id));
      
      if (todosSeleccionados) {
        return new Set(); 
      } else {
        return new Set(idsDisponibles); 
      }
    });
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, []);

  const handleMostrarTodo = useCallback(() => {
    setIsShowingAll(true);
    setSelectedAreaId(null);
    setSelectedNiveles(new Set());
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, []);

  return {
    selectedAreaId,
    selectedNiveles,
    isShowingAll,
    pagination,
    historialData: reporteResponse?.data || [],
    rowCount: reporteResponse?.meta.total || 0,
    hasResultados: (reporteResponse?.data?.length || 0) > 0,
    hasFiltrosRequeridos,
    isLoading: isLoading || isFetching,
    setPagination,
    handleAreaChange,
    handleToggleNivel,
    handleToggleAllNiveles,
    handleMostrarTodo,
  };
};