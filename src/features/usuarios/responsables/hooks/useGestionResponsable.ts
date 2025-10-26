import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useVerificacionResponsable } from './useVerificacionResponsable';
import { useFormularioPrincipalResponsable } from './useFormularioPrincipalResponsable';
import { useSeleccionAreasResponsable } from './useSeleccionAreasResponsable';
import type { PasoRegistroResponsable, ModalFeedbackState, ResponsableCreado, DatosPersonaVerificada } from '../types';

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
        return () => clearTimeout(modalTimerRef.current);
    }, []);

    const closeModalFeedback = useCallback(() => {
        setModalFeedback(initialModalState);
        clearTimeout(modalTimerRef.current);
    }, []);

  const handleVerificationComplete = useCallback((
      data: DatosPersonaVerificada | null,
      ci: string,
      isAlreadyAssigned: boolean,
      initialAreas: number[]
  ) => {
      console.log("[useGestionResponsable] Verification Complete Callback:", { data, ci, isAlreadyAssigned, initialAreas });
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
    ciVerificado,
  } = useVerificacionResponsable(handleVerificationComplete, handleVerificationError);

  const handleFormSubmitSuccess = useCallback((data: ResponsableCreado) => {
      setModalFeedback({ isOpen: true, type: 'success', title: '¡Éxito!', message: data.message || `Responsable registrado.` });
      queryClient.invalidateQueries({ queryKey: ['responsables'] });
      modalTimerRef.current = window.setTimeout(() => {
          closeModalFeedback();
          if (handleCancelar) {
              handleCancelar();
          }
          navigate('/dashboard');
      }, 2000);
  }, [queryClient, closeModalFeedback, navigate]);

  const handleFormSubmitError = useCallback((message: string) => {
      setModalFeedback({ isOpen: true, type: 'error', title: 'Error Guardado', message });
      setPasoActual(isAssignedToCurrentGestion ? 'READ_ONLY' : 'FORMULARIO_DATOS');
  }, [isAssignedToCurrentGestion]);

  const {
    formMethodsPrincipal,
    gestionesPasadas,
    areasDisponiblesQuery,
    isLoadingGestiones,
    isCreatingResponsable,
    onSubmitFormularioPrincipal,
    handleGestionSelect,
    gestionPasadaSeleccionadaId,
    gestionPasadaSeleccionadaAnio,
    primerInputRef,
    resetFormularioPrincipal,
  } = useFormularioPrincipalResponsable({
      ciVerificado,
      datosPersonaVerificada: datosPersona,
      isReadOnly: isAssignedToCurrentGestion,
      initialAreas: initialAreasReadOnly,
      onFormSubmitSuccess: handleFormSubmitSuccess,
      onFormSubmitError: handleFormSubmitError,
  });

  const {
    handleSeleccionarArea,
    handleToggleSeleccionarTodas,
    isLoadingAreas,
    areasLoadedFromPast,
  } = useSeleccionAreasResponsable({
      formMethods: formMethodsPrincipal,
      ciVerificado,
      gestionPasadaSeleccionadaAnio,
      initialAreas: initialAreasReadOnly,
      isReadOnly: isAssignedToCurrentGestion,
      areasDisponiblesQuery,
  });

  const handleCancelar = useCallback(() => {
    resetVerification();
    resetFormularioPrincipal(true);
    setDatosPersona(null);
    setIsAssignedToCurrentGestion(false);
    setInitialAreasReadOnly([]);
    setPasoActual('VERIFICACION_CI');
    closeModalFeedback();
  }, [resetVerification, resetFormularioPrincipal, closeModalFeedback]);

  useEffect(() => {
      handleFormSubmitSuccess;
    }, [handleFormSubmitSuccess, handleCancelar]);


  const isLoading = areasDisponiblesQuery.isLoading || isLoadingGestiones || isLoadingAreas;
  const isProcessing = isVerifying || isCreatingResponsable;
  const pasoActualUI = isVerifying ? 'CARGANDO_VERIFICACION'
        : isCreatingResponsable ? 'CARGANDO_GUARDADO'
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
    handleCancelar,
    closeModalFeedback,
  };
}