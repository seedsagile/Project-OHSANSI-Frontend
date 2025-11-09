import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import * as evaluadorService from '../services/evaluadorService';
import { datosEvaluadorSchema } from '../utils/validations';
import { ID_OLIMPIADA_ACTUAL } from '../utils/constants';
import { z } from 'zod';
import type {
  ApiAsignacionDetalle,
  DatosPersonaVerificada,
  CrearEvaluadorPayload,
  AsignarEvaluadorPayload,
  EvaluadorCreado,
  EvaluadorAsignado,
  AreaParaAsignar,
} from '../types';
import type { EvaluadorFormData, EvaluadorFormInput } from '../utils/validations';

const defaultFormValues: EvaluadorFormInput = {
  nombres: '',
  apellidos: '',
  correo: '',
  ci: '',
  celular: '',
  area_nivel_ids: [],
};

interface UseFormularioPrincipalProps {
  ciVerificado: string | null;
  datosPersonaVerificada: DatosPersonaVerificada | null;
  isReadOnly: boolean;
  initialAsignaciones: ApiAsignacionDetalle[];
  onFormSubmitSuccess: (
    data: EvaluadorCreado | EvaluadorAsignado,
    esActualizacion: boolean
  ) => void;
  onFormSubmitError: (message: string) => void;
}

type BackendValidationError = {
  errors?: Record<keyof EvaluadorFormData | string, string[]>;
  message?: string;
};

export function useFormularioPrincipalEvaluador({
  ciVerificado,
  datosPersonaVerificada,
  isReadOnly,
  initialAsignaciones,
  onFormSubmitSuccess,
  onFormSubmitError,
}: UseFormularioPrincipalProps) {
  const [gestionPasadaSeleccionadaId, setGestionPasadaSeleccionadaId] =
    useState<number | null>(null);
  const [gestionPasadaSeleccionadaAnio, setGestionPasadaSeleccionadaAnio] =
    useState<string | null>(null);

  const primerInputRef = useRef<HTMLInputElement>(null);

  const isAssignedToCurrentGestion =
    isReadOnly && initialAsignaciones.length > 0;

  const initialAreaNivelIds = useMemo(() => {
    return new Set(initialAsignaciones.map((a) => a.id_area_nivel));
  }, [initialAsignaciones]);

  const dynamicSchema = useMemo(() => {
    return datosEvaluadorSchema.extend({
      area_nivel_ids: z
        .array(z.number())
        .superRefine((selectedAreaNivelIDs, ctx) => {
          if (isAssignedToCurrentGestion) {
            const tieneNuevasAsignaciones = selectedAreaNivelIDs.some(
              (id) => !initialAreaNivelIds.has(id)
            );
            if (!tieneNuevasAsignaciones) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Debe seleccionar al menos una *nueva* área-nivel para guardar.',
              });
            }
          } else {
            if (selectedAreaNivelIDs.length === 0) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Debe asignar al menos un área-nivel.',
              });
            }
          }
        }),
    });
  }, [initialAreaNivelIds, isAssignedToCurrentGestion]);

  const formMethodsPrincipal = useForm<EvaluadorFormData, any, EvaluadorFormInput>({
    resolver: zodResolver(dynamicSchema),
    mode: 'all',
    defaultValues: defaultFormValues,
    shouldFocusError: true,
    delayError: 400,
  });
  const {
    reset: resetPrincipalForm,
    setError,
    setFocus,
  } = formMethodsPrincipal;

  const areasDisponiblesQuery = useQuery<AreaParaAsignar[], Error>({
    queryKey: ['areasConNivelesActuales'],
    queryFn: evaluadorService.obtenerAreasYNivelesActuales,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    enabled: true,
  });

  useEffect(() => {
    const resetValuesBase: EvaluadorFormInput = {
      ...defaultFormValues,
      ci: ciVerificado ?? '',
      area_nivel_ids: [],
    };

    if (isAssignedToCurrentGestion) {
      resetPrincipalForm({
        nombres: datosPersonaVerificada?.Nombres || '',
        apellidos: datosPersonaVerificada?.Apellidos || '',
        celular: datosPersonaVerificada?.Teléfono || '',
        correo: datosPersonaVerificada?.Correo || '',
        ci: ciVerificado ?? '',
        area_nivel_ids: Array.from(initialAreaNivelIds),
      });
    } else if (datosPersonaVerificada) {
      resetPrincipalForm({
        nombres: datosPersonaVerificada?.Nombres || '',
        apellidos: datosPersonaVerificada?.Apellidos || '',
        celular: datosPersonaVerificada?.Teléfono || '',
        correo: datosPersonaVerificada?.Correo || '',
        ci: ciVerificado ?? '',
        area_nivel_ids: [],
      });
    } else if (ciVerificado) {
      resetPrincipalForm(resetValuesBase);
      setTimeout(() => primerInputRef.current?.focus(), 100);
    } else {
      resetPrincipalForm(defaultFormValues);
    }

    setGestionPasadaSeleccionadaId(null);
    setGestionPasadaSeleccionadaAnio(null);
  }, [
    ciVerificado,
    datosPersonaVerificada,
    isAssignedToCurrentGestion,
    initialAreaNivelIds,
    resetPrincipalForm,
  ]);

  const handleMutationError = (error: AxiosError<BackendValidationError>) => {
    let errorMessage = 'No se pudo guardar.';
    const errorData = error.response?.data;

    if (error.response?.status === 422 && errorData?.errors) {
      let firstFieldWithError: keyof EvaluadorFormData | null = null;
      Object.entries(errorData.errors).forEach(([field, messages]) => {
        const fieldName = field as keyof EvaluadorFormData;
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
      errorMessage = 'No se recibió respuesta del servidor.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    onFormSubmitError(errorMessage);
  };

  const { mutate: crearEvaluador, isPending: isCreatingEvaluador } = useMutation<
    EvaluadorCreado,
    AxiosError<BackendValidationError>,
    CrearEvaluadorPayload
  >({
    mutationFn: evaluadorService.crearEvaluador,
    onSuccess: (data) => {
      onFormSubmitSuccess(data, false);
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
        onFormSubmitSuccess(data, true);
      },
      onError: handleMutationError,
    });

  const handleGestionSelect = useCallback(
    (selectedValue: string | number | null) => {
      const id =
        typeof selectedValue === 'number'
          ? selectedValue
          : selectedValue === ''
            ? null
            : selectedValue
              ? parseInt(String(selectedValue), 10)
              : null;
      setGestionPasadaSeleccionadaId(id);
    },
    []
  );

  const onSubmitFormularioPrincipal: SubmitHandler<EvaluadorFormData> =
    useCallback(
      (formData) => {
        if (isReadOnly && !isAssignedToCurrentGestion) return;

        if (datosPersonaVerificada) {
          if (!ciVerificado) {
            onFormSubmitError('Error: No se encontró el CI para asignar.');
            return;
          }

          const idsParaEnviar = isAssignedToCurrentGestion
            ? formData.area_nivel_ids.filter((id) => !initialAreaNivelIds.has(id))
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
          };
          crearEvaluador(payload);
        }
      },
      [
        isReadOnly,
        isAssignedToCurrentGestion,
        datosPersonaVerificada,
        ciVerificado,
        initialAreaNivelIds,
        crearEvaluador,
        asignarEvaluador,
        onFormSubmitError,
      ]
    );

  const resetFormularioPrincipalHook = useCallback(
    (resetToDefault = false) => {
      setGestionPasadaSeleccionadaId(null);
      setGestionPasadaSeleccionadaAnio(null);
      if (resetToDefault) {
        resetPrincipalForm(defaultFormValues);
      }
    },
    [resetPrincipalForm]
  );

  const isSaving = isCreatingEvaluador || isAsigningEvaluador;

  return {
    formMethodsPrincipal,
    areasDisponiblesQuery,
    isSaving,
    onSubmitFormularioPrincipal:
      formMethodsPrincipal.handleSubmit(onSubmitFormularioPrincipal),
    handleGestionSelect,
    gestionPasadaSeleccionadaId,
    gestionPasadaSeleccionadaAnio,
    primerInputRef,
    resetFormularioPrincipal: resetFormularioPrincipalHook,
  };
}