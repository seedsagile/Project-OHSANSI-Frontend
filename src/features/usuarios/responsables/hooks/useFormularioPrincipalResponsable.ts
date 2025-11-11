import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import * as responsableService from '../services/responsablesService';
import { datosResponsableSchema } from '../utils/validations';
import { z } from 'zod';
import type {
  Gestion,
  Area,
  DatosPersonaVerificada,
  PasoRegistroResponsable,
} from '../types';
import type { ResponsableFormData, ResponsableFormInput } from '../utils/validations';

const defaultFormValues: ResponsableFormInput = {
  nombres: '',
  apellidos: '',
  correo: '',
  ci: '',
  celular: '',
  areas: [],
};

interface UseFormularioPrincipalProps {
  ciVerificado: string | null;
  datosPersonaVerificada: DatosPersonaVerificada | null;
  isReadOnly: boolean;
  initialAreas: number[];
  gestionesPasadas: Gestion[];
  onFormSubmit: (data: ResponsableFormData) => void;
  pasoActual: PasoRegistroResponsable;
}

export function useFormularioPrincipalResponsable({
  ciVerificado,
  datosPersonaVerificada,
  isReadOnly,
  initialAreas = [],
  gestionesPasadas = [],
  onFormSubmit,
  pasoActual,
}: UseFormularioPrincipalProps) {
  const [gestionPasadaSeleccionadaId, setGestionPasadaSeleccionadaId] =
    useState<number | null>(null);
  const [gestionPasadaSeleccionadaAnio, setGestionPasadaSeleccionadaAnio] =
    useState<string | null>(null);
  const primerInputRef = useRef<HTMLInputElement>(null);

  const dynamicSchema = useMemo(() => {
    const initialAreaCount = initialAreas.length;
    const esCaso3 = initialAreaCount > 0;

    return datosResponsableSchema.extend({
      areas: z.array(z.number()).superRefine((selectedAreaIDs, ctx) => {
        if (esCaso3) {
          if (selectedAreaIDs.length <= initialAreaCount) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Debe seleccionar al menos una *nueva* área para guardar.',
            });
          }
        } else {
          if (selectedAreaIDs.length === 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Debe asignar al menos un área.',
            });
          }
        }
      }),
    });
  }, [initialAreas]);

  const formMethodsPrincipal = useForm<ResponsableFormData, any, ResponsableFormInput>({
    resolver: zodResolver(dynamicSchema),
    mode: 'all',
    defaultValues: defaultFormValues,
    shouldFocusError: true,
    delayError: 400,
  });
  const { reset: resetPrincipalForm } = formMethodsPrincipal;

  const isLoadingGestiones = false;

  const areasDisponiblesQuery = useQuery<Area[], Error>({
    queryKey: ['areasActuales'],
    queryFn: responsableService.obtenerAreasActuales,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    enabled: pasoActual === 'FORMULARIO_DATOS',
  });

  useEffect(() => {
    const resetValuesBase: ResponsableFormInput = {
      ...defaultFormValues,
      ci: ciVerificado ?? '',
      areas: [],
    };

    if (isReadOnly && datosPersonaVerificada) {
      resetPrincipalForm({
        nombres: datosPersonaVerificada.Nombres || '',
        apellidos: datosPersonaVerificada.Apellidos || '',
        celular: datosPersonaVerificada.Teléfono || '',
        correo: datosPersonaVerificada.Correo || '',
        ci: ciVerificado ?? '',
        areas: initialAreas,
      });
      setGestionPasadaSeleccionadaId(null);
      setGestionPasadaSeleccionadaAnio(null);
    } else if (ciVerificado) {
      resetPrincipalForm(resetValuesBase);
      setGestionPasadaSeleccionadaId(null);
      setGestionPasadaSeleccionadaAnio(null);
      setTimeout(() => primerInputRef.current?.focus(), 100);
    } else {
      resetPrincipalForm(defaultFormValues);
      setGestionPasadaSeleccionadaId(null);
      setGestionPasadaSeleccionadaAnio(null);
    }
  }, [ciVerificado, datosPersonaVerificada, isReadOnly, initialAreas, resetPrincipalForm]);

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
        ? gestionesPasadas.find((g) => g.Id_olimpiada === id)?.gestion ?? null
        : null;
      setGestionPasadaSeleccionadaId(id);
      setGestionPasadaSeleccionadaAnio(anio);
    },
    [gestionesPasadas]
  );

  const onSubmitFormularioPrincipal: SubmitHandler<ResponsableFormData> = useCallback(
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
    gestionesPasadas,
    areasDisponiblesQuery,
    isLoadingGestiones,
    onSubmitFormularioPrincipal:
      formMethodsPrincipal.handleSubmit(onSubmitFormularioPrincipal),
    handleGestionSelect,
    gestionPasadaSeleccionadaId,
    gestionPasadaSeleccionadaAnio,
    primerInputRef,
    resetFormularioPrincipal: resetFormularioPrincipalHook,
  };
}