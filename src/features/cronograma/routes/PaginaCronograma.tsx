import { CalendarRange, Plus } from 'lucide-react';
import { useGestorCronograma } from '../hooks/useGestorCronograma';
import { TimelineContainer } from '../components/TimelineContainer';
import { ModalGestorFechas } from '../components/ModalGestorFechas';
import { ModalError } from '../components/ModalError';
import { Alert } from '@/components/ui/Alert';

export function PaginaCronograma() {
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

  return (
    <div className="min-h-screen bg-neutro-50 p-4 md:p-8 font-display">
      <main className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-neutro-200 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-negro flex items-center gap-3 tracking-tight">
              <CalendarRange className="text-principal-600" size={32} />
              Cronograma de Fases
            </h1>
            <p className="text-neutro-600 mt-2 text-lg">
              Gestione y active las etapas de la olimpiada.
            </p>
          </div>
          
          <button 
            onClick={abrirModalCrear}
            className="bg-principal-600 text-white px-5 py-3 rounded-xl font-bold shadow-lg hover:bg-principal-700 transition-transform active:scale-95 flex items-center gap-2"
          >
            <Plus size={20} strokeWidth={3} />
            Nueva Fase Global
          </button>
        </header>

        {isError && <Alert type="error" message="Error de conexión al cargar las fases." />}
        
        <section className="bg-white/50 rounded-3xl p-4 md:p-8 relative overflow-hidden min-h-[600px]">
          <div className="absolute top-0 right-0 w-96 h-96 bg-principal-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          <TimelineContainer 
            fases={fases}
            isLoading={isLoading}
            onEdit={abrirModalEditar}
            onActivate={handleActivar}
          />
        </section>

      </main>

      <ModalGestorFechas 
        isOpen={modalOpen}
        modoCreacion={modoCreacion}
        fase={faseSeleccionada}
        onClose={cerrarModal}
        onGuardar={handleGuardar}
        isSaving={isSaving}
      />

      <ModalError 
        isOpen={errorModalOpen}
        onClose={cerrarModalError}
        message={errorMessage}
      />
    </div>
  );
}