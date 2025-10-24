// src/features/usuarios/responsables/hooks/useGestionResponsable.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form'; // Quitar DeepPartial
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

// *** CORREGIDO: Importar los tipos que SÍ existen ***
import type {
  DatosPersonaVerificada,
  Gestion,
  CrearResponsablePayload,
  ResponsableCreado,
  PasoRegistroResponsable, // <--- CORREGIDO
  ModalFeedbackState, // <--- CORREGIDO
  Area,
} from '../types';
import { verificacionCISchema, datosResponsableSchema } from '../utils/validations';
import type {
  VerificacionCIForm,
  ResponsableFormData, // Tipo Output (después de Zod)
  ResponsableFormInput // Tipo Input (antes de Zod)
} from '../utils/validations';

import * as responsableService from '../services/responsablesService';
import { areasService } from '@/features/areas/services/areasService';

const initialModalState: ModalFeedbackState = { isOpen: false, title: '', message: '', type: 'info' };

// *** CORREGIDO: defaultFormValues debe coincidir con ResponsableFormInput ***
const defaultFormValues: ResponsableFormInput = {
  nombres: '',
  apellidos: '',
  correo: '',
  ci: '',
  celular: '',
  gestionPasadaId: '', // string vacío es compatible con string | undefined
  areas: [],
};


export function useGestionResponsable() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [pasoActual, setPasoActual] = useState<PasoRegistroResponsable>('VERIFICACION_CI');
  const [datosPersona, setDatosPersona] = useState<DatosPersonaVerificada | null>(null);
  const [areasSeleccionadas, setAreasSeleccionadas] = useState<number[]>([]);
  const [modalFeedback, setModalFeedback] = useState<ModalFeedbackState>(initialModalState);
  const modalTimerRef = useRef<number | undefined>(undefined);
  const primerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => clearTimeout(modalTimerRef.current), []);

  const closeModalFeedback = useCallback(() => {
    setModalFeedback(initialModalState);
    clearTimeout(modalTimerRef.current);
  }, []);

  const { data: areasDisponibles = [], isLoading: isLoadingAreas } = useQuery<Area[], Error>({
    queryKey: ['areas'], queryFn: areasService.obtenerAreas,
    staleTime: 1000 * 60 * 5, refetchOnWindowFocus: false,
  });

  const { data: gestionesPasadas = [], isLoading: isLoadingGestiones } = useQuery<Gestion[], Error>({
    queryKey: ['gestionesPasadas'], queryFn: responsableService.obtenerGestionesPasadas,
    staleTime: 1000 * 60 * 60, refetchOnWindowFocus: false,
    enabled: pasoActual === 'FORMULARIO_DATOS',
  });

  const { mutate: verificarCI, isPending: isVerifyingCI } = useMutation<DatosPersonaVerificada | null, Error, string>({
    mutationFn: responsableService.verificarCI,
    onSuccess: (data, ciInput) => {
      // *** CORREGIDO: El tipo para reset debe ser ResponsableFormInput ***
      const resetValuesBase: ResponsableFormInput = {
        ...defaultFormValues,
        ci: ciInput,
      };

      if (data) {
        setDatosPersona(data);
        formMethodsPrincipal.reset({
          ...resetValuesBase,
          nombres: data.nombres,
          apellidos: data.apellidos,
          celular: data.celular || '',
          gestionPasadaId: '', // string vacío para el <select>
        });
      } else {
        setDatosPersona(null);
        formMethodsPrincipal.reset(resetValuesBase);
      }
      setPasoActual('FORMULARIO_DATOS');
      setTimeout(() => { primerInputRef.current?.focus(); }, 0);
    },
    onError: (error) => {
      setModalFeedback({ isOpen: true, type: 'error', title: 'Error Verificación', message: error.message || 'No se pudo verificar CI.' });
      setPasoActual('VERIFICACION_CI');
    },
  });

  const { mutate: crearResponsable, isPending: isCreatingResponsable } = useMutation<ResponsableCreado, Error, CrearResponsablePayload>({
    mutationFn: responsableService.crearResponsable,
    onSuccess: (data) => {
       // *** CORREGIDO: Acceder a data.message ***
       setModalFeedback({ isOpen: true, type: 'success', title: '¡Éxito!', message: data.message || `Responsable registrado.` });
       queryClient.invalidateQueries({ queryKey: ['responsables'] });
       modalTimerRef.current = window.setTimeout(() => { closeModalFeedback(); navigate('/dashboard'); }, 2000);
    },
    onError: (error) => {
       setModalFeedback({ isOpen: true, type: 'error', title: 'Error Guardado', message: error.message || 'No se pudo registrar.' });
       setPasoActual('FORMULARIO_DATOS');
    },
  });

  // --- React Hook Form ---
  // *** CORREGIDO: Usar los 3 tipos genéricos: Output, Context, Input ***
  const formMethodsPrincipal = useForm<ResponsableFormData, any, ResponsableFormInput>({
    resolver: zodResolver(datosResponsableSchema),
    mode: 'onChange',
    defaultValues: defaultFormValues, // Coincide con ResponsableFormInput
  });

  const formMethodsVerificacion = useForm<VerificacionCIForm>({
    resolver: zodResolver(verificacionCISchema), mode: 'onSubmit',
  });

  // --- Callbacks ---
  const handleVerificarCI = useCallback((formData: VerificacionCIForm) => {
    setPasoActual('CARGANDO_VERIFICACION'); verificarCI(formData.ci);
  }, [verificarCI]);

  const handleSeleccionarArea = useCallback((areaId: number, seleccionado: boolean) => {
    const nuevasAreas = seleccionado
        ? [...areasSeleccionadas, areaId]
        : areasSeleccionadas.filter(id => id !== areaId);
    setAreasSeleccionadas(nuevasAreas);
    formMethodsPrincipal.setValue('areas', nuevasAreas, { shouldValidate: true, shouldDirty: true });
  }, [areasSeleccionadas, formMethodsPrincipal]);

  // 'formData' aquí es el tipo OUTPUT (ResponsableFormData)
  const onSubmitFormularioPrincipal: SubmitHandler<ResponsableFormData> = useCallback((formData) => {
    setPasoActual('CARGANDO_GUARDADO');
    const payload: CrearResponsablePayload = {
      persona: {
        nombre: formData.nombres,
        apellido: formData.apellidos,
        ci: formData.ci,
        email: formData.correo,
        telefono: formData.celular,
      },
      areas: formData.areas,
      ...(formData.gestionPasadaId && { id_gestion_pasada: formData.gestionPasadaId })
    };
    crearResponsable(payload);
  }, [crearResponsable]);

  const handleCancelar = useCallback(() => {
    setPasoActual('VERIFICACION_CI');
    setDatosPersona(null);
    // *** CORREGIDO: Reset usa ResponsableFormInput ***
    formMethodsPrincipal.reset(defaultFormValues);
    formMethodsVerificacion.reset();
    setAreasSeleccionadas([]);
    closeModalFeedback();
  }, [formMethodsPrincipal, formMethodsVerificacion, closeModalFeedback]);

  // --- Estados Consolidados ---
  const isLoading = isLoadingAreas || isLoadingGestiones;
  const isProcessing = isVerifyingCI || isCreatingResponsable;

  return {
    pasoActual, formMethodsVerificacion, formMethodsPrincipal,
    areasDisponibles, gestionesPasadas, areasSeleccionadas, datosPersona,
    isLoading, isProcessing, modalFeedback, primerInputRef,
    handleVerificarCISubmit: formMethodsVerificacion.handleSubmit(handleVerificarCI),
    handleSeleccionarArea,
    // *** CORREGIDO: El handler que se pasa debe aceptar el tipo Output (ResponsableFormData) ***
    onSubmitFormularioPrincipal: formMethodsPrincipal.handleSubmit(onSubmitFormularioPrincipal),
    handleCancelar, closeModalFeedback,
  };
}