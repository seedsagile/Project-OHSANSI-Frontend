import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useQueryClient,
  useMutation,
  UseMutateFunction,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useVerificacionResponsable } from './useVerificacionResponsable';
import { useFormularioPrincipalResponsable } from './useFormularioPrincipalResponsable';
import { useSeleccionAreasResponsable } from './useSeleccionAreasResponsable';
import * as responsableService from '../services/responsablesService';
import { ID_OLIMPIADA_ACTUAL, GESTION_ACTUAL_ANIO } from '../utils/constants';
import type {
  PasoRegistroResponsable,
  ModalFeedbackState,
  ResponsableCreado,
  ResponsableAsignado,
  DatosPersonaVerificada,
  VerificacionUsuarioCompleta,
  Gestion,
  ApiGestionRoles,
  ResponsableFormData,
  CrearResponsablePayload,
  AsignarResponsablePayload,
} from '../types';

const initialModalState: ModalFeedbackState = {
  isOpen: false,
  title: '',
  message: '',
  type: 'info',
};

type BackendValidationError = {
  errors?: Record<keyof ResponsableFormData | string, string[]>;
  message?: string;
};

/**
 * Hook orquestador principal para toda la lógica de la página
 * "Registrar Responsable". Gestiona el estado del flujo (pasos),
 * los modales, y centraliza las mutaciones de API y el manejo de errores.
 */
export function useGestionResponsable() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // --- 1. Estados y Refs ---
  const [pasoActual, setPasoActual] =
    useState<PasoRegistroResponsable>('VERIFICACION_CI');
  const [modalFeedback, setModalFeedback] =
    useState<ModalFeedbackState>(initialModalState);

  const [datosPersona, setDatosPersona] =
    useState<DatosPersonaVerificada | null>(null);
  const [isAssignedToCurrentGestion, setIsAssignedToCurrentGestion] =
    useState(false);
  const [initialAreasReadOnly, setInitialAreasReadOnly] = useState<number[]>([]);
  const [gestionesPasadas, setGestionesPasadas] = useState<Gestion[]>([]);
  const [rolesPorGestion, setRolesPorGestion] = useState<ApiGestionRoles[]>([]);

  // 🔽 (FIX ts(6133)) Estado intermedio 'pendingVerificationData' eliminado.
  // const [pendingVerificationData, setPendingVerificationData] = ...

  const modalTimerRef = useRef<number | undefined>(undefined);
  const handleCancelarCallbackRef = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    return () => clearTimeout(modalTimerRef.current);
  }, []);

  // --- 2. Callbacks Estables (Definidos primero) ---
  const closeModalFeedback = useCallback(() => {
    setModalFeedback(initialModalState);
    clearTimeout(modalTimerRef.current);
  }, []);

  const handleVerificationComplete = useCallback(
    (data: VerificacionUsuarioCompleta | null) => {
      // CA: Modal "Usuario ya existente como evaluador" (al Verificar)
      if (data && data.esEvaluadorExistente && !data.esResponsableExistente) {
        setModalFeedback({
          isOpen: true,
          type: 'confirmation',
          title: '¡Usuario ya existente como evaluador!',
          message:
            'Ya existe el usuario ingresado como evaluador. ¿Desea registrarlo también como Responsable de área?',
          onConfirm: () => {
            // (FIX) Lógica "Sí" usa 'data' del scope de useCallback
            setDatosPersona(data.datosPersona);
            setIsAssignedToCurrentGestion(data.isAssignedToCurrentGestion);
            setInitialAreasReadOnly(data.initialAreas);
            setGestionesPasadas(data.gestionesPasadas);
            setRolesPorGestion(data.rolesPorGestion);
            setPasoActual('FORMULARIO_DATOS');
            // (FIX ts(6133)) Ya no se referencia a pendingVerificationData
            closeModalFeedback();
          },
          confirmText: 'Sí',
          cancelText: 'No',
        });
        return;
      }

      // --- Flujo normal ---
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
    [closeModalFeedback]
  );

  const handleVerificationError = useCallback((message: string) => {
    // (FIX BUG CA #8)
    let finalMessage: string;
    const isNetworkError =
      !message || message === 'Network Error' || message.includes('Failed to fetch');

    if (isNetworkError) {
      finalMessage =
        'No se pudo completar la verificación. Revise su conexión o intente más tarde.';
    } else {
      finalMessage = message;
    }

    setModalFeedback({
      isOpen: true,
      type: 'error',
      title: 'Error de Verificación',
      message: finalMessage,
    });
    setPasoActual('VERIFICACION_CI');
  }, []);

  // --- 3. Hook de Verificación (Paso 1) ---
  const {
    isVerifying,
    formMethodsVerificacion,
    handleVerificarCISubmit,
    resetVerification,
    ciVerificado,
  } = useVerificacionResponsable(
    handleVerificationComplete,
    handleVerificationError
  );

  // --- 4. Hook de Formulario (Paso 2) ---
  const {
    formMethodsPrincipal,
    areasDisponiblesQuery,
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
    onFormSubmit: (formData) => handleFormSubmit(formData),
    pasoActual: pasoActual,
  });

  // --- 5. Callbacks de Cancelación y Éxito ---
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

  const finalizeSuccessAction = useCallback(() => {
    if (handleCancelarCallbackRef.current) {
      handleCancelarCallbackRef.current();
    }
  }, []);

  const handleFormSubmitSuccess = useCallback(
    (data: ResponsableCreado | ResponsableAsignado, esActualizacion: boolean) => {
      const message =
        data.message ||
        (esActualizacion
          ? '¡Asignación exitosa! - El responsable de área fue asignado a sus áreas.'
          : '¡Registro Exitoso! - El responsable de área fue registrado y asignado a sus áreas. Se envió un correo electrónico con las credenciales para su inicio de sesión.');

      setModalFeedback({
        isOpen: true,
        type: 'success',
        title: esActualizacion ? '¡Asignación exitosa!' : '¡Registro Exitoso!',
        message,
      });

      queryClient.invalidateQueries({ queryKey: ['responsables'] });
      if (ciVerificado) {
        queryClient.invalidateQueries({
          queryKey: ['usuarios', ciVerificado],
        });
        queryClient.invalidateQueries({
          queryKey: ['gestionesPasadas', ciVerificado],
        });
        if (esActualizacion) {
          queryClient.invalidateQueries({
            queryKey: ['areasPasadas', GESTION_ACTUAL_ANIO, ciVerificado],
          });
        }
      }

      clearTimeout(modalTimerRef.current);
      modalTimerRef.current = window.setTimeout(finalizeSuccessAction, 5000);
    },
    [queryClient, ciVerificado, finalizeSuccessAction]
  );

  // --- 6. Mutaciones y Manejo de Errores ---

  // 🔽 (FIX ts(7022)) Declarar mutaciones SIN `onSuccess`/`onError`
  const crearResponsableMutation = useMutation<
    ResponsableCreado,
    AxiosError<BackendValidationError>,
    CrearResponsablePayload
  >({
    mutationFn: responsableService.crearResponsable,
  });

  const asignarResponsableMutation = useMutation<
    ResponsableAsignado,
    AxiosError<BackendValidationError>,
    { ci: string; payload: AsignarResponsablePayload }
  >({
    mutationFn: ({ ci, payload }) =>
      responsableService.asignarResponsable(ci, payload),
  });

  // Extraer funciones y estado de los resultados de la mutación
  const {
    mutate: crearResponsable,
    isPending: isCreatingResponsable,
    status: crearStatus,
    error: crearError,
    data: crearData,
  } = crearResponsableMutation;

  const {
    mutate: asignarResponsable,
    isPending: isAsigningResponsable,
    status: asignarStatus,
    error: asignarError,
    data: asignarData,
  } = asignarResponsableMutation;

  const isSaving = isCreatingResponsable || isAsigningResponsable;

  const handleMutationError = useCallback(
    (
      error: AxiosError<BackendValidationError>,
      // 🔽 (FIX) El tipo de la función mutate
      crearResponsableFn: UseMutateFunction<
        ResponsableCreado,
        AxiosError<BackendValidationError>,
        CrearResponsablePayload
      >
    ) => {
      let errorMessage =
        'No se pudo guardar el responsable. Por favor, intente de nuevo.';
      const errorData = error.response?.data;
      const { setError, setFocus, getValues } = formMethodsPrincipal;

      // CA: Modal "Usuario ya existente como evaluador" (al Guardar)
      if (
        error.response?.status === 409 &&
        errorData?.message?.includes('evaluador')
      ) {
        const formData = getValues();
        setModalFeedback({
          isOpen: true,
          type: 'confirmation',
          title: '¡Usuario ya existente como evaluador!',
          message:
            errorData.message ||
            'Ya existe el usuario ingresado como evaluador. ¿Desea registrarlo también como Responsable de área?',
          onConfirm: () => {
            closeModalFeedback();
            const payload: CrearResponsablePayload = {
              nombre: formData.nombres,
              apellido: formData.apellidos,
              ci: formData.ci,
              email: formData.correo,
              telefono: formData.celular,
              areas: formData.areas,
              force_create_role: true,
            };
            crearResponsableFn(payload); // Llama a la función mutate
          },
          confirmText: 'Sí',
          cancelText: 'No',
        });
        return;
      }

      // CA: Error 3.1: Error de Validación de Backend (Error 422)
      if (error.response?.status === 422 && errorData?.errors) {
        let firstFieldWithError: keyof ResponsableFormData | null = null;
        Object.entries(errorData.errors).forEach(([field, messages]) => {
          const fieldName = field as keyof ResponsableFormData;
          if (messages.length > 0) {
            setError(fieldName, { type: 'backend', message: messages[0] });
            if (!firstFieldWithError) firstFieldWithError = fieldName;
          }
        });

        if (firstFieldWithError) {
          setFocus(firstFieldWithError);
          errorMessage =
            errorData.message ||
            errorData.errors[firstFieldWithError]?.[0] ||
            errorMessage;
        } else {
          errorMessage = errorData.message || errorMessage;
        }
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      } else if (error.request) {
        errorMessage =
          'No se pudo guardar el responsable. Por favor, intente de nuevo.';
      }

      setModalFeedback({
        isOpen: true,
        type: 'error',
        title: '¡Ups! Algo salió mal',
        message: errorMessage,
      });
    },
    [formMethodsPrincipal, closeModalFeedback, crearResponsable] // Depende de la función `crearResponsable` (mutate)
  );

  // 🔽 (FIX ts(7022/2339)) Usar useEffect para reaccionar a los cambios de estado
  useEffect(() => {
    if (crearStatus === 'success' && crearData) {
      handleFormSubmitSuccess(crearData, false);
    }
    if (crearStatus === 'error' && crearError) {
      handleMutationError(crearError, crearResponsable);
    }
  }, [
    crearStatus,
    crearData,
    crearError,
    handleFormSubmitSuccess,
    handleMutationError,
    crearResponsable,
  ]);

  useEffect(() => {
    if (asignarStatus === 'success' && asignarData) {
      handleFormSubmitSuccess(asignarData, true);
    }
    if (asignarStatus === 'error' && asignarError) {
      handleMutationError(asignarError, crearResponsable);
    }
  }, [
    asignarStatus,
    asignarData,
    asignarError,
    handleFormSubmitSuccess,
    handleMutationError,
    crearResponsable,
  ]);

  const handleFormSubmit = useCallback(
    (formData: ResponsableFormData) => {
      if (datosPersona) {
        if (!ciVerificado) {
          handleMutationError(
            new AxiosError('Error: No se encontró el CI para asignar.') as any,
            crearResponsable
          );
          return;
        }
        const payload: AsignarResponsablePayload = {
          id_olimpiada: ID_OLIMPIADA_ACTUAL,
          areas: formData.areas,
        };
        asignarResponsable({ ci: ciVerificado, payload });
      } else {
        const payload: CrearResponsablePayload = {
          nombre: formData.nombres,
          apellido: formData.apellidos,
          ci: formData.ci,
          email: formData.correo,
          telefono: formData.celular,
          areas: formData.areas,
          force_create_role: false,
        };
        crearResponsable(payload);
      }
    },
    [
      datosPersona,
      ciVerificado,
      asignarResponsable,
      crearResponsable,
      handleMutationError,
    ]
  );

  // --- 7. Hook de Tabla de Áreas ---
  useEffect(() => {
    if (areasDisponiblesQuery.isError && pasoActual === 'FORMULARIO_DATOS') {
      setModalFeedback({
        isOpen: true,
        type: 'error',
        title: 'Error Crítico',
        message:
          'Error crítico: No se pudieron cargar las áreas. Recargue la página.',
      });
    }
  }, [areasDisponiblesQuery.isError, pasoActual]);

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
    isReadOnly: false,
    preAsignadas: preAsignadasSet,
    areasDisponiblesQuery,
    rolesPorGestion: rolesPorGestion,
  });

  // --- 8. Estado Final de UI ---
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
    isLoadingGestiones: isProcessing,
    isProcessing,
    formMethodsVerificacion,
    formMethodsPrincipal,
    primerInputRef,
    handleVerificarCISubmit,
    handleSeleccionarArea,
    handleToggleSeleccionarTodas,
    handleGestionSelect,
    onSubmitFormularioPrincipal:
      formMethodsPrincipal.handleSubmit(handleFormSubmit),
    handleCancelar,
    closeModalFeedback,
    finalizeSuccessAction,
  };
}