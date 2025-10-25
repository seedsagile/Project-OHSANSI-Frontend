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
  const [isReadOnlyMode, setIsReadOnlyMode] = useState(false);
  const [initialAreasReadOnly, setInitialAreasReadOnly] = useState<number[]>([]);

  const modalTimerRef = useRef<number | undefined>(undefined);
    useEffect(() => {
        return () => clearTimeout(modalTimerRef.current);
    }, []);

    const closeModalFeedback = useCallback(() => {
        setModalFeedback(initialModalState);
        clearTimeout(modalTimerRef.current);
    }, []);

  // --- Hook de Verificación ---
  const {
    //pasoActualVerificacion,
    isVerifying,
    formMethodsVerificacion,
    handleVerificarCISubmit,
    resetVerification,
    ciVerificado,
  } = useVerificacionResponsable(
      (data, ci, initialReadOnlyState, initialAreas) => {
          console.log("Verification Complete:", { data, ci, initialReadOnlyState, initialAreas });
          setDatosPersona(data);
          setIsReadOnlyMode(initialReadOnlyState);
          setInitialAreasReadOnly(initialAreas);
          setPasoActual(initialReadOnlyState ? 'READ_ONLY' : 'FORMULARIO_DATOS');
      },
      (message) => {
          setModalFeedback({ isOpen: true, type: 'error', title: 'Error Verificación', message });
          setPasoActual('VERIFICACION_CI');
      }
  );

  // --- Hook del Formulario Principal ---
  const {
    formMethodsPrincipal,
    gestionesPasadas,
    areasDisponiblesQuery,
    isLoadingGestiones,
    isCreatingResponsable,
    onSubmitFormularioPrincipal,
    handleGestionPasadaChange,
    gestionPasadaSeleccionadaId,
    gestionPasadaSeleccionadaAnio,
    primerInputRef,
    resetFormularioPrincipal,
  } = useFormularioPrincipalResponsable({
      ciVerificado,
      datosPersonaVerificada: datosPersona,
      isReadOnly: isReadOnlyMode,
      initialAreas: initialAreasReadOnly,
      onFormSubmitSuccess: (data: ResponsableCreado) => {
          setModalFeedback({ isOpen: true, type: 'success', title: '¡Éxito!', message: data.message || `Responsable registrado.` });
          queryClient.invalidateQueries({ queryKey: ['responsables'] });
          modalTimerRef.current = window.setTimeout(() => {
              closeModalFeedback();
              handleCancelar();
              navigate('/dashboard');
          }, 2000);
      },
      onFormSubmitError: (message: string) => {
          setModalFeedback({ isOpen: true, type: 'error', title: 'Error Guardado', message });
          setPasoActual(isReadOnlyMode ? 'READ_ONLY' : 'FORMULARIO_DATOS');
      },
  });

  // --- Hook de Selección de Áreas ---
  const {
    areasSeleccionadas,
    handleSeleccionarArea,
    handleToggleSeleccionarTodas,
    isLoadingAreas,
  } = useSeleccionAreasResponsable({
      formMethods: formMethodsPrincipal,
      ciVerificado,
      gestionPasadaSeleccionadaAnio,
      initialAreas: initialAreasReadOnly,
      isReadOnly: isReadOnlyMode,
      areasDisponiblesQuery,
  });

  // --- Handler Cancelar General ---
  const handleCancelar = useCallback(() => {
    resetVerification();
    resetFormularioPrincipal(true);
    setDatosPersona(null);
    setIsReadOnlyMode(false);
    setInitialAreasReadOnly([]);
    setPasoActual('VERIFICACION_CI');
    closeModalFeedback();
  }, [resetVerification, resetFormularioPrincipal, closeModalFeedback]);

  // --- Estados Consolidados ---
  const isLoading = areasDisponiblesQuery.isLoading || isLoadingGestiones || isLoadingAreas;
  const isProcessing = isVerifying || isCreatingResponsable;
  const pasoActualUI = isVerifying ? 'CARGANDO_VERIFICACION'
        : isCreatingResponsable ? 'CARGANDO_GUARDADO'
        : isReadOnlyMode ? 'READ_ONLY'
        : pasoActual;


  // --- Objeto de Retorno ---
  return {
    pasoActual: pasoActualUI,
    datosPersona,
    areasDisponibles: areasDisponiblesQuery.data || [],
    gestionesPasadas,
    areasSeleccionadas,
    modalFeedback,
    isReadOnly: isReadOnlyMode,
    gestionPasadaSeleccionadaId,
    isLoading,
    isProcessing,
    formMethodsVerificacion,
    formMethodsPrincipal,
    primerInputRef,
    handleVerificarCISubmit,
    handleSeleccionarArea,
    handleToggleSeleccionarTodas,
    handleGestionPasadaChange,
    onSubmitFormularioPrincipal,
    handleCancelar,
    closeModalFeedback,
  };
}