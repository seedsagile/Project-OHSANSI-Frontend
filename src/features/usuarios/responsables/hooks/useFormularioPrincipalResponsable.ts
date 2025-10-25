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
import { ID_OLIMPIADA_ACTUAL } from '../utils/constants';

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
  const { reset: resetPrincipalForm} = formMethodsPrincipal;

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

  useEffect(() => {
    const resetValuesBase: ResponsableFormInput = {
        ...defaultFormValues,
        ci: ciVerificado ?? '',
    };

    if (isReadOnly && datosPersonaVerificada) {
        console.log("[useFormularioPrincipalResponsable] useEffect - Scenario 3 (ReadOnly): Resetting form", datosPersonaVerificada, initialAreas);
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
        console.log("[useFormularioPrincipalResponsable] useEffect - Scenario 2: Resetting form", datosPersonaVerificada);
        resetPrincipalForm({
            ...resetValuesBase,
            nombres: datosPersonaVerificada.Nombres || '',
            apellidos: datosPersonaVerificada.Apellidos || '',
            celular: datosPersonaVerificada.Teléfono || '',
            correo: datosPersonaVerificada.Correo || '', 
            areas: [],
        });
        setGestionPasadaSeleccionadaId(null);
        setGestionPasadaSeleccionadaAnio(null);
    } else if (ciVerificado) {
        console.log("[useFormularioPrincipalResponsable] useEffect - Scenario 1: Resetting form with CI", ciVerificado);
        resetPrincipalForm(resetValuesBase);
        setGestionPasadaSeleccionadaId(null);
        setGestionPasadaSeleccionadaAnio(null);
        setTimeout(() => primerInputRef.current?.focus(), 100);
    } else {
        console.log("[useFormularioPrincipalResponsable] useEffect - Default Reset");
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

    console.log("[useFormularioPrincipalResponsable] handleGestionPasadaChange - ID:", id, "Año:", anio);
    setGestionPasadaSeleccionadaId(id);
    setGestionPasadaSeleccionadaAnio(anio);
  }, []);

  const onSubmitFormularioPrincipal: SubmitHandler<ResponsableFormData> = useCallback((formData) => {
    if (isReadOnly) {
        console.warn("[useFormularioPrincipalResponsable] onSubmit called in readOnly mode. Ignoring.");
        return;
    }
    console.log("[useFormularioPrincipalResponsable] onSubmitFormularioPrincipal - Data validated by Zod:", formData);
    const generatedPassword = generatePassword();
    const payload: CrearResponsablePayload = {
        nombre: formData.nombres,
        apellido: formData.apellidos,
        ci: formData.ci,
        email: formData.correo,
        telefono: formData.celular,
        areas: formData.areas,
        password: generatedPassword,
        id_olimpiada: ID_OLIMPIADA_ACTUAL,
    };
    console.log("[useFormularioPrincipalResponsable] onSubmitFormularioPrincipal - Calling mutation with payload:", payload);
    crearResponsable(payload);
  }, [crearResponsable, isReadOnly]);

  const resetFormularioPrincipalHook = useCallback((resetToDefault = false) => {
      console.log("[useFormularioPrincipalResponsable] resetFormularioPrincipalHook called");
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
    resetFormularioPrincipal: resetFormularioPrincipalHook,
  };
}