import { useMemo } from 'react';
import { 
  Filter, 
  Search, 
  AlertTriangle, 
  List, 
  FileSpreadsheet, 
  FileText 
} from 'lucide-react';

import { useReporteCambios } from '../hooks/useReporteCambios';
import { useExportarReporte } from '../hooks/useExportarReporte';
import { TablaHistorial } from '../components/TablaHistorial';
import { CustomDropdown } from '@/components/ui/CustomDropdown';

const MOCK_AREAS_LOCAL = [
  { id_area: 1, nombre: 'Matemáticas' },
  { id_area: 2, nombre: 'Física' },
  { id_area: 3, nombre: 'Robótica' },
  { id_area: 4, nombre: 'Química' },
];

const MOCK_NIVELES_MATEMATICAS = [
  { id_nivel: 101, nombre: '1ro de Secundaria' },
  { id_nivel: 102, nombre: '2do de Secundaria' },
  { id_nivel: 103, nombre: '3ro de Secundaria' },
];

const MOCK_NIVELES_FISICA = [
  { id_nivel: 301, nombre: 'Nivel Intermedio' },
  { id_nivel: 302, nombre: 'Nivel Avanzado' },
];

const MOCK_NIVELES_ROBOTICA = [
  { id_nivel: 201, nombre: 'Categoría A' },
  { id_nivel: 202, nombre: 'Categoría B' },
];

export function PaginaReporteCambios() {
  const {
    selectedAreaId,
    selectedNiveles,
    terminoBusqueda,
    isShowingAll,
    
    // Datos
    historialData,
    pagination,
    setPagination,
    metaData,
    
    // Estados
    isLoading,
    
    // Acciones
    handleAreaChange,
    handleToggleNivel,
    handleToggleAllNiveles,
    handleMostrarTodo,
    handleSearch,
    
    hasFiltrosRequeridos,
    hasResultados,
  } = useReporteCambios();

  const { exportarExcel, exportarPDF } = useExportarReporte();

  // Handler seguro para cambio de área
  const onAreaSelect = (val: string | number) => {
    const id = Number(val);
    console.log("Área seleccionada:", id); // Para depuración
    if (!isNaN(id)) {
      handleAreaChange(id);
    }
  };

  const handleExport = (type: 'excel' | 'pdf') => {
    let contexto = '';
    if (isShowingAll) {
      contexto = 'Historial Completo (Sin filtros)';
    } else {
      const nombreArea = MOCK_AREAS_LOCAL.find(a => a.id_area === selectedAreaId)?.nombre || 'Desconocida';
      contexto = `Área: ${nombreArea} | Niveles: ${selectedNiveles.size}`;
    }

    if (type === 'excel') exportarExcel(historialData, contexto);
    else exportarPDF(historialData, contexto);
  };

  const areaOptions = useMemo(
    () => MOCK_AREAS_LOCAL.map((a) => ({ value: a.id_area, label: a.nombre })),
    []
  );

  // Selector de niveles seguro
  const nivelesDisponibles = useMemo(() => {
    if (!selectedAreaId) return [];
    switch (selectedAreaId) {
      case 1: return MOCK_NIVELES_MATEMATICAS;
      case 2: return MOCK_NIVELES_FISICA;
      case 3: return MOCK_NIVELES_ROBOTICA;
      default: return [];
    }
  }, [selectedAreaId]);

  const areAllNivelesSelected = 
    nivelesDisponibles.length > 0 && 
    nivelesDisponibles.every(n => selectedNiveles.has(n.id_nivel));

  return (
    <div className="min-h-screen bg-neutro-100 p-4 md:p-8 font-display animate-fade-in">
      
      <header className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-negro tracking-tight">
            Reporte de Calificaciones
          </h1>
          <p className="text-neutro-600 mt-1 text-sm md:text-base">
            Auditoría de cambios, notas y descalificaciones por evaluador.
          </p>
        </div>

        <button
          onClick={handleMostrarTodo}
          // Quitamos disabled={isLoading} para que la UI se sienta viva
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all border shadow-sm ${
            isShowingAll
              ? 'bg-principal-600 text-white border-principal-600 ring-2 ring-principal-200 ring-offset-1'
              : 'bg-white text-principal-700 border-principal-200 hover:bg-principal-50 hover:border-principal-300'
          }`}
        >
          <List size={18} />
          <span>{isShowingAll ? 'Viendo Historial Completo' : 'Ver Historial Completo'}</span>
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* FILTROS */}
        <aside className="lg:col-span-1 space-y-6 sticky top-6 z-20">
          <div className={`bg-white p-5 rounded-xl shadow-sombra-3 border transition-colors duration-300 ${isShowingAll ? 'border-principal-200 bg-principal-50/30' : 'border-neutro-200'}`}>
            
            <div className="flex items-center justify-between mb-5 border-b border-neutro-100 pb-2">
              <div className="flex items-center gap-2 text-principal-700 font-bold uppercase text-xs tracking-wider">
                <Filter size={16} /> Filtros
              </div>
              {isShowingAll && (
                <span className="text-[10px] bg-principal-100 text-principal-700 px-2 py-0.5 rounded-full font-medium animate-pulse">
                  Global
                </span>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold text-neutro-500 mb-2 uppercase">
                Seleccionar Área
              </label>
              <CustomDropdown
                options={areaOptions}
                selectedValue={selectedAreaId}
                onSelect={onAreaSelect} // Usamos el handler seguro
                placeholder="-- Elija un área --"
                disabled={false} // Siempre habilitado
              />
            </div>

            <div className="relative">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-neutro-500 uppercase">
                  Niveles
                </label>
                {selectedAreaId && selectedNiveles.size > 0 && (
                  <span className="text-[10px] font-bold text-principal-600 bg-principal-50 px-2 py-0.5 rounded-full">
                    {selectedNiveles.size} Marcados
                  </span>
                )}
              </div>

              <div className="border border-neutro-200 rounded-lg bg-neutro-50/50 overflow-hidden min-h-[120px] flex flex-col">
                {!selectedAreaId ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-neutro-400">
                    <AlertTriangle size={24} className="mb-2 opacity-20" />
                    <span className="text-xs italic">Seleccione un área primero</span>
                  </div>
                ) : nivelesDisponibles.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center p-4 text-neutro-400 text-xs italic">
                    No hay niveles registrados.
                  </div>
                ) : (
                  <>
                    <div className="border-b border-neutro-200 bg-white sticky top-0 z-10">
                      <label className="flex items-center gap-3 p-3 cursor-pointer hover:bg-principal-50 transition-colors select-none">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 text-principal-600 rounded border-gray-300 focus:ring-principal-500 cursor-pointer"
                          checked={areAllNivelesSelected}
                          onChange={() => handleToggleAllNiveles(nivelesDisponibles.map(n => n.id_nivel))}
                        />
                        <span className="text-xs font-bold text-principal-700 uppercase tracking-wider">
                          Marcar Todos
                        </span>
                      </label>
                    </div>

                    <div className="max-h-[280px] overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-neutro-300 bg-white">
                      {nivelesDisponibles.map((nivel) => {
                        const isChecked = selectedNiveles.has(nivel.id_nivel);
                        return (
                          <label
                            key={nivel.id_nivel}
                            className={`flex items-start gap-3 p-2.5 rounded-md cursor-pointer transition-all text-sm select-none group ${
                              isChecked
                                ? 'bg-principal-50 border border-principal-100 text-principal-900'
                                : 'hover:bg-neutro-50 text-neutro-600 border border-transparent'
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="mt-0.5 w-4 h-4 text-principal-600 rounded border-gray-300 focus:ring-principal-500 cursor-pointer"
                              checked={isChecked}
                              onChange={() => handleToggleNivel(nivel.id_nivel)}
                            />
                            <span className="leading-snug text-xs sm:text-sm">
                              {nivel.nombre}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* RESULTADOS */}
        <main className="lg:col-span-3 space-y-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-neutro-200 flex flex-col md:flex-row gap-4 justify-between items-center sticky top-6 z-30">
            <div className="relative w-full md:max-w-md group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutro-400" size={20} />
              <input
                type="text"
                placeholder={hasFiltrosRequeridos ? 'Buscar...' : 'Configure filtros'}
                className="w-full pl-10 pr-4 py-2.5 border border-neutro-300 rounded-lg focus:ring-2 focus:ring-principal-500 focus:outline-none transition-all text-sm"
                value={terminoBusqueda}
                onChange={(e) => handleSearch(e.target.value)}
                disabled={!hasFiltrosRequeridos}
              />
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <button
                onClick={() => handleExport('excel')}
                disabled={!hasResultados}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-semibold text-sm shadow-sm disabled:opacity-50"
              >
                <FileSpreadsheet size={18} /> Excel
              </button>
              <button
                onClick={() => handleExport('pdf')}
                disabled={!hasResultados}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-semibold text-sm shadow-sm disabled:opacity-50"
              >
                <FileText size={18} /> PDF
              </button>
            </div>
          </div>

          <div className="min-h-[500px] relative">
            {!hasFiltrosRequeridos ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 border-2 border-dashed border-neutro-300 rounded-xl p-8">
                <div className="bg-neutro-100 p-6 rounded-full mb-4">
                  <Filter size={40} className="text-neutro-400" />
                </div>
                <h3 className="text-lg font-bold text-neutro-700">Esperando configuración</h3>
                <p className="text-neutro-500 text-sm mt-2">Seleccione un Área y Niveles.</p>
              </div>
            ) : (
              <TablaHistorial 
                data={historialData} 
                isLoading={isLoading}
                pagination={pagination}
                onPaginationChange={setPagination}
                rowCount={metaData.total}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}