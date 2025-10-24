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
} from '../types';
import { verificacionCISchema, datosResponsableSchema } from '../utils/validations';
import type {
  VerificacionCIForm,
  ResponsableFormData,
  ResponsableFormInput
} from '../utils/validations';

import * as responsableService from '../services/responsablesService';

// TODO: Obtener ID_OLIMPIADA_ACTUAL de forma dinámica (config, API global, etc.)
const ID_OLIMPIADA_ACTUAL = 1;

const generatePassword = (length = 8): string => {
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const all = lower + upper + numbers;
  const randChar = (set: string) => set.charAt(Math.floor(Math.random() * set.length));
  let pwd = randChar(lower) + randChar(upper) + randChar(numbers);
  for (let i = 3; i < length; i++) pwd += randChar(all);
  return pwd.split('').sort(() => Math.random() - 0.5).join('');
};

const initialModalState: ModalFeedbackState = { isOpen: false, title: '', message: '', type: 'info' };
const defaultFormValues: ResponsableFormInput = {
  nombres: '', apellidos: '', correo: '', ci: '', celular: '',
  gestionPasadaId: '',
  areas: [],
};

export function useGestionResponsable() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [pasoActual, setPasoActual] = useState<PasoRegistroResponsable>('VERIFICACION_CI');
  const [datosPersona, setDatosPersona] = useState<DatosPersonaVerificada | null>(null);
  const [ciVerificado, setCiVerificado] = useState<string>('');
  const [areasSeleccionadas, setAreasSeleccionadas] = useState<number[]>([]);
  const [modalFeedback, setModalFeedback] = useState<ModalFeedbackState>(initialModalState);
  const [gestionPasadaSeleccionadaId, setGestionPasadaSeleccionadaId] = useState<number | null>(null);
  const [gestionPasadaSeleccionadaAnio, setGestionPasadaSeleccionadaAnio] = useState<string | null>(null);
  const [isReadOnly, setIsReadOnly] = useState(false);

  const modalTimerRef = useRef<number | undefined>(undefined);
  const primerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => clearTimeout(modalTimerRef.current), []);

  const closeModalFeedback = useCallback(() => {
    setModalFeedback(initialModalState);
    clearTimeout(modalTimerRef.current);
  }, []);

  const { data: areasDisponibles = [], isLoading: isLoadingAreas } = useQuery<Area[], Error>({
    queryKey: ['areasActuales'],
    queryFn: responsableService.obtenerAreasActuales, // Servicio actualizado
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    enabled: pasoActual === 'FORMULARIO_DATOS' || pasoActual === 'READ_ONLY',
  });

  const { data: gestionesPasadas = [], isLoading: isLoadingGestiones } = useQuery<Gestion[], Error>({
    queryKey: ['gestionesPasadas', ciVerificado],
    queryFn: () => responsableService.obtenerGestionesPasadas(ciVerificado),
    enabled: !!ciVerificado && !!datosPersona && !isReadOnly,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const { data: areasPasadasIds = [], isLoading: isLoadingAreasPasadas } = useQuery<number[], Error>({
    queryKey: ['areasPasadas', gestionPasadaSeleccionadaAnio, ciVerificado],
    queryFn: () => responsableService.obtenerAreasPasadas(gestionPasadaSeleccionadaAnio!, ciVerificado),
    enabled: !!ciVerificado && !!gestionPasadaSeleccionadaAnio && !isReadOnly,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const { mutate: verificarCI, isPending: isVerifyingCI } = useMutation<DatosPersonaVerificada | null, Error, string>({
    mutationFn: responsableService.verificarCI,
    onSuccess: (data, ciInput) => {
      setCiVerificado(ciInput);
      setDatosPersona(data);
      setIsReadOnly(false);
      setGestionPasadaSeleccionadaId(null);
      setGestionPasadaSeleccionadaAnio(null);
      setAreasSeleccionadas([]);

      const resetValuesBase: ResponsableFormInput = { ...defaultFormValues, ci: ciInput };

      // TODO: Implementar lógica real para Escenario 3 basada en la respuesta de `data`
      // Esta lógica necesita saber si `data` indica que el usuario ya está en GESTION_ACTUAL
      // y cuáles son sus `areasEnGestionActual`. Asumiremos que no por ahora.
      /*
      if (data?.estaEnGestionActual) { // Necesita info de la API
          setIsReadOnly(true);
          setPasoActual('READ_ONLY');
          const areasActualesAsignadas = data.areasEnGestionActual || [];
          setAreasSeleccionadas(areasActualesAsignadas);
          formMethodsPrincipal.reset({
              ...resetValuesBase,
              nombres: data.Nombres,
              apellidos: data.Apellidos,
              celular: data.Teléfono || '',
              correo: data.Correo || '', // Usar correo existente
              areas: areasActualesAsignadas,
              gestionPasadaId: '', // Incluido para tipo Input
          });
      } else */
      if (data) {
        setPasoActual('FORMULARIO_DATOS');
        const resetData: ResponsableFormInput = {
            ...resetValuesBase,
            nombres: data.Nombres,
            apellidos: data.Apellidos,
            celular: data.Teléfono || '',
            correo: '',
            gestionPasadaId: '',
            areas: [],
        };
        formMethodsPrincipal.reset(resetData);
      } else {
        setPasoActual('FORMULARIO_DATOS');
        formMethodsPrincipal.reset(resetValuesBase);
      }

      if (!isReadOnly) {
          setTimeout(() => { primerInputRef.current?.focus(); }, 100);
      }
    },
    onError: (error) => {
      setCiVerificado('');
      setDatosPersona(null);
      setIsReadOnly(false);
      setModalFeedback({ isOpen: true, type: 'error', title: 'Error Verificación', message: error.message || 'No se pudo verificar CI.' });
      setPasoActual('VERIFICACION_CI');
    },
  });

  // Crear Responsable
  const { mutate: crearResponsable, isPending: isCreatingResponsable } = useMutation<ResponsableCreado, Error, CrearResponsablePayload>({
    mutationFn: responsableService.crearResponsable,
    onSuccess: (data) => {
      setModalFeedback({ isOpen: true, type: 'success', title: '¡Éxito!', message: data.message || `Responsable registrado.` });
      queryClient.invalidateQueries({ queryKey: ['responsables'] });
      modalTimerRef.current = window.setTimeout(() => {
            closeModalFeedback();
            handleCancelar();
            navigate('/dashboard');
      }, 2000);
    },
    onError: (error) => {
      setModalFeedback({ isOpen: true, type: 'error', title: 'Error Guardado', message: error.message || 'No se pudo registrar.' });
      setPasoActual('FORMULARIO_DATOS');
    },
  });

  const formMethodsPrincipal = useForm<ResponsableFormData, any, ResponsableFormInput>({
    resolver: zodResolver(datosResponsableSchema),
    mode: 'onChange',
    defaultValues: defaultFormValues,
  });

  const formMethodsVerificacion = useForm<VerificacionCIForm>({
    resolver: zodResolver(verificacionCISchema),
    mode: 'onSubmit',
  });

  useEffect(() => {
    if (gestionPasadaSeleccionadaId && areasDisponibles.length > 0 && areasPasadasIds.length > 0 && !isLoadingAreasPasadas) {
      const idsAreasActuales = areasDisponibles.map(a => a.id_area);
      const idsComunes = areasPasadasIds.filter(idPasada => idsAreasActuales.includes(idPasada));
      setAreasSeleccionadas(idsComunes);
      formMethodsPrincipal.setValue('areas', idsComunes, { shouldValidate: true, shouldDirty: true });
    }
  }, [gestionPasadaSeleccionadaId, areasDisponibles, areasPasadasIds, isLoadingAreasPasadas, formMethodsPrincipal]);

  const handleVerificarCISubmit = formMethodsVerificacion.handleSubmit((formData) => {
    setPasoActual('CARGANDO_VERIFICACION');
    verificarCI(formData.ci);
  });

  const handleSeleccionarArea = useCallback((areaId: number, seleccionado: boolean) => {
    if (isReadOnly) return;
    const nuevasAreas = seleccionado
        ? [...areasSeleccionadas, areaId]
        : areasSeleccionadas.filter(id => id !== areaId);
    setAreasSeleccionadas(nuevasAreas);
    formMethodsPrincipal.setValue('areas', nuevasAreas, { shouldValidate: true, shouldDirty: true });
  }, [areasSeleccionadas, formMethodsPrincipal, isReadOnly]);

  const handleToggleSeleccionarTodas = useCallback((seleccionar: boolean) => {
    if (isReadOnly || isLoadingAreas) return;

    const todosLosIds = areasDisponibles.map(area => area.id_area);
    const nuevasAreas = seleccionar ? todosLosIds : [];

    setAreasSeleccionadas(nuevasAreas);
    formMethodsPrincipal.setValue('areas', nuevasAreas, { shouldValidate: true, shouldDirty: true });
  }, [areasDisponibles, formMethodsPrincipal, isReadOnly, isLoadingAreas]);

  const handleGestionPasadaChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedOption = event.target.selectedOptions[0];
      const value = selectedOption.value;
      const gestionAnio = selectedOption.dataset.gestion;

      const id = value ? parseInt(value, 10) : null;
      const anio = gestionAnio || null;

      setGestionPasadaSeleccionadaId(id);
      setGestionPasadaSeleccionadaAnio(anio);

      setAreasSeleccionadas([]);
      formMethodsPrincipal.setValue('areas', [], { shouldValidate: true });
  }, [formMethodsPrincipal]);

  const onSubmitFormularioPrincipal: SubmitHandler<ResponsableFormData> = useCallback((formData) => {
    if (isReadOnly) return;
    setPasoActual('CARGANDO_GUARDADO');
    const generatedPassword = generatePassword(); 

    const payload: CrearResponsablePayload = {
      nombre: formData.nombres,
      apellido: formData.apellidos,
      ci: formData.ci,
      email: formData.correo,
      telefono: formData.celular,
      areas: formData.areas,
      password: generatedPassword,
      // TODO: Confirmar si id_olimpiada es necesario y cómo obtener ID_OLIMPIADA_ACTUAL
      id_olimpiada: ID_OLIMPIADA_ACTUAL,
    };
    crearResponsable(payload);
  }, [crearResponsable, isReadOnly]);

  const handleCancelar = useCallback(() => {
    setPasoActual('VERIFICACION_CI');
    setDatosPersona(null);
    setCiVerificado('');
    setAreasSeleccionadas([]);
    setGestionPasadaSeleccionadaId(null);
    setGestionPasadaSeleccionadaAnio(null);
    setIsReadOnly(false);
    formMethodsPrincipal.reset(defaultFormValues);
    formMethodsVerificacion.reset();
    closeModalFeedback();
  }, [formMethodsPrincipal, formMethodsVerificacion, closeModalFeedback /*, navigate */]);

  const isLoading = isLoadingAreas;
  const isProcessing = isVerifyingCI || isCreatingResponsable;
  return {
    pasoActual,
    datosPersona,
    areasDisponibles,
    gestionesPasadas,
    areasSeleccionadas,
    modalFeedback,
    isReadOnly,
    gestionPasadaSeleccionadaId,
    isLoading,
    isLoadingGestiones,
    isLoadingAreasPasadas,
    isProcessing,
    formMethodsVerificacion,
    formMethodsPrincipal,
    primerInputRef,
    handleVerificarCISubmit,
    handleSeleccionarArea,
    handleToggleSeleccionarTodas,
    handleGestionPasadaChange,
    onSubmitFormularioPrincipal: formMethodsPrincipal.handleSubmit(onSubmitFormularioPrincipal),
    handleCancelar,
    closeModalFeedback,
  };
}