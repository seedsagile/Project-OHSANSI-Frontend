// src/features/usuarios/responsables/hooks/useGestionResponsable.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import type {
  DatosPersonaVerificada,
  Gestion,
  CrearResponsablePayload,
  ResponsableCreado,
  PasoRegistroResponsable,
  ModalFeedbackState,
  Area,
} from '../types'; // Asegúrate que la ruta sea correcta (index.ts)
import { verificacionCISchema, datosResponsableSchema } from '../utils/validations';
// Importar solo el tipo final (Output) y el tipo Input inferido
import type {
    VerificacionCIForm,
    ResponsableFormData // Tipo final (Output)
} from '../utils/validations';

import * as responsableService from '../services/responsablesService'; // Asegúrate que la ruta sea correcta
import { areasService } from '@/features/areas/services/areasService';

const initialModalState: ModalFeedbackState = { isOpen: false, title: '', message: '', type: 'info' };

// Valores por defecto explícitos ANTES de la transformación Zod
const defaultFormValues = {
  nombres: '',
  apellidos: '',
  correo: '',
  ci: '',
  celular: '',
  gestionPasadaId: '', // <- String vacío ANTES de preprocess
  areas: [] as number[], // Tipar como array de números vacío
};

export function useGestionResponsable() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [pasoActual, setPasoActual] = useState<PasoRegistroResponsable>('VERIFICACION_CI');
  const [datosPersona, setDatosPersona] = useState<DatosPersonaVerificada | null>(null);
  const [areasSeleccionadas, setAreasSeleccionadas] = useState<number[]>([]);
  const [modalFeedback, setModalFeedback] = useState<ModalFeedbackState>(initialModalState);
  const modalTimerRef = useRef<number | undefined>(undefined);

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
      // CORRECCIÓN 1: Pasar objeto compatible con defaultValues (tipo Input) a reset
      const resetValuesBase = {
        ...defaultFormValues, // Empezar con los defaults completos
        ci: ciInput, // Sobrescribir CI
      };

      if (data) {
        setDatosPersona(data);
        formMethodsPrincipal.reset({
          ...resetValuesBase,
          nombres: data.nombres,
          apellidos: data.apellidos,
          celular: data.celular || '',
          gestionPasadaId: '', // Asegurar string vacío
        });
      } else {
        setDatosPersona(null);
        formMethodsPrincipal.reset(resetValuesBase);
      }
      setPasoActual('FORMULARIO_DATOS');
    },
    onError: (error) => {
      setModalFeedback({ isOpen: true, type: 'error', title: 'Error Verificación', message: error.message || 'No se pudo verificar CI.' });
      setPasoActual('VERIFICACION_CI');
    },
  });

  const { mutate: crearResponsable, isPending: isCreatingResponsable } = useMutation<ResponsableCreado, Error, CrearResponsablePayload>({
    mutationFn: responsableService.crearResponsable,
    onSuccess: (data) => {
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
  // CORRECCIÓN 2: Simplificar useForm, usar solo el resolver. TypeScript inferirá el tipo final.
  const formMethodsPrincipal = useForm({ // Quitar <ResponsableFormData>
    resolver: zodResolver(datosResponsableSchema),
    mode: 'onChange',
    // CORRECCIÓN 3: defaultValues usan el tipo Input
    defaultValues: defaultFormValues,
  });

  const formMethodsVerificacion = useForm<VerificacionCIForm>({
    resolver: zodResolver(verificacionCISchema), mode: 'onSubmit',
  });

  // --- Callbacks ---
  const handleVerificarCI = useCallback((formData: VerificacionCIForm) => {
    setPasoActual('CARGANDO_VERIFICACION'); verificarCI(formData.ci);
  }, [verificarCI]);

  const handleSeleccionarArea = useCallback((areaId: number, seleccionado: boolean) => {
    const nuevasAreas = seleccionado ? [...areasSeleccionadas, areaId] : areasSeleccionadas.filter(id => id !== areaId);
    setAreasSeleccionadas(nuevasAreas);
    // @ts-ignore // CORRECCIÓN 4: Usar ts-ignore si setValue sigue dando problemas de tipo
    formMethodsPrincipal.setValue('areas', nuevasAreas, { shouldValidate: true, shouldDirty: true });
  }, [areasSeleccionadas, formMethodsPrincipal]);

  // CORRECCIÓN 5: Tipar explícitamente formData como ResponsableFormData
  const onSubmitFormularioPrincipal: SubmitHandler<ResponsableFormData> = useCallback((formData) => {
    setPasoActual('CARGANDO_GUARDADO');
    const payload: CrearResponsablePayload = {
      persona: {
        nombre: formData.nombres, apellido: formData.apellidos, ci: formData.ci,
        email: formData.correo, telefono: formData.celular,
      },
      areas: formData.areas,
      id_gestion_pasada: formData.gestionPasadaId
    };
    crearResponsable(payload);
  }, [crearResponsable]);

  const handleCancelar = useCallback(() => {
    setPasoActual('VERIFICACION_CI'); setDatosPersona(null);
    // CORRECCIÓN 6: Resetear con el tipo Input
    formMethodsPrincipal.reset(defaultFormValues);
    formMethodsVerificacion.reset();
    setAreasSeleccionadas([]); closeModalFeedback();
  }, [formMethodsPrincipal, formMethodsVerificacion, closeModalFeedback]);

  // --- Estados Consolidados ---
  const isLoading = isLoadingAreas || isLoadingGestiones;
  const isProcessing = isVerifyingCI || isCreatingResponsable || pasoActual === 'CARGANDO_VERIFICACION' || pasoActual === 'CARGANDO_GUARDADO';

  return {
    pasoActual, formMethodsVerificacion, formMethodsPrincipal,
    areasDisponibles, gestionesPasadas, areasSeleccionadas, datosPersona,
    isLoading, isProcessing, modalFeedback,
    handleVerificarCISubmit: formMethodsVerificacion.handleSubmit(handleVerificarCI),
    handleSeleccionarArea,
    // CORRECCIÓN 7: Asegurar que el handler pasado a handleSubmit coincida
    onSubmitFormularioPrincipal: formMethodsPrincipal.handleSubmit(onSubmitFormularioPrincipal),
    handleCancelar, closeModalFeedback,
  };
}