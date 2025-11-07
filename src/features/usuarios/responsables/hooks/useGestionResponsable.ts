import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useVerificacionResponsable } from './useVerificacionResponsable';
import { useFormularioPrincipalResponsable } from './useFormularioPrincipalResponsable';
import { useSeleccionAreasResponsable } from './useSeleccionAreasResponsable';
import type {
  PasoRegistroResponsable,
  ModalFeedbackState,
  ResponsableCreado,
  ResponsableAsignado,
  DatosPersonaVerificada,
  VerificacionUsuarioCompleta,
  Gestion,
  ApiGestionRoles,
} from '../types';
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
  const [gestionesPasadas, setGestionesPasadas] = useState<Gestion[]>([]);
  const [rolesPorGestion, setRolesPorGestion] = useState<ApiGestionRoles[]>([]);

  const modalTimerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    return () => clearTimeout(modalTimerRef.current);
  }, []);

  const closeModalFeedback = useCallback(() => {
    setModalFeedback(initialModalState);
    clearTimeout(modalTimerRef.current);
  }, []);

  const handleVerificationComplete = useCallback(
    (data: VerificacionUsuarioCompleta | null) => {
      if (data) {
        setDatosPersona(data.datosPersona);
        setIsAssignedToCurrentGestion(data.isAssignedToCurrentGestion);
        setInitialAreasReadOnly(data.initialAreas);
        setGestionesPasadas(data.gestionesPasadas);
        setRolesPorGestion(data.rolesPorGestion);
      } else {
        setDatosPersona(null);
        setIsAssignedToCurrentGestion(false);
        setInitialAreasReadOnly([]);
        setGestionesPasadas([]);
        setRolesPorGestion([]);
      }
      
      setPasoActual('FORMULARIO_DATOS');
    },
    []
  );

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
    areasDisponiblesQuery,
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
    isReadOnly: !!datosPersona,
    initialAreas: initialAreasReadOnly,
    gestionesPasadas: gestionesPasadas,
    onFormSubmitSuccess: (data, esActualizacion) => {
      handleFormSubmitSuccess(data, esActualizacion);
    },
    onFormSubmitError: (message) => {
      handleFormSubmitError(message);
    },
  });

  const handleCancelar = useCallback(() => {
    resetVerification();
    resetFormularioPrincipal(true);
    setDatosPersona(null);
    setIsAssignedToCurrentGestion(false);
    setInitialAreasReadOnly([]);
    setGestionesPasadas([]);
    setRolesPorGestion([]);
    setPasoActual('VERIFICACION_CI');
    closeModalFeedback();
    navigate('/responsables');
  }, [navigate, resetVerification, resetFormularioPrincipal, closeModalFeedback]);

  handleCancelarCallbackRef.current = handleCancelar;

  const handleFormSubmitSuccess = useCallback(
    (data: ResponsableCreado | ResponsableAsignado, esActualizacion: boolean) => {
      const message =
        data.message ||
        (esActualizacion
          ? '¡Responsable Asignado exitosamente!'
          : '¡Registro Exitoso!');

      setModalFeedback({
        isOpen: true,
        type: 'success',
        title: '¡Éxito!',
        message,
      });

      queryClient.invalidateQueries({ queryKey: ['responsables'] });
      if (gestionPasadaSeleccionadaAnio) {
        queryClient.invalidateQueries({
          queryKey: ['areasPasadas', gestionPasadaSeleccionadaAnio, ciVerificado],
        });
      }
      queryClient.invalidateQueries({ queryKey: ['gestionesPasadas', ciVerificado] });
      if (esActualizacion && ciVerificado) {
        queryClient.invalidateQueries({
          queryKey: ['areasPasadas', GESTION_ACTUAL_ANIO, ciVerificado],
        });
      }

      clearTimeout(modalTimerRef.current);
      modalTimerRef.current = window.setTimeout(finalizeSuccessAction, 5000);
    },
    [queryClient, ciVerificado, gestionPasadaSeleccionadaAnio, finalizeSuccessAction]
  );

  const handleFormSubmitError = useCallback((message: string) => {
    setModalFeedback({ isOpen: true, type: 'error', title: '¡Ups! Algo salió mal', message });
  }, []);

  const preAsignadasSet = useMemo(() => {
    return isAssignedToCurrentGestion
      ? new Set(initialAreasReadOnly)
      : new Set<number>();
  }, [isAssignedToCurrentGestion, initialAreasReadOnly]);

  const {
    handleSeleccionarArea,
    handleToggleSeleccionarTodas,
    isLoadingAreas,
    areasLoadedFromPast,
  } = useSeleccionAreasResponsable({
    formMethods: formMethodsPrincipal,
    gestionPasadaSeleccionadaAnio,
    isReadOnly: !!datosPersona,
    preAsignadas: preAsignadasSet,
    areasDisponiblesQuery,
    rolesPorGestion: rolesPorGestion,
  });

  const isLoading = areasDisponiblesQuery.isLoading || isLoadingAreas;
  const isProcessing = isVerifying || isSaving;

  const pasoActualUI = isVerifying
    ? 'CARGANDO_VERIFICACION'
    : isSaving
      ? 'CARGANDO_GUARDADO'
      : pasoActual;

  return {
    pasoActual: pasoActualUI,
    datosPersona,
    areasDisponibles: areasDisponiblesQuery.data || [],
    areasDisponiblesQuery,
    gestionesPasadas: gestionesPasadas,
    modalFeedback,
    isReadOnly: !!datosPersona,
    isAssignedToCurrentGestion,
    initialAreasReadOnly,
    gestionPasadaSeleccionadaId,
    areasLoadedFromPast,
    isLoading,
    isLoadingGestiones: false,
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
    finalizeSuccessAction,
  };
}