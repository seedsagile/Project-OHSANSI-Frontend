import { LoaderCircle, AlertCircle } from 'lucide-react';
import { useConfiguracionFases } from '../hooks/useConfiguracionFases';
import { TablaFases } from '../components/TablaFases';
import { Alert } from '@/components/ui/Alert';
import { Modal1 } from '@/components/ui/Modal1';

export function PaginaConfiguracionFases() {
  const {
    matrizData,
    gestionActual,
    isLoading,
    isSaving,
    isError,
    errorMessage,
    handleGuardar,
    handleCancelar,
    modalFeedback,
    closeModalFeedback,
    isCancelModalOpen,
    confirmarCancelacion,
    cerrarCancelModal,
    resetKey,
  } = useConfiguracionFases();

  return (
    <div className="min-h-screen bg-neutro-50 p-4 md:p-8 font-display">
      <main className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 border-b border-neutro-200 pb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-negro tracking-tight">
              Configuración de Fases
            </h1>
            <p className="text-neutro-500 mt-1 text-sm md:text-base">
              Gestión de permisos por etapa.
            </p>
          </div>
          
          {!isLoading && !isError && (
            <div className="text-left sm:text-right">
              <span className="text-xs uppercase tracking-wider text-neutro-500 font-semibold block">
                Gestión Actual
              </span>
              <div className="text-xl md:text-2xl font-bold text-principal-500">
                {gestionActual.gestion}
              </div>
            </div>
          )}
        </div>

        <section className="relative min-h-[400px]">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm rounded-2xl border border-neutro-100 z-10 min-h-[300px]">
              <LoaderCircle className="animate-spin text-principal-500 h-12 w-12 mb-4" />
              <p className="text-neutro-600 font-medium animate-pulse">
                Cargando configuración...
              </p>
            </div>
          )}

          {isError && (
            <div className="flex justify-center mt-8">
              <div className="max-w-2xl w-full">
                <Alert 
                  type="error" 
                  message={
                    <div className="flex flex-col gap-2">
                      <span className="font-bold flex items-center gap-2">
                        <AlertCircle size={20}/> Error al cargar datos
                      </span>
                      <span>{errorMessage || 'No se pudo conectar con el servidor.'}</span>
                      <button 
                        onClick={() => window.location.reload()}
                        className="text-sm underline mt-2 text-acento-700 hover:text-acento-900 w-fit"
                      >
                        Reintentar
                      </button>
                    </div>
                  } 
                />
              </div>
            </div>
          )}

          {!isLoading && !isError && matrizData && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <TablaFases
                key={resetKey} // <-- CORRECCIÓN: Esto fuerza el reseteo completo al cancelar
                acciones={matrizData.acciones}
                fases={matrizData.fases}
                permisosIniciales={matrizData.permisos}
                onGuardar={handleGuardar}
                onCancelar={handleCancelar}
                isSaving={isSaving}
              />
            </div>
          )}
        </section>
      </main>

      {/* Modal Cancelar */}
      <Modal1
        isOpen={isCancelModalOpen}
        onClose={cerrarCancelModal}
        title="¿Descartar cambios?"
        type="confirmation"
        confirmText="Sí, descartar"
        cancelText="Volver"
        onConfirm={confirmarCancelacion}
      >
        <p className="text-center text-neutro-600">
          Si cancela ahora, perderá todos los cambios no guardados en la tabla.
          ¿Desea restaurar los valores originales?
        </p>
      </Modal1>

      {/* Modal Feedback */}
      <Modal1
        isOpen={modalFeedback.isOpen}
        onClose={closeModalFeedback}
        title={modalFeedback.title}
        type={modalFeedback.type}
        onConfirm={closeModalFeedback}
        understoodText="Entendido"
      >
        <p className="text-center text-neutro-600 whitespace-pre-line">
          {modalFeedback.message}
        </p>
      </Modal1>
    </div>
  );
}