import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import * as evaluadorService from '../services/evaluadorService';
import { datosEvaluadorSchema } from '../utils/validations';
import { z } from 'zod';
import type {
  ApiAsignacionDetalle,
  DatosPersonaVerificada,
  AreaParaAsignar,
  Gestion,
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
  gestionesPasadas: Gestion[];
  onFormSubmit: (data: EvaluadorFormData) => void;
}

export function useFormularioPrincipalEvaluador({
  ciVerificado,
  datosPersonaVerificada,
  isReadOnly,
  initialAsignaciones,
  gestionesPasadas,
  onFormSubmit,
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

  const { reset: resetPrincipalForm } = formMethodsPrincipal;

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

      const anio = id
        ? (gestionesPasadas || []).find((g) => g.Id_olimpiada === id)?.gestion ?? null
        : null;

      setGestionPasadaSeleccionadaId(id);
      setGestionPasadaSeleccionadaAnio(anio);
    },
    [gestionesPasadas]
  );

  const onSubmitFormularioPrincipal: SubmitHandler<EvaluadorFormData> =
    useCallback(
      (formData) => {
        onFormSubmit(formData);
      },
      [onFormSubmit]
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

  return {
    formMethodsPrincipal,
    areasDisponiblesQuery,
    onSubmitFormularioPrincipal:
      formMethodsPrincipal.handleSubmit(onSubmitFormularioPrincipal),
    handleGestionSelect,
    gestionPasadaSeleccionadaId,
    gestionPasadaSeleccionadaAnio,
    primerInputRef,
    resetFormularioPrincipal: resetFormularioPrincipalHook,
  };
}