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
        return () => clearTimeout(modalTimerRef.current);
    }, []);

    const closeModalFeedback = useCallback(() => {
        setModalFeedback(initialModalState);
        clearTimeout(modalTimerRef.current);
    }, []);

  const handleVerificationComplete = useCallback((
      data: DatosPersonaVerificada | null,
      isAlreadyAssigned: boolean,
      initialAreas: number[]
  ) => {
      setDatosPersona(data);
      setIsAssignedToCurrentGestion(isAlreadyAssigned);
      setInitialAreasReadOnly(initialAreas);
      setPasoActual(isAlreadyAssigned ? 'READ_ONLY' : 'FORMULARIO_DATOS');
  }, []);

  const finalizeSuccessAction = useCallback(() => {
    closeModalFeedback();
    if (handleCancelarCallbackRef.current) {
      handleCancelarCallbackRef.current();
    } else {
      navigate('/responsables');
    }
    clearTimeout(modalTimerRef.current);
  }, [closeModalFeedback, navigate]);

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

  const handleCancelarCallbackRef = useRef<() => void>(undefined);

  const {
    formMethodsPrincipal,
    gestionesPasadas,
    areasDisponiblesQuery,
    isLoadingGestiones,
    isSaving,
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
      onFormSubmitSuccess: (data, esActualizacion) => {
          handleFormSubmitSuccess(data, esActualizacion);
      },
      onFormSubmitError: (message) => {
          handleFormSubmitError(message);
      }
  });

  const handleCancelar = useCallback(() => {
    resetVerification();
    resetFormularioPrincipal(true);
    setDatosPersona(null);
    setIsAssignedToCurrentGestion(false);
    setInitialAreasReadOnly([]);
    setPasoActual('VERIFICACION_CI');
    closeModalFeedback();
    navigate('/responsables');
  }, [isAssignedToCurrentGestion, navigate, resetVerification, resetFormularioPrincipal, closeModalFeedback]);

  handleCancelarCallbackRef.current = handleCancelar;

  const handleFormSubmitSuccess = useCallback((data: ResponsableCreado | ResponsableActualizado, esActualizacion: boolean) => {
    
    const message = data.message || (esActualizacion ? '¡Responsable Asignado en nueva gestion!' : '¡Registro Exitoso!');

    setModalFeedback({
        isOpen: true,
        type: 'success',
        title: '¡Éxito!',
        message
    });

    queryClient.invalidateQueries({ queryKey: ['responsables'] });
    if (gestionPasadaSeleccionadaAnio) {
      queryClient.invalidateQueries({ queryKey: ['areasPasadas', gestionPasadaSeleccionadaAnio, ciVerificado] });
    }
    queryClient.invalidateQueries({ queryKey: ['gestionesPasadas', ciVerificado] });
    if (esActualizacion && ciVerificado) {
      queryClient.invalidateQueries({ queryKey: ['areasPasadas', GESTION_ACTUAL_ANIO, ciVerificado] });
    }

    clearTimeout(modalTimerRef.current);
    modalTimerRef.current = window.setTimeout(finalizeSuccessAction, 5000);

  }, [queryClient, ciVerificado, gestionPasadaSeleccionadaAnio, finalizeSuccessAction]);

  const handleFormSubmitError = useCallback((message: string) => {
      setModalFeedback({ isOpen: true, type: 'error', title: '¡Ups! Algo salió mal', message });
  }, []);

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

  const isLoading = areasDisponiblesQuery.isLoading || isLoadingGestiones || isLoadingAreas;
  const isProcessing = isVerifying || isSaving;
  const pasoActualUI = isVerifying ? 'CARGANDO_VERIFICACION'
        : isSaving ? 'CARGANDO_GUARDADO'
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
    finalizeSuccessAction
  };
}