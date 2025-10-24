// src/features/usuarios/responsables/routes/PaginaRegistrarResponsable.tsx
import { FormProvider } from 'react-hook-form';
import { LoaderCircle, X, Save, Check } from 'lucide-react'; // Importar Check

// Asegúrate que las rutas a los archivos sean correctas
import { useGestionResponsable } from '../hooks/useGestionResponsable';
import { VerificacionCI } from '../components/VerificacionCI';
import { FormularioDatosResponsable } from '../components/FormularioDatosResponsable';
import { TablaAsignacionAreas } from '../components/TablaAsignacionAreas';
import { Modal1 } from '@/components/ui/Modal1'; // Importar tu Modal genérico
import { Alert } from '@/components/ui/Alert'; // Importar Alert

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
    // NUEVO: Añadir referencia al primer input del formulario principal desde el hook
    primerInputRef,
  } = useGestionResponsable();

  // Determinar si mostrar el spinner de carga inicial
  const mostrarCargaPagina = isLoading && pasoActual !== 'FORMULARIO_DATOS';

  // --- NUEVO: Variables booleanas para claridad en el Stepper ---
  const pasoVerificacionActivo = pasoActual.startsWith('VERIFICACION') || pasoActual === 'CARGANDO_VERIFICACION';
  const pasoFormularioActivo = pasoActual.startsWith('FORMULARIO') || pasoActual === 'CARGANDO_GUARDADO';
  const pasoVerificacionCompletado = !pasoVerificacionActivo; // Paso 1 completado si ya no está activo


  return (
    <>
      <div className="bg-neutro-100 min-h-screen p-4 md:p-8 font-display flex justify-center items-start pt-12 md:pt-16"> {/* Ajustado padding top */}
        <main className="bg-blanco w-full max-w-4xl rounded-xl shadow-sombra-3 p-6 md:p-8 relative transition-all duration-300 ease-in-out"> {/* Añadida transición */}
          {/* --- Overlay de Carga General --- */}
          {(isProcessing || mostrarCargaPagina) && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex flex-col justify-center items-center z-20 rounded-xl transition-opacity duration-200"> {/* Añadida transición */}
              <LoaderCircle className="animate-spin h-12 w-12 text-principal-500" />
              <p className="mt-4 text-neutro-600 font-semibold">
                {pasoActual === 'CARGANDO_VERIFICACION' && 'Verificando CI...'}
                {pasoActual === 'CARGANDO_GUARDADO' && 'Guardando responsable...'}
                {mostrarCargaPagina && 'Cargando datos iniciales...'}
              </p>
            </div>
          )}

          <header className="text-center mb-6"> {/* Reducido margen inferior */}
            <h1 className="text-3xl md:text-4xl font-extrabold text-negro tracking-tighter">
              Registrar Responsable de Área
            </h1>
          </header>

          {/* Stepper Visual Mejorado */}
          <div className="flex justify-center items-center space-x-2 sm:space-x-4 mb-8 text-sm sm:text-base">
            <span className={`flex items-center gap-2 font-semibold ${pasoVerificacionActivo ? 'text-principal-600' : 'text-neutro-500'}`}>
              <span className={`flex items-center justify-center w-6 h-6 rounded-full border-2 ${
                pasoVerificacionCompletado ? 'border-exito-500 bg-exito-500 text-white' : // Check si completado
                pasoVerificacionActivo ? 'border-principal-600 bg-principal-600 text-white' : // Activo
                'border-neutro-400' // Inactivo
              }`}>
                {/* NUEVO: Mostrar Check si está completado */}
                {pasoVerificacionCompletado ? <Check size={16} /> : '1'}
              </span>
              Verificar CI
            </span>
            <span className={`h-1 w-8 sm:w-12 rounded ${pasoFormularioActivo ? 'bg-principal-500' : 'bg-neutro-300'}`}></span> {/* Línea conector */}
            <span className={`flex items-center gap-2 font-semibold ${pasoFormularioActivo ? 'text-principal-600' : 'text-neutro-400'}`}>
               <span className={`flex items-center justify-center w-6 h-6 rounded-full border-2 ${pasoFormularioActivo ? 'border-principal-600 bg-principal-600 text-white' : 'border-neutro-400'}`}>2</span>
              Completar Datos
            </span>
          </div>


          {/* Contenedor para transiciones entre pasos (Opcional pero recomendado) */}
          <div className="transition-opacity duration-300 ease-in-out">
            {/* Paso 1: Verificación de CI */}
            {pasoActual === 'VERIFICACION_CI' && (
               <FormProvider {...formMethodsVerificacion}>
                 <VerificacionCI onSubmit={handleVerificarCISubmit} />
              </FormProvider>
            )}

            {/* Paso 2: Formulario Principal */}
            {pasoFormularioActivo && ( // Renderizar si el paso es FORMULARIO o CARGANDO_GUARDADO
              <FormProvider {...formMethodsPrincipal}>
                <form onSubmit={onSubmitFormularioPrincipal} noValidate>
                  {datosPersona?.id_persona && (
                      <Alert
                        type="info"
                        message={`Se encontraron datos existentes para el CI ingresado. Por favor, revise y complete la información.`}
                      />
                  )}
                  <FormularioDatosResponsable
                    ref={primerInputRef} // <-- Pasar la ref aquí
                    gestiones={gestionesPasadas}
                    personaVerificada={datosPersona}
                    isLoading={isLoading}
                  />

                  <hr className="my-8 border-t border-neutro-200" />

                  <TablaAsignacionAreas
                    areas={areasDisponibles}
                    areasSeleccionadas={areasSeleccionadas}
                    onSeleccionarArea={handleSeleccionarArea}
                    isLoading={isLoading}
                  />

                  <footer className="flex justify-end items-center gap-4 mt-12 border-t border-neutro-200 pt-6">
                    <button
                      type="button"
                      onClick={handleCancelar}
                      disabled={isProcessing}
                      className="flex items-center justify-center gap-2 font-semibold py-2.5 px-6 rounded-lg bg-neutro-200 text-neutro-700 hover:bg-neutro-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                       <X size={20} strokeWidth={2.5}/>
                      <span>Cancelar</span>
                    </button>

                    <button
                      type="submit"
                      disabled={isProcessing || isLoading}
                      className="flex items-center justify-center gap-2 min-w-[150px] font-semibold py-2.5 px-6 rounded-lg bg-principal-500 text-blanco hover:bg-principal-600 transition-colors disabled:bg-principal-300 disabled:cursor-not-allowed"
                    >
                      {pasoActual === 'CARGANDO_GUARDADO' ? (
                         <LoaderCircle size={20} className="animate-spin" />
                      ) : (
                         <Save size={20} strokeWidth={2.5}/>
                      )}
                      <span>{pasoActual === 'CARGANDO_GUARDADO' ? 'Guardando...' : 'Guardar'}</span>
                    </button>
                  </footer>
                </form>
              </FormProvider>
            )}
          </div>
        </main>
      </div>

      <Modal1
        isOpen={modalFeedback.isOpen}
        onClose={closeModalFeedback}
        title={modalFeedback.title}
        type={modalFeedback.type}
      >
        {modalFeedback.message}
      </Modal1>
    </>
  );
}