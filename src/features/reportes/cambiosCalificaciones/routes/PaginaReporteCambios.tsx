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
import {
  MOCK_AREAS,
  MOCK_NIVELES_MATEMATICAS,
  MOCK_NIVELES_FISICA,
  MOCK_NIVELES_ROBOTICA,
} from '@/features/subfases/utils/mocks';

export function PaginaReporteCambios() {
  const {
    selectedAreaId,
    selectedNiveles,
    terminoBusqueda,
    historialFiltrado,
    isLoading,
    isShowingAll,
    // Acciones
    handleAreaChange,
    handleToggleNivel,
    handleToggleAllNiveles,
    handleMostrarTodo,
    handleSearch,
    // Helpers UI
    hasFiltrosRequeridos,
    hasResultados,
  } = useReporteCambios();

  const { exportarExcel, exportarPDF } = useExportarReporte();

  const areaOptions = useMemo(
    () => MOCK_AREAS.map((a) => ({ value: a.id_area, label: a.nombre })),
    []
  );

  const nivelesDisponibles = useMemo(() => {
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

  const handleExport = (type: 'excel' | 'pdf') => {
    let contexto = '';
    if (isShowingAll) {
      contexto = 'Historial Completo (Sin filtros)';
    } else {
      const nombreArea = areaOptions.find(a => a.value === selectedAreaId)?.label || 'Desconocida';
      contexto = `Área: ${nombreArea} | Niveles: ${selectedNiveles.size}`;
    }

    if (type === 'excel') exportarExcel(historialFiltrado, contexto);
    else exportarPDF(historialFiltrado, contexto);
  };

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
          disabled={isLoading}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all border shadow-sm ${
            isShowingAll
              ? 'bg-principal-600 text-white border-principal-600 ring-2 ring-principal-200 ring-offset-1'
              : 'bg-white text-principal-700 border-principal-200 hover:bg-principal-50 hover:border-principal-300'
          }`}
          title="Mostrar el historial completo sin filtros de área"
        >
          <List size={18} />
          <span>{isShowingAll ? 'Viendo Historial Completo' : 'Ver Historial Completo'}</span>
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        <aside className="lg:col-span-1 space-y-6 sticky top-6 z-20">
          <div className={`bg-white p-5 rounded-xl shadow-sombra-3 border transition-colors duration-300 ${isShowingAll ? 'border-principal-200 bg-principal-50/30' : 'border-neutro-200'}`}>
            
            <div className="flex items-center justify-between mb-5 border-b border-neutro-100 pb-2">
              <div className="flex items-center gap-2 text-principal-700 font-bold uppercase text-xs tracking-wider">
                <Filter size={16} /> Filtros
              </div>
              {isShowingAll && (
                <span className="text-[10px] bg-principal-100 text-principal-700 px-2 py-0.5 rounded-full font-medium">
                  Modo Global Activo
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
                onSelect={(val) => handleAreaChange(Number(val))}
                placeholder="-- Elija un área --"
              />
              {isShowingAll && !selectedAreaId && (
                <p className="text-[10px] text-principal-600 mt-1.5">
                  💡 Seleccione un área para filtrar la vista actual.
                </p>
              )}
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
                {/* Estado: Sin Área Seleccionada */}
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
                    {/* Opción "Marcar Todos" */}
                    <div className="border-b border-neutro-200 bg-white sticky top-0 z-10">
                      <label className="flex items-center gap-3 p-3 cursor-pointer hover:bg-principal-50 transition-colors">
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

                    {/* Lista de Niveles Individuales */}
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
              
              {selectedAreaId && (
                <p className="text-[10px] text-neutro-400 mt-2 text-right">
                  * Se requiere al menos un nivel seleccionado.
                </p>
              )}
            </div>
          </div>
        </aside>

        {/* ─── COLUMNA DERECHA: RESULTADOS ─── */}
        <main className="lg:col-span-3 space-y-6">
          
          {/* Toolbar de Acciones */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-neutro-200 flex flex-col md:flex-row gap-4 justify-between items-center sticky top-6 z-30">
            
            {/* Buscador */}
            <div className="relative w-full md:max-w-md group">
              <Search
                className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                  hasFiltrosRequeridos ? 'text-neutro-400 group-focus-within:text-principal-500' : 'text-neutro-300'
                }`}
                size={20}
              />
              <input
                type="text"
                placeholder={
                  hasFiltrosRequeridos
                    ? 'Buscar por nombre, acción, observación...'
                    : 'Configure filtros para habilitar búsqueda'
                }
                className="w-full pl-10 pr-4 py-2.5 border border-neutro-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-principal-500 focus:border-transparent transition-all disabled:bg-neutro-50 disabled:text-neutro-400 disabled:cursor-not-allowed text-sm"
                value={terminoBusqueda}
                onChange={(e) => handleSearch(e.target.value)}
                disabled={!hasFiltrosRequeridos}
              />
            </div>

            {/* Botones de Exportación */}
            <div className="flex gap-3 w-full md:w-auto">
              <button
                onClick={() => handleExport('excel')}
                disabled={!hasResultados || isLoading}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 active:scale-95 transition-all font-semibold text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                title="Descargar reporte en Excel"
              >
                <FileSpreadsheet size={18} />
                <span>Excel</span>
              </button>
              <button
                onClick={() => handleExport('pdf')}
                disabled={!hasResultados || isLoading}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 active:scale-95 transition-all font-semibold text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                title="Descargar reporte en PDF"
              >
                <FileText size={18} />
                <span>PDF</span>
              </button>
            </div>
          </div>

          {/* Tabla de Resultados */}
          <div className="min-h-[500px] relative">
            {!hasFiltrosRequeridos ? (
              // Estado Inicial (Sin configuración)
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 border-2 border-dashed border-neutro-300 rounded-xl p-8">
                <div className="bg-neutro-100 p-6 rounded-full mb-4 animate-pulse-slow">
                  <Filter size={40} className="text-neutro-400" />
                </div>
                <h3 className="text-lg font-bold text-neutro-700">Esperando configuración</h3>
                <p className="text-neutro-500 max-w-sm text-center mt-2 text-sm leading-relaxed">
                  Seleccione un <strong>Área</strong> y marque <strong>Niveles</strong> en el panel izquierdo, 
                  o utilice el botón <strong>"Ver Historial Completo"</strong>.
                </p>
              </div>
            ) : (
              // Tabla de Datos
              <TablaHistorial 
                data={historialFiltrado} 
                isLoading={isLoading} 
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}