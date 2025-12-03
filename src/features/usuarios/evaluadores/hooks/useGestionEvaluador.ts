import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useQueryClient,
  useMutation,
  UseMutateFunction,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useVerificacionEvaluador } from './useVerificacionEvaludor';
import { useFormularioPrincipalEvaluador } from './useFormularioPrincipalEvaluador';
import { useSeleccionAreaNivel } from './useSeleccionAreaNivel';
import * as evaluadorService from '../services/evaluadorService';
import { ID_OLIMPIADA_ACTUAL } from '../utils/constants';
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
  CrearEvaluadorPayload,
  AsignarEvaluadorPayload,
} from '../types';
import type { EvaluadorFormData } from '../utils/validations';

const initialModalState: ModalFeedbackState = {
  isOpen: false,
  title: '',
  message: '',
  type: 'info',
};

type BackendValidationError = {
  errors?: Record<keyof EvaluadorFormData | string, string[]>;
  message?: string;
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
  const [esResponsableExistente, setEsResponsableExistente] = useState(false);
  
  const crearEvaluadorMutateRef = useRef<
    | UseMutateFunction<
        EvaluadorCreado,
        AxiosError<BackendValidationError>,
        CrearEvaluadorPayload
      >
    | undefined
  >(undefined);

  const modalTimerRef = useRef<number | undefined>(undefined);
  const handleCancelarCallbackRef = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    return () => clearTimeout(modalTimerRef.current);
  }, []);

  const closeModalFeedback = useCallback(() => {
    setModalFeedback(initialModalState);
    clearTimeout(modalTimerRef.current);
  }, []);

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
      
      const proceedToForm = (verificacionData: VerificacionUsuarioCompleta | null) => {
        if (verificacionData) {
          setDatosPersona(verificacionData.datosPersona);
          setIsAssignedToCurrentGestion(verificacionData.isAssignedToCurrentGestion);
          setInitialAsignaciones(verificacionData.initialAsignaciones);
          setGestionesPasadas(verificacionData.gestionesPasadas);
          setRolesPorGestion(verificacionData.rolesPorGestion);
          setEsResponsableExistente(verificacionData.esResponsableExistente);
        } else {
          setDatosPersona(null);
          setIsAssignedToCurrentGestion(false);
          setInitialAsignaciones([]);
          setGestionesPasadas([]);
          setRolesPorGestion([]);
          setEsResponsableExistente(false);
        }
        setPasoActual('FORMULARIO_DATOS');
      };

      if (data && data.esResponsableExistente && !data.isAssignedToCurrentGestion) {
        setModalFeedback({
          isOpen: true,
          type: 'confirmation',
          title: '¡Usuario ya existente como responsable de área!',
          message:
            'Ya existe el usuario ingresado como responsable de área. ¿Desea registrarlo también como Evaluador?',
          onConfirm: () => {
            closeModalFeedback();
            proceedToForm(data);
          },
          confirmText: 'Sí',
          cancelText: 'No',
        });
      } else {
        proceedToForm(data);
      }
    },
    [closeModalFeedback]
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

  const {
    formMethodsPrincipal,
    areasDisponiblesQuery,
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
    gestionesPasadas: gestionesPasadas,
    onFormSubmit: (formData) => handleFormSubmit(formData),
  });

  const handleFormSubmitSuccess = useCallback(
    (data: EvaluadorCreado | EvaluadorAsignado, esActualizacion: boolean) => {
      const message = esActualizacion
        ? data.message ||
          '¡Asignación exitosa! - El evaluador fue asignado a sus áreas y niveles.'
        : data.message ||
          '¡Registro Exitoso! - El evaluador fue registrado y asignado a sus áreas y niveles. Se envió un correo electrónico con las credenciales para su inicio de sesión.';
      
      const title = esActualizacion ? '¡Asignación exitosa!' : '¡Registro Exitoso!';

      setModalFeedback({
        isOpen: true,
        type: 'success',
        title: title,
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

  const handleMutationError = useCallback(
    (error: AxiosError<BackendValidationError>) => {
      let errorMessage = 'No se pudo guardar el evaluador. Por favor, intente de nuevo.';
      const errorData = error.response?.data;
      const { setError, setFocus, getValues } = formMethodsPrincipal;

      if (
        error.response?.status === 409 &&
        errorData?.message?.includes('responsable')
      ) {
        const formData = getValues();
        setModalFeedback({
          isOpen: true,
          type: 'confirmation',
          title: '¡Usuario ya existente como responsable de área!',
          message:
            errorData.message ||
            'Ya existe el usuario ingresado como responsable de área. ¿Desea registrarlo también como Evaluador?',
          onConfirm: () => {
            closeModalFeedback();
            const payload: CrearEvaluadorPayload = {
              nombre: formData.nombres,
              apellido: formData.apellidos,
              ci: formData.ci,
              email: formData.correo,
              telefono: formData.celular,
              area_nivel_ids: formData.area_nivel_ids,
              force_create_role: true,
            };
            if (crearEvaluadorMutateRef.current) {
              crearEvaluadorMutateRef.current(payload);
            }
          },
          confirmText: 'Sí',
          cancelText: 'No',
        });
        return;
      }

      if (error.response?.status === 422 && errorData?.errors) {
        let firstFieldWithError: keyof EvaluadorFormData | null = null;
        Object.entries(errorData.errors).forEach(([field, messages]) => {
          const fieldName = field as keyof EvaluadorFormData; 
          if (messages.length > 0) {
            if (Object.keys(formMethodsPrincipal.getValues()).includes(fieldName)) {
              setError(fieldName, { type: 'backend', message: messages[0] });
              if (!firstFieldWithError) firstFieldWithError = fieldName;
            }
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
        errorMessage = 'No se pudo guardar el evaluador. Por favor, intente de nuevo.';
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

  const { mutate: crearEvaluador, isPending: isCreatingEvaluador } = useMutation<
    EvaluadorCreado,
    AxiosError<BackendValidationError>,
    CrearEvaluadorPayload
  >({
    mutationFn: evaluadorService.crearEvaluador,
    onSuccess: (data) => {
      handleFormSubmitSuccess(data, false);
    },
    onError: handleMutationError,
  });

  const { mutate: asignarEvaluador, isPending: isAsigningEvaluador } =
    useMutation<
      EvaluadorAsignado,
      AxiosError<BackendValidationError>,
      { ci: string; payload: AsignarEvaluadorPayload }
    >({
      mutationFn: ({ ci, payload }) =>
        evaluadorService.asignarEvaluador(ci, payload),
      onSuccess: (data) => {
        handleFormSubmitSuccess(data, true);
      },
      onError: handleMutationError,
    });

  useEffect(() => {
    crearEvaluadorMutateRef.current = crearEvaluador;
  }, [crearEvaluador]);

  const isSaving = isCreatingEvaluador || isAsigningEvaluador;

  const handleFormSubmit = useCallback(
    (formData: EvaluadorFormData) => {
      if (datosPersona) {
        // Escenario 2 o 3
        if (!ciVerificado) {
          handleMutationError(
            new AxiosError('Error: No se encontró el CI para asignar.') as any
          );
          return;
        }

        const idsParaEnviar = isAssignedToCurrentGestion
          ? formData.area_nivel_ids.filter(
              (id: number) => !initialAsignaciones.map((a) => a.id_area_nivel).includes(id)
            )
          : formData.area_nivel_ids;

        const payload: AsignarEvaluadorPayload = {
          id_olimpiada: ID_OLIMPIADA_ACTUAL,
          area_nivel_ids: idsParaEnviar,
        };
        asignarEvaluador({ ci: ciVerificado, payload });
      } else {

        const payload: CrearEvaluadorPayload = {
          nombre: formData.nombres,
          apellido: formData.apellidos,
          ci: formData.ci,
          email: formData.correo,
          telefono: formData.celular,
          area_nivel_ids: formData.area_nivel_ids,
          force_create_role: esResponsableExistente,
        };
        crearEvaluador(payload);
      }
    },
    [
      datosPersona,
      ciVerificado,
      isAssignedToCurrentGestion,
      initialAsignaciones,
      esResponsableExistente,
      asignarEvaluador,
      crearEvaluador,
      handleMutationError,
    ]
  );

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
    setEsResponsableExistente(false);
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