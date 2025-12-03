import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useQueryClient,
  useMutation,
  UseMutateFunction,
  useQuery,
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
  Area,
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

export function useGestionResponsable() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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

  const modalTimerRef = useRef<number | undefined>(undefined);
  const handleCancelarCallbackRef = useRef<(() => void) | undefined>(undefined);

  const crearResponsableMutateRef = useRef<
    | UseMutateFunction<
        ResponsableCreado,
        AxiosError<BackendValidationError>,
        CrearResponsablePayload
      >
    | undefined
  >(undefined);

  useEffect(() => {
    return () => clearTimeout(modalTimerRef.current);
  }, []);

  const closeModalFeedback = useCallback(() => {
    setModalFeedback(initialModalState);
    clearTimeout(modalTimerRef.current);
  }, []);

  const proceedToFormulario = useCallback(
    (data: VerificacionUsuarioCompleta | null) => {
      if (data) {
        setDatosPersona(data.datosPersona);
        setIsAssignedToCurrentGestion(data.isAssignedToCurrentGestion);
        setInitialAreasReadOnly(data.initialAreas);
        setGestionesPasadas(data.gestionesPasadas);
        setRolesPorGestion(data.rolesPorGestion);
      } else {
        // Escenario 1: Usuario nuevo
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

  const handleVerificationComplete = useCallback(
    (data: VerificacionUsuarioCompleta | null) => {
      if (data && data.esEvaluadorExistente && !data.esResponsableExistente) {
        setModalFeedback({
          isOpen: true,
          type: 'confirmation',
          title: '¡Usuario ya existente como evaluador!',
          message:
            'Ya existe el usuario ingresado como evaluador. ¿Desea registrarlo también como Responsable de área?',
          onConfirm: () => {
            closeModalFeedback();
            proceedToFormulario(data);
          },
          confirmText: 'Sí',
          cancelText: 'No',
        });
      } else {
        proceedToFormulario(data);
      }
    },
    [closeModalFeedback, proceedToFormulario]
  );

  const handleVerificationError = useCallback((message: string) => {
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

  const areasOcupadasQuery = useQuery<Area[], Error>({
    queryKey: ['areasOcupadasActuales'],
    queryFn: responsableService.obtenerAreasOcupadasActuales,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    enabled: pasoActual === 'FORMULARIO_DATOS',
  });

  const ocupadasSet = useMemo(() => {
    return new Set(areasOcupadasQuery.data?.map((a) => a.id_area) || []);
  }, [areasOcupadasQuery.data]);

  const preAsignadasSet = useMemo(() => {
    return isAssignedToCurrentGestion
      ? new Set(initialAreasReadOnly)
      : new Set<number>();
  }, [isAssignedToCurrentGestion, initialAreasReadOnly]);

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
  }, [
    navigate,
    resetVerification,
    resetFormularioPrincipal,
    closeModalFeedback,
  ]);

  handleCancelarCallbackRef.current = handleCancelar;

  const finalizeSuccessAction = useCallback(() => {
    if (handleCancelarCallbackRef.current) {
      handleCancelarCallbackRef.current();
    }
  }, [handleCancelar]);

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
      
      queryClient.invalidateQueries({ queryKey: ['areasActuales'] });
      queryClient.invalidateQueries({ queryKey: ['areasOcupadasActuales'] });

      clearTimeout(modalTimerRef.current);
      modalTimerRef.current = window.setTimeout(finalizeSuccessAction, 5000);
    },
    [queryClient, ciVerificado, finalizeSuccessAction]
  );

  const handleMutationError = useCallback(
    (error: AxiosError<BackendValidationError>) => {
      let errorMessage =
        'No se pudo guardar el responsable. Por favor, intente de nuevo.';
      const errorData = error.response?.data;
      const { setError, setFocus, getValues } = formMethodsPrincipal;

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
            if (crearResponsableMutateRef.current) {
              crearResponsableMutateRef.current(payload);
            }
          },
          confirmText: 'Sí',
          cancelText: 'No',
        });
        return;
      }

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
    [formMethodsPrincipal, closeModalFeedback]
  );

  const { mutate: crearResponsable, isPending: isCreatingResponsable } =
    useMutation<
      ResponsableCreado,
      AxiosError<BackendValidationError>,
      CrearResponsablePayload
    >({
      mutationFn: responsableService.crearResponsable,
      onSuccess: (data) => {
        handleFormSubmitSuccess(data, false);
      },
      onError: handleMutationError,
    });

  const { mutate: asignarResponsable, isPending: isAsigningResponsable } =
    useMutation<
      ResponsableAsignado,
      AxiosError<BackendValidationError>,
      { ci: string; payload: AsignarResponsablePayload }
    >({
      mutationFn: ({ ci, payload }) =>
        responsableService.asignarResponsable(ci, payload),
      onSuccess: (data) => {
        handleFormSubmitSuccess(data, true);
      },
      onError: handleMutationError,
    });

  useEffect(() => {
    crearResponsableMutateRef.current = crearResponsable;
  }, [crearResponsable]);

  const isSaving = isCreatingResponsable || isAsigningResponsable;

  const handleFormSubmit = useCallback(
    (formData: ResponsableFormData) => {
      if (datosPersona) {
        if (!ciVerificado) {
          handleMutationError(
            new AxiosError('Error: No se encontró el CI para asignar.') as any
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

  useEffect(() => {
    if (
      (areasDisponiblesQuery.isError || areasOcupadasQuery.isError) &&
      pasoActual === 'FORMULARIO_DATOS'
    ) {
      setModalFeedback({
        isOpen: true,
        type: 'error',
        title: 'Error Crítico',
        message:
          'Error crítico: No se pudieron cargar los datos de las áreas. Recargue la página.',
      });
    }
  }, [
    areasDisponiblesQuery.isError,
    areasOcupadasQuery.isError,
    pasoActual,
  ]);

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
    ocupadasSet: ocupadasSet,
    areasDisponiblesQuery,
    rolesPorGestion: rolesPorGestion,
  });

  const isLoading =
    areasDisponiblesQuery.isLoading ||
    isLoadingAreas ||
    areasOcupadasQuery.isLoading;

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
    preAsignadasSet,
    ocupadasSet,
    areasOcupadasQuery,
  };
}