// src/features/usuarios/responsables/routes/PaginaRegistrarResponsable.tsx
import { FormProvider } from 'react-hook-form';
import { LoaderCircle, X, Save } from 'lucide-react'; // Importar iconos

// Asegúrate que las rutas a los archivos sean correctas
import { useGestionResponsable } from '../hooks/useGestionResponsable';
import { VerificacionCI } from '../components/VerificacionCI';
import { FormularioDatosResponsable } from '../components/FormularioDatosResponsable';
import { TablaAsignacionAreas } from '../components/TablaAsignacionAreas';
import { Modal } from '@/components/ui/Modal'; // Importar tu Modal genérico

export function PaginaRegistrarResponsable() {
  const {
    pasoActual,
    formMethodsVerificacion,
    formMethodsPrincipal,
    areasDisponibles,
    gestionesPasadas,
    areasSeleccionadas,
    datosPersona,
    isLoading, // Carga inicial (áreas, gestiones)
    isProcessing, // Carga activa (verificando, guardando)
    modalFeedback,
    handleVerificarCISubmit, // Ya envuelto con handleSubmit
    handleSeleccionarArea,
    onSubmitFormularioPrincipal, // Ya envuelto con handleSubmit
    handleCancelar,
    closeModalFeedback,
  } = useGestionResponsable();

  // Determinar si mostrar el spinner de carga inicial
  const mostrarCargaPagina = isLoading && pasoActual !== 'FORMULARIO_DATOS';

  return (
    <>
      <div className="bg-neutro-100 min-h-screen p-4 md:p-8 font-display flex justify-center items-center">
        <main className="bg-blanco w-full max-w-4xl rounded-xl shadow-sombra-3 p-6 md:p-8 relative">
          {/* --- Overlay de Carga General --- */}
          {(isProcessing || mostrarCargaPagina) && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex flex-col justify-center items-center z-20 rounded-xl">
              <LoaderCircle className="animate-spin h-12 w-12 text-principal-500" />
              <p className="mt-4 text-neutro-600 font-semibold">
                {pasoActual === 'CARGANDO_VERIFICACION' && 'Verificando CI...'}
                {pasoActual === 'CARGANDO_GUARDADO' && 'Guardando responsable...'}
                {mostrarCargaPagina && 'Cargando datos iniciales...'}
              </p>
            </div>
          )}

          <header className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-extrabold text-negro tracking-tighter">
              Registrar Responsable de Área
            </h1>
          </header>

          {/* --- Paso 1: Verificación de CI --- */}
          {pasoActual === 'VERIFICACION_CI' && (
             <FormProvider {...formMethodsVerificacion}>
               <VerificacionCI onSubmit={handleVerificarCISubmit} />
            </FormProvider>
          )}

          {/* --- Paso 2: Formulario Principal --- */}
          {(pasoActual === 'FORMULARIO_DATOS' || pasoActual === 'CARGANDO_GUARDADO') && (
            <FormProvider {...formMethodsPrincipal}>
              {/* Usar onSubmitFormularioPrincipal que ya está envuelto por handleSubmit */}
              <form onSubmit={onSubmitFormularioPrincipal} noValidate>
                {/* Componente para Datos Personales y Gestión */}
                <FormularioDatosResponsable
                  gestiones={gestionesPasadas}
                  personaVerificada={datosPersona}
                  isLoading={isLoading} // Para deshabilitar campos si carga gestiones
                />

                <hr className="my-8 border-t border-neutro-200" />

                {/* Componente para la Tabla de Áreas */}
                <TablaAsignacionAreas
                  areas={areasDisponibles}
                  areasSeleccionadas={areasSeleccionadas}
                  onSeleccionarArea={handleSeleccionarArea}
                  isLoading={isLoading} // Para deshabilitar tabla si carga áreas
                />

                {/* Footer con Botones de Acción */}
                <footer className="flex justify-end items-center gap-4 mt-12 border-t border-neutro-200 pt-6">
                  <button
                    type="button"
                    onClick={handleCancelar}
                    disabled={isProcessing} // Deshabilitar si se está procesando
                    className="flex items-center justify-center gap-2 font-semibold py-2.5 px-6 rounded-lg bg-neutro-200 text-neutro-700 hover:bg-neutro-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                     <X size={20} strokeWidth={2.5}/>
                    <span>Cancelar</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isProcessing || isLoading} // Deshabilitar si carga o procesa
                    className="flex items-center justify-center gap-2 min-w-[150px] font-semibold py-2.5 px-6 rounded-lg bg-principal-500 text-blanco hover:bg-principal-600 transition-colors disabled:bg-principal-300 disabled:cursor-not-allowed"
                  >
                    <Save size={20} strokeWidth={2.5}/>
                    <span>Guardar</span>
                  </button>
                </footer>
              </form>
            </FormProvider>
          )}
        </main>
      </div>

      {/* --- Modal para Feedback --- */}
      <Modal
        isOpen={modalFeedback.isOpen}
        onClose={closeModalFeedback}
        title={modalFeedback.title}
        type={modalFeedback.type}
        // Este modal es solo informativo, no necesita botón de confirmación
      >
        {modalFeedback.message}
      </Modal>
    </>
  );
}