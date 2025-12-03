import { useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  LoaderCircle, 
  Filter,
  Globe, 
  List,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useReporteCambios } from '../hooks/useReporteCambios';
import { useExportarReporte } from '../hooks/useExportarReporte';
import { reporteService } from '../services/reporteService';
import { TablaHistorial } from '../components/TablaHistorial';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { NivelFilterDropdown } from '../components/NivelFilterDropdown'; 
import { excelIcon, pdfIcon } from '@/assets'; 
import type { HistorialCambio } from '../types';

export function PaginaReporteCambios() {
  const {
    selectedAreaId,
    selectedNiveles,
    isShowingAll,
    historialData,
    pagination,
    setPagination,
    rowCount,
    isLoading,
    handleAreaChange,
    handleToggleNivel,
    handleToggleAllNiveles,
    handleMostrarTodo,
    hasFiltrosRequeridos,
    hasResultados,
  } = useReporteCambios();

  const { exportarExcel, exportarPDF } = useExportarReporte();
  
  const { data: areasBackend = [] } = useQuery({
    queryKey: ['reporteAreas'],
    queryFn: reporteService.obtenerAreasFiltro,
    staleTime: 1000 * 60 * 30,
  });

  const { data: nivelesBackend = [], isLoading: loadingNiveles } = useQuery({
    queryKey: ['reporteNiveles', selectedAreaId],
    queryFn: () => selectedAreaId ? reporteService.obtenerNivelesPorAreaFiltro(selectedAreaId) : Promise.resolve([]),
    enabled: !!selectedAreaId || !isShowingAll,
  });

  const areaOptions = useMemo(() => 
    areasBackend.map(a => ({ value: a.id_area, label: a.nombre })), 
    [areasBackend]
  );
  
  const exportMutation = useMutation<void, Error, { type: 'excel' | 'pdf' }>({
    mutationFn: async ({ type }) => {
      const allData: HistorialCambio[] = await reporteService.obtenerTodoParaExportar(
        isShowingAll ? null : selectedAreaId,
        isShowingAll ? [] : Array.from(selectedNiveles)
      );

      let contexto = isShowingAll ? 'Historial Global' : `Área Seleccionada`;
      if (selectedAreaId && !isShowingAll) {
          const areaName = areasBackend.find(a => a.id_area === selectedAreaId)?.nombre;
          contexto = `Área: ${areaName}`;
      }
      
      if (type === 'excel') exportarExcel(allData, contexto);
      else exportarPDF(allData, contexto);
      
      toast.success('El archivo se generó y descargó exitosamente.');
    },
    onError: (error) => {
      console.error('Error durante la exportación:', error);
      toast.error(`Error al exportar: ${error.message}.`);
    },
  });

  const isExporting = exportMutation.isPending;
  
  const onAreaSelect = (val: string | number) => {
    const id = Number(val);
    if (!isNaN(id)) {
      handleAreaChange(id);
    }
  };
  
  const handleExport = (type: 'excel' | 'pdf') => {
    if (isExporting || !hasResultados) return;
    exportMutation.mutate({ type });
  };

  const disableControls = isLoading || isExporting;

  return (
    <div className="min-h-screen bg-neutro-50 p-6 font-display">
      <div className="max-w-7xl mx-auto">
        
        <h1 className="text-3xl font-extrabold text-negro tracking-tight mb-8 text-center md:text-left">
          Reporte de Cambio de Calificaciones
        </h1>

        <div className="bg-white rounded-xl shadow-sm border border-neutro-200 p-6 space-y-6">

          <div className="flex flex-col md:flex-row gap-4 items-stretch justify-between">
            
            <button
              onClick={handleMostrarTodo}
              disabled={isLoading || isExporting}
              className={`w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold text-white transition-all shadow-sm ${
                isShowingAll ? 'bg-principal-700 ring-2 ring-principal-300' : 'bg-principal-600 hover:bg-principal-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isShowingAll ? <Globe size={20} /> : <List size={20} />}
              <span>Mostrar Todo</span>
            </button>

            <div className="flex w-full md:w-auto gap-4 flex-col sm:flex-row">
              <button
                onClick={() => handleExport('pdf')}
                disabled={!hasResultados || isExporting || isLoading}
                className="w-full sm:w-1/2 md:w-auto group flex items-center justify-center gap-3 px-6 py-3 bg-white border-2 border-principal-500 text-neutro-700 font-bold rounded-lg hover:bg-acento-50 hover:border-acento-300 hover:text-acento-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <img src={pdfIcon} alt="PDF" className="w-5 h-5 object-contain group-hover:scale-110 transition-transform" />
                {isExporting && exportMutation.variables?.type === 'pdf' ? <LoaderCircle className="animate-spin w-4 h-4" /> : <span>PDF</span>}
              </button>

              <button
                onClick={() => handleExport('excel')}
                disabled={!hasResultados || isExporting || isLoading}
                className="w-full sm:w-1/2 md:w-auto group flex items-center justify-center gap-3 px-6 py-3 bg-white border-2 border-principal-500 text-neutro-700 font-bold rounded-lg hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <img src={excelIcon} alt="Excel" className="w-5 h-5 object-contain group-hover:scale-110 transition-transform" />
                {isExporting && exportMutation.variables?.type === 'excel' ? <LoaderCircle className="animate-spin w-4 h-4" /> : <span>Excel</span>}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-neutro-100 mt-4">
            
            <div className="relative z-20">
              <label 
                htmlFor="area-dropdown"
                className="flex items-center gap-2 text-xs font-bold text-neutro-500 mb-1 uppercase"
              >
                <Filter size={14}/> FILTRAR POR ÁREA
              </label>
              <CustomDropdown
                id="area-dropdown"
                options={areaOptions}
                selectedValue={selectedAreaId}
                onSelect={onAreaSelect}
                placeholder="Seleccionar Área"
                disabled={disableControls}
              />
            </div>

            <div className="relative z-10"> 
              <label 
                htmlFor="nivel-dropdown"
                className="flex items-center gap-2 text-xs font-bold text-neutro-500 mb-1 uppercase"
              >
                <Filter size={14}/> FILTRAR POR NIVELES
              </label>
              <NivelFilterDropdown
                id="nivel-dropdown"
                niveles={nivelesBackend}
                selectedNiveles={selectedNiveles}
                isLoading={loadingNiveles}
                onToggleNivel={handleToggleNivel}
                onToggleAll={(ids) => handleToggleAllNiveles(ids)}
                disabled={!selectedAreaId || disableControls}
              />
            </div>

          </div>

        </div>

        <div className="mt-8">
          {(!hasFiltrosRequeridos && !isShowingAll && !isLoading) ? (
            <div className="border-2 border-dashed border-neutro-300 rounded-xl p-12 flex flex-col items-center justify-center text-center bg-neutro-50/50">
              <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                <Filter size={32} className="text-neutro-400" />
              </div>
              <h3 className="text-lg font-bold text-neutro-700">Esperando configuración</h3>
              <p className="text-neutro-500 mt-1 max-w-md">
                Seleccione un Área y Niveles para ver el historial, o presione "Mostrar Todo".
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-neutro-200 overflow-hidden">
              <TablaHistorial
                data={historialData}
                isLoading={isLoading}
                pagination={pagination}
                onPaginationChange={setPagination}
                rowCount={rowCount}
              />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}