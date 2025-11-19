import { Layers } from 'lucide-react';
import { useSubFases } from '../hooks/useSubFases';
import { SubFaseCard } from '../components/SubFaseCard';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { Alert } from '@/components/ui/Alert';

export function PaginaAdministrarSubFases() {
  const { 
    subFases, 
    areasOptions, 
    nivelesOptions,
    isLoading,
    isLoadingNiveles,
    isUpdating,
    isError,
    filtros: { areaId, nivelId },
    acciones: { 
      seleccionarArea, 
      setNivelId,
      cambiarEstado, 
      puedeIniciar, 
      puedeFinalizar 
    }
  } = useSubFases();

  // Mapeo para dropdowns
  const dropdownAreas = areasOptions.map(a => ({ value: a.id_area, label: a.nombre }));
  const dropdownNiveles = nivelesOptions.map(n => ({ value: n.id_nivel, label: n.nombre }));

  return (
    <div className="min-h-screen bg-neutro-50 p-4 md:p-8 font-display">
      <main className="max-w-7xl mx-auto space-y-8 animate-fade-in">
        
        <header className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-full shadow-sm mb-2 border border-neutro-100">
            <Layers className="text-principal-600" size={32} />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-negro tracking-tight">
            Administrar Sub-Fases
          </h1>
          <p className="text-neutro-600 max-w-2xl mx-auto text-lg">
            Gestione el flujo de evaluación, inicie etapas y finalice procesos por Área y Nivel.
          </p>
        </header>

        <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-neutro-200 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 relative z-20">
          
          <div>
            <label className="block text-sm font-bold text-neutro-700 mb-2 uppercase tracking-wide">
              Seleccionar Área
            </label>
            <CustomDropdown
              options={dropdownAreas}
              selectedValue={areaId}
              onSelect={(val) => seleccionarArea(Number(val))} 
              placeholder="-- Elija un área --"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-neutro-700 mb-2 uppercase tracking-wide">
              Seleccionar Nivel
            </label>
            <CustomDropdown
              options={dropdownNiveles}
              selectedValue={nivelId}
              onSelect={(val) => setNivelId(Number(val))}
              placeholder={
                !areaId 
                  ? "← Seleccione un área primero" 
                  : isLoadingNiveles 
                    ? "Cargando niveles..." 
                    : "-- Elija un nivel --"
              }
              disabled={!areaId || isLoadingNiveles} 
            />
          </div>
        </section>

        {isError && (
          <div className="max-w-2xl mx-auto">
            <Alert type="error" message="No se pudo conectar con el servidor de fases. Por favor, intente nuevamente más tarde." />
          </div>
        )}

        <section className="relative z-10 min-h-[400px] transition-all duration-300">
          
          {(!areaId || !nivelId) && (
            <div className="flex flex-col items-center justify-center py-24 bg-white/50 rounded-2xl border-2 border-dashed border-neutro-300 text-neutro-500">
              <Layers size={48} className="opacity-20 mb-4"/>
              <p className="text-xl font-semibold text-neutro-600">Comience la configuración</p>
              <p className="text-sm mt-1">
                {!areaId ? 'Seleccione un Área para empezar' : 'Ahora seleccione un Nivel específico'}
              </p>
            </div>
          )}

          {areaId && nivelId && isLoading && (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-principal-200 border-t-principal-600 mb-4"></div>
              <p className="text-neutro-600 font-medium animate-pulse">Sincronizando fases...</p>
            </div>
          )}

          {areaId && nivelId && !isLoading && subFases.length === 0 && (
            <div className="text-center py-24 bg-white rounded-xl shadow-sm border border-neutro-100">
              <p className="font-bold text-xl text-neutro-700 mb-2">No se encontraron fases</p>
              <p className="text-neutro-500 max-w-md mx-auto">
                No hay sub-fases configuradas para este nivel. Contacte al administrador si cree que esto es un error.
              </p>
            </div>
          )}

          {areaId && nivelId && !isLoading && subFases.length > 0 && (
            <div className="animate-slide-up">
              <div className="flex items-center justify-between mb-6 px-1">
                <h2 className="text-xl font-bold text-negro flex items-center gap-2">
                  Fases del proceso
                </h2>
                <span className="text-xs font-bold text-principal-700 bg-principal-50 px-3 py-1.5 rounded-full border border-principal-200 uppercase tracking-wider">
                  {subFases.length} Etapas Totales
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subFases.map((fase) => (
                  <SubFaseCard
                    key={fase.id_subfase}
                    fase={fase}
                    isUpdating={isUpdating}
                    puedeIniciar={puedeIniciar(fase)}
                    puedeFinalizar={puedeFinalizar(fase)}
                    onIniciar={() => {
                      const confirmMsg = `¿Está seguro de INICIAR la fase "${fase.nombre}"?\n\n` +
                                          `• Se habilitará la carga de notas para los evaluadores.\n` +
                                          `• Los estudiantes podrán ver que la fase está activa.`;
                      if(confirm(confirmMsg)) {
                        cambiarEstado({ id: fase.id_subfase, estado: 'EN_EVALUACION' });
                      }
                    }}
                    onFinalizar={() => {
                      const confirmMsg = `¿Está seguro de FINALIZAR la fase "${fase.nombre}"?\n\n` + 
                                      `⚠️ ADVERTENCIA IRREVERSIBLE:\n` +
                                      `• Se BLOQUEARÁ el registro de notas.\n` +
                                      `• Se habilitará el paso a la siguiente fase.\n` + 
                                      `• No podrá deshacer esta acción.`;
                      if(confirm(confirmMsg)) {
                        cambiarEstado({ id: fase.id_subfase, estado: 'FINALIZADA' });
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
      
      <style>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.4s ease-out forwards;
        }
        .animate-fade-in {
          animation: opacity 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}