import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useVerificacionEvaluador } from './useVerificacionEvaludor';
import { useFormularioPrincipalEvaluador } from './useFormularioPrincipalEvaluador';
import { useSeleccionAreaNivel } from './useSeleccionAreaNivel';
import type {
  PasoRegistroEvaluador,
  ModalFeedbackState,
  EvaluadorCreado,
  EvaluadorAsignado,
  DatosPersonaVerificada,
  VerificacionUsuarioCompleta,
  Gestion,
  ApiGestionRoles,
  ApiAsignacionDetalle,
} from '../types';

const initialModalState: ModalFeedbackState = {
  isOpen: false,
  title: '',
  message: '',
  type: 'info',
};

export function useGestionEvaluador() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [pasoActual, setPasoActual] =
    useState<PasoRegistroEvaluador>('VERIFICACION_CI');
  const [modalFeedback, setModalFeedback] =
    useState<ModalFeedbackState>(initialModalState);

  const [datosPersona, setDatosPersona] =
    useState<DatosPersonaVerificada | null>(null);
  const [isAssignedToCurrentGestion, setIsAssignedToCurrentGestion] =
    useState(false);
  const [initialAsignaciones, setInitialAsignaciones] = useState<
    ApiAsignacionDetalle[]
  >([]);
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

  const handleCancelarCallbackRef = useRef<(() => void) | undefined>(undefined);

  const finalizeSuccessAction = useCallback(() => {
    closeModalFeedback();
    if (handleCancelarCallbackRef.current) {
      handleCancelarCallbackRef.current();
    } else {
      navigate('/evaluadores');
    }
    clearTimeout(modalTimerRef.current);
  }, [closeModalFeedback, navigate]);

  const handleVerificationComplete = useCallback(
    (data: VerificacionUsuarioCompleta | null) => {
      if (data) {
        setDatosPersona(data.datosPersona);
        setIsAssignedToCurrentGestion(data.isAssignedToCurrentGestion);
        setInitialAsignaciones(data.initialAsignaciones);
        setGestionesPasadas(data.gestionesPasadas);
        setRolesPorGestion(data.rolesPorGestion);
      } else {
        setDatosPersona(null);
        setIsAssignedToCurrentGestion(false);
        setInitialAsignaciones([]);
        setGestionesPasadas([]);
        setRolesPorGestion([]);
      }
      setPasoActual('FORMULARIO_DATOS');
    },
    []
  );

  const handleVerificationError = useCallback((message: string) => {
    setModalFeedback({
      isOpen: true,
      type: 'error',
      title: 'Error de Verificación',
      message:
        message ||
        'No se pudo completar la verificación. Revise su conexión o intente más tarde.',
    });
    setPasoActual('VERIFICACION_CI');
  }, []);

  const {
    isVerifying,
    formMethodsVerificacion,
    handleVerificarCISubmit,
    resetVerification,
    ciVerificado,
  } = useVerificacionEvaluador(
    handleVerificationComplete,
    handleVerificationError
  );

  const handleFormSubmitSuccess = useCallback(
    (data: EvaluadorCreado | EvaluadorAsignado, esActualizacion: boolean) => {
      const message =
        data.message ||
        (esActualizacion
          ? '¡Evaluador Asignado exitosamente!'
          : '¡Registro Exitoso!');

      setModalFeedback({
        isOpen: true,
        type: 'success',
        title: '¡Éxito!',
        message,
      });

      queryClient.invalidateQueries({ queryKey: ['evaluadores'] });
      if (ciVerificado) {
        queryClient.invalidateQueries({ queryKey: ['usuarios', ciVerificado] });
      }

      clearTimeout(modalTimerRef.current);
      modalTimerRef.current = window.setTimeout(finalizeSuccessAction, 5000);
    },
    [queryClient, ciVerificado, finalizeSuccessAction]
  );

  const handleFormSubmitError = useCallback((message: string) => {
    setModalFeedback({
      isOpen: true,
      type: 'error',
      title: '¡Ups! Algo salió mal',
      message,
    });
  }, []);

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
  } = useFormularioPrincipalEvaluador({
    ciVerificado,
    datosPersonaVerificada: datosPersona,
    isReadOnly: !!datosPersona,
    initialAsignaciones: initialAsignaciones,
    onFormSubmitSuccess: handleFormSubmitSuccess,
    onFormSubmitError: handleFormSubmitError,
  });

  const preAsignadasSet = useMemo(() => {
    if (!isAssignedToCurrentGestion || initialAsignaciones.length === 0) {
      return new Set<number>();
    }
    return new Set(initialAsignaciones.map((a) => a.id_area_nivel));
  }, [isAssignedToCurrentGestion, initialAsignaciones]);

  const {
    handleToggleNivel,
    handleToggleArea,
    handleToggleSeleccionarTodas,
    nivelesSeleccionadosSet,
    areasExpandidasSet,
    areasFromPastGestion,
    isLoading: isLoadingSeleccion,
  } = useSeleccionAreaNivel({
    formMethods: formMethodsPrincipal,
    gestionPasadaSeleccionadaAnio,
    preAsignadas: preAsignadasSet,
    areasDisponiblesQuery,
    rolesPorGestion: rolesPorGestion,
  });

  const handleCancelar = useCallback(() => {
    resetVerification();
    resetFormularioPrincipal(true);
    setDatosPersona(null);
    setIsAssignedToCurrentGestion(false);
    setInitialAsignaciones([]);
    setGestionesPasadas([]);
    setRolesPorGestion([]);
    setPasoActual('VERIFICACION_CI');
    closeModalFeedback();
    navigate('/evaluadores');
  }, [
    navigate,
    resetVerification,
    resetFormularioPrincipal,
    closeModalFeedback,
  ]);

  handleCancelarCallbackRef.current = handleCancelar;

  const isLoading =
    areasDisponiblesQuery.isLoading || isLoadingSeleccion;
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
    gestionesPasadas,
    modalFeedback,
    isReadOnly: !!datosPersona,
    isAssignedToCurrentGestion,
    initialAsignaciones,
    preAsignadasSet,
    gestionPasadaSeleccionadaId,
    areasFromPastGestion,
    isLoading,
    isLoadingGestiones: isProcessing,
    isProcessing,
    formMethodsVerificacion,
    formMethodsPrincipal,
    primerInputRef,
    handleVerificarCISubmit,
    handleToggleNivel,
    handleToggleArea,
    handleToggleSeleccionarTodas,
    handleGestionSelect,
    onSubmitFormularioPrincipal,
    handleCancelar,
    closeModalFeedback,
    finalizeSuccessAction,
    nivelesSeleccionadosSet,
    areasExpandidasSet,
  };
}