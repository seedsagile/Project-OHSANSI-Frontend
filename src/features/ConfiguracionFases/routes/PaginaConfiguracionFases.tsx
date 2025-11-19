import { LoaderCircle, AlertCircle } from 'lucide-react';
import { useConfiguracionFases } from '../hooks/useConfiguracionFases';
import { TablaFases } from '../components/TablaFases';
import { Alert } from '@/components/ui/Alert'; 

export function PaginaConfiguracionFases() {
  const {
    matrizData,
    isLoading,
    isSaving,
    isError,
    errorMessage,
    handleGuardar,
    handleCancelar,
  } = useConfiguracionFases();

  return (
    <div className="min-h-screen bg-neutro-50 p-4 md:p-8 font-display">
      <main className="max-w-7xl mx-auto space-y-6">
        <section className="relative min-h-[400px]">
          
          {/* Estado: Cargando */}
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm rounded-2xl border border-neutro-100 z-10">
              <LoaderCircle className="animate-spin text-principal-500 h-12 w-12 mb-4" />
              <p className="text-neutro-600 font-medium animate-pulse">
                Cargando configuración...
              </p>
            </div>
          )}

          {/* Estado: Error */}
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

          {/* Estado: Éxito - Mostrar Tabla */}
          {!isLoading && !isError && matrizData && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <TablaFases
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
    </div>
  );
}