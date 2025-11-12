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

/**
 * Hook orquestador principal para toda la lógica de la página
 * "Registrar Responsable". Gestiona el estado del flujo (pasos),
 * los modales, y centraliza las mutaciones de API y el manejo de errores.
 */
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

  // Hook de efecto para limpiar el timer si el componente se desmonta.
  // Seguro: Array de dependencias vacío, solo se ejecuta en mount/unmount.
  useEffect(() => {
    return () => clearTimeout(modalTimerRef.current);
  }, []);

  const closeModalFeedback = useCallback(() => {
    setModalFeedback(initialModalState);
    clearTimeout(modalTimerRef.current);
  }, []);

  /**
   * Función helper interna para cargar los datos del usuario en el estado
   * y avanzar al Paso 2 (Formulario).
   */
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
      // Solo ahora avanzamos al Paso 2
      setPasoActual('FORMULARIO_DATOS');
    },
    [] // Las funciones `set` de useState son estables
  );

  /**
   * Callback que se ejecuta cuando la verificación de CI (Paso 1) es exitosa.
   * Comprueba el escenario de conflicto (Evaluador) ANTES de cambiar de paso.
   */
  const handleVerificationComplete = useCallback(
    (data: VerificacionUsuarioCompleta | null) => {
      // Comprobar el escenario de conflicto (Evaluador existente)
      if (data && data.esEvaluadorExistente && !data.esResponsableExistente) {
        // ¡Conflicto! Mostrar modal DE CONFIRMACIÓN mientras aún estamos en Paso 1.
        setModalFeedback({
          isOpen: true,
          type: 'confirmation',
          title: '¡Usuario ya existente como evaluador!',
          message:
            'Ya existe el usuario ingresado como evaluador. ¿Desea registrarlo también como Responsable de área?',
          onConfirm: () => {
            // Usuario hizo clic en "Sí"
            closeModalFeedback();
            proceedToFormulario(data); // Cargar datos y AHORA SÍ avanzar al Paso 2
          },
          // Si el usuario presiona "No", se llama a closeModalFeedback y nunca
          // se avanza al Paso 2, permaneciendo en "VERIFICACION_CI".
          confirmText: 'Sí',
          cancelText: 'No',
        });
      } else {
        // No hay conflicto, proceder directamente al Paso 2.
        proceedToFormulario(data);
      }
    },
    [closeModalFeedback, proceedToFormulario]
  );

  /**
   * Callback para manejar errores de red o 500 durante la verificación.
   */
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

  // Hook para el Paso 1
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

  // Hook para el formulario principal (Paso 2)
  const {
    formMethodsPrincipal,
    areasDisponiblesQuery, // Query para TODAS las áreas (.../2025/areas)
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

  // Query para las áreas OCUPADAS (.../areas/ocupadas)
  const areasOcupadasQuery = useQuery<Area[], Error>({
    queryKey: ['areasOcupadasActuales'],
    queryFn: responsableService.obtenerAreasOcupadasActuales,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    enabled: pasoActual === 'FORMULARIO_DATOS',
  });

  // Set memoizado de IDs de áreas ocupadas
  const ocupadasSet = useMemo(() => {
    return new Set(areasOcupadasQuery.data?.map((a) => a.id_area) || []);
  }, [areasOcupadasQuery.data]);

  // Set memoizado de IDs de áreas pre-asignadas (Escenario 3)
  // DECLARADO AQUÍ para solucionar el error TS2448
  const preAsignadasSet = useMemo(() => {
    return isAssignedToCurrentGestion
      ? new Set(initialAreasReadOnly)
      : new Set<number>();
  }, [isAssignedToCurrentGestion, initialAreasReadOnly]);

  // Hook para cancelar y volver al inicio
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

  // Ref para el callback de cancelar (para usar en el timer del modal de éxito)
  handleCancelarCallbackRef.current = handleCancelar;

  const finalizeSuccessAction = useCallback(() => {
    if (handleCancelarCallbackRef.current) {
      handleCancelarCallbackRef.current();
    }
  }, [handleCancelar]); // handleCancelar es estable

  // Callback para éxito al guardar
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

      // Invalidar cachés de TanStack Query
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
      
      // SOLUCIÓN AL BUG DE CACHÉ: Invalidar AMBAS queries de áreas
      queryClient.invalidateQueries({ queryKey: ['areasActuales'] });
      queryClient.invalidateQueries({ queryKey: ['areasOcupadasActuales'] });

      clearTimeout(modalTimerRef.current);
      modalTimerRef.current = window.setTimeout(finalizeSuccessAction, 5000);
    },
    [queryClient, ciVerificado, finalizeSuccessAction]
  );

  // Callback para error al guardar
  const handleMutationError = useCallback(
    (error: AxiosError<BackendValidationError>) => {
      let errorMessage =
        'No se pudo guardar el responsable. Por favor, intente de nuevo.';
      const errorData = error.response?.data;
      const { setError, setFocus, getValues } = formMethodsPrincipal;

      // Conflicto 409 (Usuario es Evaluador)
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

      // Error de validación 422
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

  // Mutación para Escenario 1 (Crear)
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

  // Mutación para Escenarios 2 y 3 (Asignar)
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

  // useEffect para actualizar la ref de la mutación.
  // Seguro: 'crearResponsable' es una función estable de useMutation.
  useEffect(() => {
    crearResponsableMutateRef.current = crearResponsable;
  }, [crearResponsable]);

  const isSaving = isCreatingResponsable || isAsigningResponsable;

  // Lógica de Submit principal
  const handleFormSubmit = useCallback(
    (formData: ResponsableFormData) => {
      if (datosPersona) {
        // Escenario 2 o 3
        if (!ciVerificado) {
          handleMutationError(
            new AxiosError('Error: No se encontró el CI para asignar.') as any
          );
          return;
        }
        
        // SOLUCIÓN AL BUG DE GESTIÓN PASADA:
        // Filtramos las áreas que ya están ocupadas por OTROS ANTES de enviar.
        const areasParaEnviar = formData.areas.filter(id => {
          const esPreAsignada = preAsignadasSet.has(id);
          const esOcupadaPorOtro = ocupadasSet.has(id);
          
          // Se envía si:
          // 1. Es pre-asignada (ya era de este responsable)
          // 2. NO es pre-asignada Y NO está ocupada por otro (es una nueva área válida)
          return esPreAsignada || (!esPreAsignada && !esOcupadaPorOtro);
        });

        const payload: AsignarResponsablePayload = {
          id_olimpiada: ID_OLIMPIADA_ACTUAL,
          areas: areasParaEnviar, // Usamos la lista filtrada
        };
        asignarResponsable({ ci: ciVerificado, payload });
      } else {
        // Escenario 1 (Usuario Nuevo)
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
      preAsignadasSet,
      ocupadasSet,
    ]
  );

  // useEffect para el manejo de errores (¡SEGURO!)
  // No hay riesgo de bucle.
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

  // Hook para la lógica de selección de áreas (checkboxes)
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
    ocupadasSet: ocupadasSet, // Le pasamos las áreas ocupadas
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

  // Retorno de todo el estado y funciones para la UI
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