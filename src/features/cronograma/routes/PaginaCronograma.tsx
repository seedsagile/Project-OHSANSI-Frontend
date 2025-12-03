import { CalendarRange } from 'lucide-react';
import { useGestorCronograma } from '../hooks/useGestorCronograma';
import { TimelineContainer } from '../components/TimelineContainer';
import { ModalGestorFechas } from '../components/ModalGestorFechas';
import { Alert } from '@/components/ui/Alert';

export function PaginaCronograma() {
  const {
    fasesCalendario,
    isLoading,
    isError,
    isSaving,
    modalOpen,
    faseSeleccionada,
    restricciones,
    abrirModalProgramar,
    cerrarModal,
    handleGuardarFechas
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
              Gestione los periodos de habilitación para cada etapa de la olimpiada.
            </p>
          </div>
        </header>

        {isError && (
          <Alert 
            type="error" 
            message="No se pudo cargar la información del cronograma." 
          />
        )}

        <section className="bg-white rounded-2xl shadow-sm border border-neutro-200 p-2 md:p-8 min-h-[500px] relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-principal-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          <TimelineContainer 
            fases={fasesCalendario}
            loading={isLoading}
            onProgramarFase={abrirModalProgramar}
          />
        </section>

      </main>

      <ModalGestorFechas 
        isOpen={modalOpen}
        onClose={cerrarModal}
        fase={faseSeleccionada}
        onGuardar={handleGuardarFechas}
        isSaving={isSaving}
        restricciones={restricciones}
      />
    </div>
  );
}