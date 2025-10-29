import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useVerificacionResponsable } from './useVerificacionResponsable';
import { useFormularioPrincipalResponsable } from './useFormularioPrincipalResponsable';
import { useSeleccionAreasResponsable } from './useSeleccionAreasResponsable';
import type { PasoRegistroResponsable, ModalFeedbackState, ResponsableCreado, ResponsableActualizado, DatosPersonaVerificada } from '../types'; // Importar ResponsableActualizado
import { GESTION_ACTUAL_ANIO } from '../utils/constants';

const initialModalState: ModalFeedbackState = { isOpen: false, title: '', message: '', type: 'info' };

export function useGestionResponsable() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [pasoActual, setPasoActual] = useState<PasoRegistroResponsable>('VERIFICACION_CI');
  const [modalFeedback, setModalFeedback] = useState<ModalFeedbackState>(initialModalState);
  const [datosPersona, setDatosPersona] = useState<DatosPersonaVerificada | null>(null);
  const [isAssignedToCurrentGestion, setIsAssignedToCurrentGestion] = useState(false);
  const [initialAreasReadOnly, setInitialAreasReadOnly] = useState<number[]>([]);

  const modalTimerRef = useRef<number | undefined>(undefined);
    useEffect(() => {
        // Limpiar temporizador al desmontar
        return () => clearTimeout(modalTimerRef.current);
    }, []);

    const closeModalFeedback = useCallback(() => {
        setModalFeedback(initialModalState);
        clearTimeout(modalTimerRef.current);
    }, []);

  // --- Callback de Verificación (CORREGIDO: parámetro 'ci' eliminado) ---
  const handleVerificationComplete = useCallback((
      data: DatosPersonaVerificada | null,
      // ci: string, // <-- Eliminado ya que no se usaba aquí
      isAlreadyAssigned: boolean,
      initialAreas: number[]
  ) => {
      // console.log("[useGestionResponsable] Verification Complete Callback:", { data, isAlreadyAssigned, initialAreas }); // Mantenemos el log sin 'ci'
      setDatosPersona(data);
      setIsAssignedToCurrentGestion(isAlreadyAssigned);
      setInitialAreasReadOnly(initialAreas);
      setPasoActual(isAlreadyAssigned ? 'READ_ONLY' : 'FORMULARIO_DATOS');
  }, []);

  const handleVerificationError = useCallback((message: string) => {
      setModalFeedback({ isOpen: true, type: 'error', title: 'Error Verificación', message });
      setPasoActual('VERIFICACION_CI');
  }, []);

  const {
    isVerifying,
    formMethodsVerificacion,
    handleVerificarCISubmit,
    resetVerification,
    ciVerificado, // <-- Necesitamos este valor para las queries
  } = useVerificacionResponsable(handleVerificationComplete, handleVerificationError);

  const handleCancelarCallbackRef = useRef<() => void>(undefined); // Usamos ref para evitar dependencia circular

  const {
    formMethodsPrincipal,
    gestionesPasadas,
    areasDisponiblesQuery,
    isLoadingGestiones,
    isSaving, // <-- Usar el estado combinado del hook
    onSubmitFormularioPrincipal,
    handleGestionSelect,
    gestionPasadaSeleccionadaId,
    gestionPasadaSeleccionadaAnio, // <-- Variable necesaria declarada aquí
    primerInputRef,
    resetFormularioPrincipal, // <-- Obtenemos la función de reset
  } = useFormularioPrincipalResponsable({
      ciVerificado,
      datosPersonaVerificada: datosPersona,
      isReadOnly: isAssignedToCurrentGestion,
      initialAreas: initialAreasReadOnly,
      // Pasamos la función onSucess definida más abajo
      onFormSubmitSuccess: (data, esActualizacion) => {
          handleFormSubmitSuccess(data, esActualizacion);
      },
      onFormSubmitError: (message) => {
         handleFormSubmitError(message);
      }
  });

   // --- Definir handleCancelar AHORA que tenemos resetFormularioPrincipal ---
   const handleCancelar = useCallback(() => {
    // Si está en modo ReadOnly, simplemente navega
    if (isAssignedToCurrentGestion) {
        navigate('/responsables');
    } else {
        // Si NO está en ReadOnly (es Cancelar normal), resetea todo
        resetVerification();
        resetFormularioPrincipal(true); // resetToDefault = true
        setDatosPersona(null);
        setIsAssignedToCurrentGestion(false);
        setInitialAreasReadOnly([]);
        setPasoActual('VERIFICACION_CI');
        closeModalFeedback();
    }
    // Asegúrate de incluir navigate y isAssignedToCurrentGestion en las dependencias
  }, [isAssignedToCurrentGestion, navigate, resetVerification, resetFormularioPrincipal, closeModalFeedback]);

    // Asignar al ref para usar en onSuccess
    handleCancelarCallbackRef.current = handleCancelar;


  // --- Callback onSuccess (CORREGIDO: Dependencias ajustadas) ---
   const handleFormSubmitSuccess = useCallback((data: ResponsableCreado | ResponsableActualizado, esActualizacion: boolean) => {
      const message = data.message || (esActualizacion ? 'Responsable actualizado.' : 'Responsable registrado.');
      setModalFeedback({ isOpen: true, type: 'success', title: '¡Éxito!', message });

      // Invalidaciones existentes
      queryClient.invalidateQueries({ queryKey: ['responsables'] });
      if (gestionPasadaSeleccionadaAnio) {
        queryClient.invalidateQueries({ queryKey: ['areasPasadas', gestionPasadaSeleccionadaAnio, ciVerificado] });
      }
      queryClient.invalidateQueries({ queryKey: ['gestionesPasadas', ciVerificado] });

      // --- AÑADIR ESTA INVALIDACIÓN ---
      if (esActualizacion && ciVerificado) {
        queryClient.invalidateQueries({ queryKey: ['areasPasadas', GESTION_ACTUAL_ANIO, ciVerificado] }); // Invalidar caché de áreas actuales
      }
      // --- FIN DE LA ADICIÓN ---


      modalTimerRef.current = window.setTimeout(() => {
          closeModalFeedback();
          if (handleCancelarCallbackRef.current) {
            handleCancelarCallbackRef.current();
          }
          navigate('/responsables');
      }, 2000);
  // Asegúrate de incluir GESTION_ACTUAL_ANIO en las dependencias si lo usas directamente
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryClient, closeModalFeedback, navigate, ciVerificado, gestionPasadaSeleccionadaAnio]); // Añadir GESTION_ACTUAL_ANIO si es necesario

  const handleFormSubmitError = useCallback((message: string) => {
      setModalFeedback({ isOpen: true, type: 'error', title: 'Error Guardado', message });
      // Mantener el paso actual
  }, []);

  // --- Hook Selección Áreas (sin cambios necesarios aquí) ---
  const {
    handleSeleccionarArea,
    handleToggleSeleccionarTodas,
    isLoadingAreas,
    areasLoadedFromPast,
  } = useSeleccionAreasResponsable({
      formMethods: formMethodsPrincipal,
      ciVerificado,
      gestionPasadaSeleccionadaAnio, // <-- Pasarlo aquí está bien
      initialAreas: initialAreasReadOnly,
      isReadOnly: isAssignedToCurrentGestion,
      areasDisponiblesQuery,
  });

  // --- Recálculo de isLoading y isProcessing (sin cambios) ---
  const isLoading = areasDisponiblesQuery.isLoading || isLoadingGestiones || isLoadingAreas;
  const isProcessing = isVerifying || isSaving; // <-- Usar isSaving combinado
  const pasoActualUI = isVerifying ? 'CARGANDO_VERIFICACION'
        : isSaving ? 'CARGANDO_GUARDADO' // <-- Usar isSaving combinado
        : isAssignedToCurrentGestion ? 'READ_ONLY'
        : pasoActual;


  return {
    pasoActual: pasoActualUI,
    datosPersona,
    areasDisponibles: areasDisponiblesQuery.data || [],
    gestionesPasadas,
    modalFeedback,
    isReadOnly: isAssignedToCurrentGestion,
    gestionPasadaSeleccionadaId,
    areasLoadedFromPast,
    isLoading,
    isLoadingGestiones,
    isProcessing,
    formMethodsVerificacion,
    formMethodsPrincipal,
    primerInputRef,
    handleVerificarCISubmit,
    handleSeleccionarArea,
    handleToggleSeleccionarTodas,
    handleGestionSelect,
    onSubmitFormularioPrincipal,
    handleCancelar, // <-- Devolver la función definida
    closeModalFeedback,
  };
}