// src/features/usuarios/responsables/hooks/useFormularioPrincipalResponsable.ts
import { useState, useCallback, useRef, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import * as responsableService from '../services/responsablesService';
import { datosResponsableSchema } from '../utils/validations';
import type {
  Gestion,
  Area,
  DatosPersonaVerificada,
  CrearResponsablePayload,
  ResponsableCreado,
} from '../types';
import type {
    ResponsableFormData,
    ResponsableFormInput
} from '../utils/validations';
// Importa la constante desde su ubicación correcta
import { ID_OLIMPIADA_ACTUAL } from '../utils/constants';

// Helper para generar contraseña
const generatePassword = (): string => {
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const all = lower + upper + numbers;
    const randChar = (set: string) => set.charAt(Math.floor(Math.random() * set.length));
    let pwd = randChar(lower) + randChar(upper) + randChar(numbers);
    for (let i = 3; i < 8; i++) pwd += randChar(all);
    return pwd.split('').sort(() => Math.random() - 0.5).join('');
};

const defaultFormValues: ResponsableFormInput = {
  nombres: '', apellidos: '', correo: '', ci: '', celular: '',
  gestionPasadaId: '', // Aunque no esté en el schema, lo usamos para el <select>
  areas: [],
};

interface UseFormularioPrincipalProps {
  ciVerificado: string | null;
  datosPersonaVerificada: DatosPersonaVerificada | null;
  isReadOnly: boolean;
  initialAreas?: number[];
  onFormSubmitSuccess: (data: ResponsableCreado) => void;
  onFormSubmitError: (message: string) => void;
}

export function useFormularioPrincipalResponsable({
  ciVerificado,
  datosPersonaVerificada,
  isReadOnly,
  initialAreas = [],
  onFormSubmitSuccess,
  onFormSubmitError,
}: UseFormularioPrincipalProps) {
  const [gestionPasadaSeleccionadaId, setGestionPasadaSeleccionadaId] = useState<number | null>(null);
  const [gestionPasadaSeleccionadaAnio, setGestionPasadaSeleccionadaAnio] = useState<string | null>(null);
  const primerInputRef = useRef<HTMLInputElement>(null);

  const formMethodsPrincipal = useForm<ResponsableFormData, any, ResponsableFormInput>({
    resolver: zodResolver(datosResponsableSchema),
    mode: 'onChange',
    defaultValues: defaultFormValues,
  });
  // Se elimina getValues si no se usa
  const { reset: resetPrincipalForm } = formMethodsPrincipal;

  const { data: gestionesPasadas = [], isLoading: isLoadingGestiones } = useQuery<Gestion[], Error>({
      queryKey: ['gestionesPasadas', ciVerificado],
      queryFn: () => responsableService.obtenerGestionesPasadas(ciVerificado!),
      enabled: !!ciVerificado && !!datosPersonaVerificada && !isReadOnly,
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
  });

  const areasDisponiblesQuery = useQuery<Area[], Error>({
      queryKey: ['areasActuales'],
      queryFn: responsableService.obtenerAreasActuales,
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      enabled: true,
  });

   // Efecto para resetear/rellenar el formulario
   useEffect(() => {
    const resetValuesBase: ResponsableFormInput = { ...defaultFormValues, ci: ciVerificado ?? '', gestionPasadaId: '' };
    if (isReadOnly && datosPersonaVerificada) {
        resetPrincipalForm({
            ...resetValuesBase,
            nombres: datosPersonaVerificada.Nombres || '',
            apellidos: datosPersonaVerificada.Apellidos || '',
            celular: datosPersonaVerificada.Teléfono || '',
            correo: datosPersonaVerificada.Correo || '',
            areas: initialAreas,
        });
        setGestionPasadaSeleccionadaId(null);
        setGestionPasadaSeleccionadaAnio(null);
    } else if (datosPersonaVerificada) {
        resetPrincipalForm({
            ...resetValuesBase,
            nombres: datosPersonaVerificada.Nombres || '',
            apellidos: datosPersonaVerificada.Apellidos || '',
            celular: datosPersonaVerificada.Teléfono || '',
            correo: '', // Correo vacío
            areas: [], // Áreas vacías
        });
        setGestionPasadaSeleccionadaId(null);
        setGestionPasadaSeleccionadaAnio(null);
        setTimeout(() => primerInputRef.current?.focus(), 100);
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


  const { mutate: crearResponsable, isPending: isCreatingResponsable } = useMutation<
    ResponsableCreado, Error, CrearResponsablePayload
  >({
    mutationFn: responsableService.crearResponsable,
    onSuccess: (data) => {
        onFormSubmitSuccess(data);
    },
    onError: (error) => {
        onFormSubmitError(error.message || 'No se pudo registrar.');
    },
  });

  const handleGestionPasadaChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOption = event.target.selectedOptions[0];
    const value = selectedOption.value;
    const gestionAnio = selectedOption.dataset.gestion;
    const id = value ? parseInt(value, 10) : null;
    const anio = gestionAnio || null;

    setGestionPasadaSeleccionadaId(id);
    setGestionPasadaSeleccionadaAnio(anio);
    // CORRECCIÓN: Eliminar la siguiente línea
    // setValue('gestionPasadaId', value); // <-- Esta línea causa el error

  }, [/* No necesita setValue como dependencia */]); // Se elimina setValue de las dependencias

  const onSubmitFormularioPrincipal: SubmitHandler<ResponsableFormData> = useCallback((formData) => {
    if (isReadOnly) return;
    const generatedPassword = generatePassword();
    const payload: CrearResponsablePayload = {
        nombre: formData.nombres, apellido: formData.apellidos, ci: formData.ci,
        email: formData.correo, telefono: formData.celular, areas: formData.areas,
        password: generatedPassword, id_olimpiada: ID_OLIMPIADA_ACTUAL,
    };
    crearResponsable(payload);
  }, [crearResponsable, isReadOnly]);

  const resetFormularioPrincipal = useCallback((resetToDefault = false) => {
      setGestionPasadaSeleccionadaId(null);
      setGestionPasadaSeleccionadaAnio(null);
      if(resetToDefault) {
          resetPrincipalForm(defaultFormValues);
      }
  }, [resetPrincipalForm]);

  return {
    formMethodsPrincipal,
    gestionesPasadas,
    areasDisponiblesQuery,
    isLoadingGestiones,
    isCreatingResponsable,
    onSubmitFormularioPrincipal: formMethodsPrincipal.handleSubmit(onSubmitFormularioPrincipal),
    handleGestionPasadaChange,
    gestionPasadaSeleccionadaId,
    gestionPasadaSeleccionadaAnio,
    primerInputRef,
    resetFormularioPrincipal,
  };
}