import { FormProvider } from 'react-hook-form';
import { LoaderCircle, X, Save, Check } from 'lucide-react';
import { useGestionResponsable } from '../hooks/useGestionResponsable';
import { VerificacionCI } from '../components/VerificacionCI';
import { FormularioDatosResponsable } from '../components/FormularioDatosResponsable';
import { TablaAsignacionAreas } from '../components/TablaAsignacionAreas';
import { Modal1 } from '@/components/ui/Modal1';
import { Alert } from '@/components/ui/Alert';
import { useMemo } from 'react';

export function PaginaRegistrarResponsable() {
  const {
    pasoActual,
    formMethodsVerificacion,
    formMethodsPrincipal,
    areasDisponibles,
    areasDisponiblesQuery,
    gestionesPasadas,
    datosPersona,
    isLoading,
    isLoadingGestiones,
    isProcessing,
    modalFeedback,
    handleVerificarCISubmit,
    handleSeleccionarArea,
    onSubmitFormularioPrincipal,
    handleCancelar,
    closeModalFeedback,
    primerInputRef,
    handleGestionSelect,
    gestionPasadaSeleccionadaId,
    isReadOnly: isDataFormReadOnly,
    isAssignedToCurrentGestion,
    initialAreasReadOnly,
    handleToggleSeleccionarTodas,
    areasLoadedFromPast,
    finalizeSuccessAction,
  } = useGestionResponsable();

  const { formState } = formMethodsPrincipal;

  const mostrarCargaPagina =
    isLoading &&
    (pasoActual === 'VERIFICACION_CI' || pasoActual === 'CARGANDO_VERIFICACION');
  const pasoVerificacionActivo =
    pasoActual.startsWith('VERIFICACION') || pasoActual === 'CARGANDO_VERIFICACION';
  const pasoFormularioActivo =
    pasoActual.startsWith('FORMULARIO') || pasoActual === 'CARGANDO_GUARDADO';
  const pasoVerificacionCompletado = !pasoVerificacionActivo;

  const preAsignadasSet = useMemo(() => {
    return isAssignedToCurrentGestion
      ? new Set(initialAreasReadOnly)
      : new Set<number>();
  }, [isAssignedToCurrentGestion, initialAreasReadOnly]);

  const falloCargaAreas = areasDisponiblesQuery.isError;

  const botonGuardarDeshabilitado =
    !formState.isValid || isLoading || isProcessing || falloCargaAreas;

  return (
    <>
      <div className="bg-neutro-100 min-h-screen p-4 md:p-8 font-display flex justify-center items-start pt-12 md:pt-16">
        <main className="bg-blanco w-full max-w-4xl rounded-xl shadow-sombra-3 p-6 md:p-8 relative transition-all duration-300 ease-in-out">
          {(isProcessing || mostrarCargaPagina) && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex flex-col justify-center items-center z-20 rounded-xl transition-opacity duration-200">
              <LoaderCircle className="animate-spin h-12 w-12 text-principal-500" />
              <p className="mt-4 text-neutro-600 font-semibold">
                {pasoActual === 'CARGANDO_VERIFICACION' && 'Verificando CI...'}
                {pasoActual === 'CARGANDO_GUARDADO' && 'Guardando responsable...'}
                {mostrarCargaPagina && 'Cargando datos iniciales...'}
              </p>
            </div>
          )}

          <header className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-extrabold text-negro tracking-tighter">
              Registrar Responsable de Área
            </h1>
          </header>

          <div className="flex justify-center items-center space-x-2 sm:space-x-4 mb-8 text-sm sm:text-base">
            <span
              className={`flex items-center gap-2 font-semibold ${
                pasoVerificacionActivo ? 'text-principal-600' : 'text-neutro-500'
              }`}
            >
              <span
                className={`flex items-center justify-center w-6 h-6 rounded-full border-2 ${
                  pasoVerificacionCompletado
                    ? 'border-principal-600 bg-principal-600 text-white'
                    : pasoVerificacionActivo
                      ? 'border-principal-600 bg-principal-600 text-white'
                      : 'border-neutro-400'
                }`}
              >
                {pasoVerificacionCompletado ? <Check size={16} /> : '1'}
              </span>
              Verificar CI
            </span>
            <span
              className={`h-1 w-8 sm:w-12 rounded ${
                pasoFormularioActivo ? 'bg-principal-500' : 'bg-neutro-300'
              }`}
            ></span>
            <span
              className={`flex items-center gap-2 font-semibold ${
                pasoFormularioActivo ? 'text-principal-600' : 'text-neutro-400'
              }`}
            >
              <span
                className={`flex items-center justify-center w-6 h-6 rounded-full border-2 ${
                  pasoFormularioActivo ? 'border-principal-600 bg-principal-600 text-white' : 'border-neutro-400'
                }`}
              >
                2
              </span>
              Completar Datos
            </span>
          </div>

          <div className="transition-opacity duration-300 ease-in-out">
            {pasoActual === 'VERIFICACION_CI' && (
              <FormProvider {...formMethodsVerificacion}>
                <VerificacionCI onSubmit={handleVerificarCISubmit} />
              </FormProvider>
            )}

            {pasoFormularioActivo && (
              <FormProvider {...formMethodsPrincipal}>
                <form onSubmit={onSubmitFormularioPrincipal} noValidate>

                  {datosPersona?.Id_usuario &&
                    !isAssignedToCurrentGestion &&
                    !falloCargaAreas && (
                      <Alert
                        type="info"
                        message={`Se encontraron datos existentes. Los datos personales no son editables. Por favor, asigne las áreas para la gestión actual.`}
                      />
                    )}

                  {isAssignedToCurrentGestion && !falloCargaAreas && (
                    <Alert
                      type="warning"
                      message={`Este responsable ya se encuentra asignado. Las áreas asignadas (marcadas con 🔒) no son editables, pero puede añadir nuevas.`}
                    />
                  )}

                  <FormularioDatosResponsable
                    ref={primerInputRef}
                    gestiones={gestionesPasadas}
                    personaVerificada={datosPersona}
                    isLoading={isLoading}
                    isLoadingGestiones={isLoadingGestiones}
                    isReadOnly={isDataFormReadOnly}
                    isAssignedToCurrentGestion={isAssignedToCurrentGestion}
                    onGestionSelect={handleGestionSelect}
                    gestionPasadaSeleccionadaId={gestionPasadaSeleccionadaId}
                  />

                  <hr className="my-8 border-t border-neutro-200" />

                  <TablaAsignacionAreas
                    areas={areasDisponibles}
                    onSeleccionarArea={handleSeleccionarArea}
                    onToggleSeleccionarTodas={handleToggleSeleccionarTodas}
                    isLoading={isLoading}
                    isReadOnly={isLoading || isProcessing}
                    preAsignadas={preAsignadasSet}
                    areasFromPastGestion={areasLoadedFromPast}
                    gestionPasadaId={gestionPasadaSeleccionadaId}
                  />

                  <footer className="flex justify-end items-center gap-4 mt-12 border-t border-neutro-200 pt-6">
                    <button
                      type="button"
                      onClick={handleCancelar}
                      disabled={isProcessing}
                      className="flex items-center justify-center gap-2 font-semibold py-2.5 
                      px-6 rounded-lg bg-neutro-200 text-neutro-700 hover:bg-neutro-300
                      transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X size={20} strokeWidth={2.5} />
                      <span>{isAssignedToCurrentGestion ? 'Volver' : 'Cancelar'}</span>
                    </button>

                    <button
                      type="submit"
                      disabled={botonGuardarDeshabilitado}
                      className="flex items-center justify-center gap-2 min-w-[150px] font-semibold 
                      py-2.5 px-6 rounded-lg bg-principal-500 text-blanco hover:bg-principal-600 
                      transition-colors disabled:bg-principal-300 disabled:cursor-not-allowed"
                    >
                      {pasoActual === 'CARGANDO_GUARDADO' ? (
                        <LoaderCircle size={20} className="animate-spin" />
                      ) : (
                        <Save size={20} strokeWidth={2.5} />
                      )}
                      <span>
                        {pasoActual === 'CARGANDO_GUARDADO'
                          ? 'Guardando...'
                          : 'Guardar'}
                      </span>
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
        onClose={
          modalFeedback.type === 'success'
            ? finalizeSuccessAction
            : closeModalFeedback
        }
        title={modalFeedback.title}
        type={modalFeedback.type}
      >
        {modalFeedback.message}
      </Modal1>
    </>
  );
}