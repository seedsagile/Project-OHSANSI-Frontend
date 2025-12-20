import { useMemo } from 'react';
import { CalendarRange, Plus, Info, Rocket, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query'; 
import { useGestorCronograma } from '../hooks/useGestorCronograma';
import { TimelineContainer } from '../components/TimelineContainer';
import { ModalGestorFechas } from '../components/ModalGestorFechas';
import { ModalError } from '@/components/ui/ModalError'; 
import { Alert } from '@/components/ui/Alert';

export function PaginaCronograma() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient(); 
  
  const {
    fases,
    isLoading,
    isError,
    abrirModalCrear,
    abrirModalEditar,
    handleActivar,
    modalOpen,
    modoCreacion,
    faseSeleccionada,
    cerrarModal,
    handleGuardar,
    isSaving,
    errorModalOpen,
    errorMessage,
    cerrarModalError
  } = useGestorCronograma();

  const esModoSetup = location.pathname.includes('configuracionCronograma');

  const isEmpty = !isLoading && fases.length === 0;

  const siguienteOrdenSugerido = useMemo(() => {
    if (fases.length === 0) return 1;
    const maxOrden = Math.max(...fases.map(f => f.orden));
    return maxOrden + 1;
  }, [fases]);

  const tieneConfig = fases.some(f => f.codigo === 'CONFIGURACION');
  const tieneEval = fases.some(f => f.codigo === 'EVALUACION');
  const tieneFinal = fases.some(f => f.codigo === 'FINAL');
  const puedeContinuar = tieneConfig && tieneEval && tieneFinal;

  const handleFinalizar = async () => {
    await queryClient.invalidateQueries({ queryKey: ['sistemaEstado'] });
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen bg-neutro-50 p-4 md:p-8 font-display">
      <main className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
        
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-neutro-200 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-negro flex items-center gap-3 tracking-tight">
              <CalendarRange className="text-principal-600" size={32} />
              Cronograma de Fases
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-2">
              <p className="text-neutro-600 text-lg">
                Gestione las etapas de la olimpiada.
              </p>
              
              <div className="flex gap-2">
                <EstadoBadge label="Config" active={tieneConfig} />
                <EstadoBadge label="Eval" active={tieneEval} />
                <EstadoBadge label="Final" active={tieneFinal} />
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={abrirModalCrear}
              className="bg-principal-600 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-principal-500/30 hover:bg-principal-700 hover:shadow-principal-500/40 transition-all active:scale-95 flex items-center gap-2"
            >
              <Plus size={20} strokeWidth={3} />
              <span className="hidden sm:inline">Nueva Fase</span>
            </button>

            {puedeContinuar && esModoSetup && (
              <button
                onClick={handleFinalizar}
                className="bg-green-600 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-green-500/30 hover:bg-green-700 hover:shadow-green-500/40 transition-all active:scale-95 flex items-center gap-2 animate-pulse"
              >
                <span>Finalizar</span>
                <ArrowRight size={20} strokeWidth={3} />
              </button>
            )}
          </div>
        </header>

        {isError && (
          <Alert type="error" message="No se pudieron cargar las fases. Revise su conexión." />
        )}
        
        <section className="bg-white/50 rounded-3xl p-4 md:p-8 relative overflow-hidden min-h-[600px] border border-white shadow-sm backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-96 h-96 bg-principal-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center h-full py-24 text-center z-10 relative animate-in zoom-in-95 duration-500">
              <div className="bg-principal-100 p-8 rounded-full mb-6 shadow-inner ring-4 ring-white">
                <Rocket className="text-principal-600 w-16 h-16" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                Comencemos a configurar la Olimpiada
              </h3>
              <p className="text-gray-500 max-w-md mx-auto mb-8 text-lg leading-relaxed">
                Esta gestión es nueva y aún no tiene etapas definidas. 
                Cree la <strong className="text-principal-700">Primera Fase</strong> para activar el flujo del sistema.
              </p>
              
              <div className="flex flex-col gap-4 w-full max-w-xs">
                <button 
                  onClick={abrirModalCrear}
                  className="w-full bg-principal-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:bg-principal-700 transition-colors shadow-lg flex items-center justify-center gap-3"
                >
                  <Plus size={24} />
                  Crear Primera Fase
                </button>
                <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                  <Info size={14} />
                  <span>Se sugerirá el Orden #1 automáticamente</span>
                </div>
              </div>
            </div>
          ) : (
            <TimelineContainer 
              fases={fases}
              isLoading={isLoading}
              onEdit={abrirModalEditar} 
              onActivate={handleActivar}
            />
          )}
        </section>

      </main>

      <ModalGestorFechas 
        isOpen={modalOpen}
        modoCreacion={modoCreacion}
        fase={faseSeleccionada}
        onClose={cerrarModal}
        onGuardar={handleGuardar}
        isSaving={isSaving}
        siguienteOrdenSugerido={siguienteOrdenSugerido}
      />

      <ModalError 
        isOpen={errorModalOpen}
        onClose={cerrarModalError}
        error={errorMessage}
      />
    </div>
  );
}

const EstadoBadge = ({ label, active }: { label: string, active: boolean }) => (
  <span className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1 font-bold tracking-wide ${
    active ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-400 border-gray-200'
  }`}>
    {active ? <CheckCircle2 size={10} /> : <div className="w-2.5 h-2.5 rounded-full border border-gray-400" />}
    {label}
  </span>
);