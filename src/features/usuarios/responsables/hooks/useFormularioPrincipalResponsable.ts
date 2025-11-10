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
  PasoRegistroResponsable, // 🔽 Importar el tipo de Paso
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
  // 🔽 (FIX) Prop 'isSaving' eliminada, se maneja en el padre
  pasoActual: PasoRegistroResponsable; // 🔽 (FIX) Prop 'pasoActual' añadida
}

/**
 * Hook enfocado únicamente en la lógica y estado del formulario principal
 * de datos del responsable (Paso 2).
 */
export function useFormularioPrincipalResponsable({
  ciVerificado,
  datosPersonaVerificada,
  isReadOnly,
  initialAreas = [],
  gestionesPasadas = [],
  onFormSubmit,
  pasoActual, // 🔽 Recibe el paso actual
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

  // Query para obtener las áreas disponibles para asignar
  const areasDisponiblesQuery = useQuery<Area[], Error>({
    queryKey: ['areasActuales'],
    queryFn: responsableService.obtenerAreasActuales,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    // 🔽 (FIX BUG) La query solo se habilita cuando estamos en el Paso 2
    enabled: pasoActual === 'FORMULARIO_DATOS',
  });

  /**
   * Efecto para resetear y pre-llenar el formulario cuando cambia el usuario verificado.
   * (Escenarios 1, 2 y 3).
   */
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

  /**
   * Maneja la selección del dropdown de gestiones pasadas.
   */
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

  /**
   * Wrapper del SubmitHandler que pasa los datos al hook padre.
   */
  const onSubmitFormularioPrincipal: SubmitHandler<ResponsableFormData> = useCallback(
    (formData) => {
      onFormSubmit(formData);
    },
    [onFormSubmit]
  );

  /**
   * Resetea el estado local de este hook (gestión pasada).
   */
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
    // 🔽 'isSaving' ya no se retorna desde aquí
    onSubmitFormularioPrincipal:
      formMethodsPrincipal.handleSubmit(onSubmitFormularioPrincipal),
    handleGestionSelect,
    gestionPasadaSeleccionadaId,
    gestionPasadaSeleccionadaAnio,
    primerInputRef,
    resetFormularioPrincipal: resetFormularioPrincipalHook,
  };
}