import { useState, useCallback, useEffect, useRef } from 'react';
import { useForm, SubmitHandler, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import isEqual from 'lodash.isequal';

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

const GESTION_ACTUAL_ANIO = '2025';
const ID_OLIMPIADA_ACTUAL = 1;

const generatePassword = (): string => {
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const all = lower + upper + numbers;
  const randChar = (set: string) => set.charAt(Math.floor(Math.random() * set.length));
  let pwd = randChar(lower) + randChar(upper) + randChar(numbers);
  for (let i = 3; i < 8; i++) pwd += randChar(all);
  pwd = pwd.split('').sort(() => Math.random() - 0.5).join('');
  return pwd;
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
  const [verificandoAsignacionActual, setVerificandoAsignacionActual] = useState(false);

  const modalTimerRef = useRef<number | undefined>(undefined);
  const primerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => clearTimeout(modalTimerRef.current), []);

  const closeModalFeedback = useCallback(() => {
    setModalFeedback(initialModalState);
    clearTimeout(modalTimerRef.current);
  }, []);

  const formMethodsPrincipal: UseFormReturn<ResponsableFormData, any, ResponsableFormInput> = useForm<ResponsableFormData, any, ResponsableFormInput>({
    resolver: zodResolver(datosResponsableSchema),
    mode: 'onChange',
    defaultValues: defaultFormValues,
  });
  const { setValue, getValues, reset: resetPrincipal } = formMethodsPrincipal;

  const formMethodsVerificacion = useForm<VerificacionCIForm>({
    resolver: zodResolver(verificacionCISchema),
    mode: 'onSubmit',
  });
  const { reset: resetVerificacion } = formMethodsVerificacion;

  const { data: areasDisponibles = [], isLoading: isLoadingAreas } = useQuery<Area[], Error>({
    queryKey: ['areasActuales', GESTION_ACTUAL_ANIO],
    queryFn: responsableService.obtenerAreasActuales,
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

  const { refetch: refetchAsignacionActual } = useQuery<number[], Error>({
      queryKey: ['areasAsignadasActuales', ciVerificado, GESTION_ACTUAL_ANIO],
      queryFn: () => responsableService.obtenerAreasPasadas(GESTION_ACTUAL_ANIO, ciVerificado),
      enabled: false,
      staleTime: 0,
      refetchOnWindowFocus: false,
  });

  const { mutate: verificarCI, isPending: isVerifyingCI } = useMutation<DatosPersonaVerificada | null, Error, string>({
    mutationFn: responsableService.verificarCI,
    onSuccess: async (data, ciInput) => {
      setCiVerificado(ciInput);
      setDatosPersona(data);
      setIsReadOnly(false);
      setGestionPasadaSeleccionadaId(null);
      setGestionPasadaSeleccionadaAnio(null);
      setAreasSeleccionadas([]);
      setVerificandoAsignacionActual(false);

      const resetValuesBase: ResponsableFormInput = { ...defaultFormValues, ci: ciInput, gestionPasadaId: '' };

      if (data) {
        setVerificandoAsignacionActual(true);
        setPasoActual('CARGANDO_VERIFICACION');
        try {
            const { data: areasActualesIdsData } = await refetchAsignacionActual();
            const areasActualesIds = Array.isArray(areasActualesIdsData) ? areasActualesIdsData : [];
            const estaEnGestionActual = areasActualesIds.length > 0;

            if (estaEnGestionActual) {
                setIsReadOnly(true);
                setPasoActual('READ_ONLY');
                setAreasSeleccionadas(areasActualesIds);
                const resetDataReadOnly: ResponsableFormInput = {
                    ...resetValuesBase,
                    nombres: data.Nombres || '', apellidos: data.Apellidos || '',
                    celular: data.Teléfono || '', correo: data.Correo || '',
                    areas: areasActualesIds,
                };
                resetPrincipal(resetDataReadOnly);
            } else {
                setPasoActual('FORMULARIO_DATOS');
                const resetDataExisting: ResponsableFormInput = {
                    ...resetValuesBase,
                    nombres: data.Nombres || '', apellidos: data.Apellidos || '',
                    celular: data.Teléfono || '', correo: '', areas: [],
                };
                resetPrincipal(resetDataExisting);
            }
        } catch (errorCaught) {
            console.error("Error al verificar asignación actual:", errorCaught);
            setPasoActual('FORMULARIO_DATOS');
            const resetDataFallback: ResponsableFormInput = {
                ...resetValuesBase,
                nombres: data.Nombres || '', apellidos: data.Apellidos || '',
                celular: data.Teléfono || '', correo: '', areas: [],
            };
            resetPrincipal(resetDataFallback);
            setModalFeedback({ isOpen: true, type: 'error', title: 'Advertencia', message: 'No se pudo verificar si el responsable ya está asignado. Procediendo con el registro normal.' });
        } finally {
            setVerificandoAsignacionActual(false);
        }
      } else {
        setPasoActual('FORMULARIO_DATOS');
        resetPrincipal(resetValuesBase);
      }

      if (!isReadOnly && !verificandoAsignacionActual) {
          setTimeout(() => { primerInputRef.current?.focus(); }, 100);
      }
    },
    onError: (error) => {
      console.error('Error al verificar CI:', error);
      setCiVerificado(''); setDatosPersona(null); setIsReadOnly(false);
      setModalFeedback({ isOpen: true, type: 'error', title: 'Error Verificación', message: error.message || 'No se pudo verificar CI.' });
      setPasoActual('VERIFICACION_CI');
    },
  });

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
      console.error('Error al crear responsable:', error); // Mantener este log es útil
      setModalFeedback({ isOpen: true, type: 'error', title: 'Error Guardado', message: error.message || 'No se pudo registrar.' });
      setPasoActual('FORMULARIO_DATOS'); // Permite reintentar
    },
  });

  const previousGestionIdRef = useRef<number | null | undefined>(undefined);

  useEffect(() => {
    const currentGestionId = gestionPasadaSeleccionadaId;
    const previousGestionId = previousGestionIdRef.current;

    if (currentGestionId !== previousGestionId) {
      const currentFormAreas = getValues('areas') || [];

      if (typeof currentGestionId === 'number' && areasDisponibles.length > 0 && Array.isArray(areasPasadasIds) && areasPasadasIds.length > 0 && !isLoadingAreasPasadas) {
        const idsAreasActuales = (areasDisponibles || []).map((a: Area) => a.id_area);
        const idsComunes = (areasPasadasIds || []).filter((idPasada: number) => idsAreasActuales.includes(idPasada));
        const currentFormAreasSet = new Set(currentFormAreas);
        const idsComunesSet = new Set(idsComunes);

        if (!isEqual(currentFormAreasSet, idsComunesSet)) {
          setAreasSeleccionadas(idsComunes);
          setValue('areas', idsComunes, { shouldValidate: true, shouldDirty: true });
        }
      } else if (currentGestionId === null) {
        if (!isReadOnly && currentFormAreas.length > 0) {
          setAreasSeleccionadas([]);
          setValue('areas', [], { shouldValidate: true, shouldDirty: true });
        }
      }
    }

    previousGestionIdRef.current = currentGestionId;
  }, [
      gestionPasadaSeleccionadaId,
      areasDisponibles,
      areasPasadasIds,
      isLoadingAreasPasadas,
      isReadOnly,
      setValue, 
      getValues
  ]);

  const handleVerificarCISubmit = formMethodsVerificacion.handleSubmit((formData) => {
    setPasoActual('CARGANDO_VERIFICACION');
    verificarCI(formData.ci);
  });

  const handleSeleccionarArea = useCallback((areaId: number, seleccionado: boolean) => {
    if (isReadOnly) return;
    setAreasSeleccionadas(prev => {
        const nuevasAreas = seleccionado
            ? [...prev, areaId]
            : prev.filter(id => id !== areaId);
        setValue('areas', nuevasAreas, { shouldValidate: true, shouldDirty: true });
        return nuevasAreas;
    });
  }, [isReadOnly, setValue]);


  const handleToggleSeleccionarTodas = useCallback((seleccionar: boolean) => {
    if (isReadOnly || isLoadingAreas) return;
    const todosLosIds = (areasDisponibles || []).map(area => area.id_area);
    const nuevasAreas = seleccionar ? todosLosIds : [];
    setAreasSeleccionadas(nuevasAreas);
    setValue('areas', nuevasAreas, { shouldValidate: true, shouldDirty: true });
  }, [areasDisponibles, isReadOnly, isLoadingAreas, setValue]);


  const handleGestionPasadaChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedOption = event.target.selectedOptions[0];
      const value = selectedOption.value;
      const gestionAnio = selectedOption.dataset.gestion;
      const id = value ? parseInt(value, 10) : null;
      const anio = gestionAnio || null;

      if(id !== gestionPasadaSeleccionadaId) {
          setGestionPasadaSeleccionadaId(id);
          setGestionPasadaSeleccionadaAnio(anio);
      }
  }, [gestionPasadaSeleccionadaId]);


  const onSubmitFormularioPrincipal: SubmitHandler<ResponsableFormData> = useCallback((formData) => {
    if (isReadOnly) return;
    setPasoActual('CARGANDO_GUARDADO');
    const generatedPassword = generatePassword();
    const payload: CrearResponsablePayload = {
      nombre: formData.nombres, apellido: formData.apellidos, ci: formData.ci,
      email: formData.correo, telefono: formData.celular, areas: formData.areas,
      password: generatedPassword, id_olimpiada: ID_OLIMPIADA_ACTUAL,
    };
    crearResponsable(payload);
  }, [crearResponsable, isReadOnly]);


  const handleCancelar = useCallback(() => {
    setPasoActual('VERIFICACION_CI');
    setDatosPersona(null); setCiVerificado(''); setAreasSeleccionadas([]);
    setGestionPasadaSeleccionadaId(null); setGestionPasadaSeleccionadaAnio(null);
    setIsReadOnly(false);
    resetPrincipal(defaultFormValues);
    resetVerificacion();
    closeModalFeedback();
  }, [resetPrincipal, resetVerificacion, closeModalFeedback]);

  const isLoading = isLoadingAreas; 
  const isProcessing = isVerifyingCI || verificandoAsignacionActual || isCreatingResponsable;


  return {
    pasoActual, datosPersona, areasDisponibles, gestionesPasadas,
    areasSeleccionadas, modalFeedback, isReadOnly, gestionPasadaSeleccionadaId,
    isLoading, isLoadingGestiones, isLoadingAreasPasadas, isProcessing,
    formMethodsVerificacion, formMethodsPrincipal,
    primerInputRef,
    handleVerificarCISubmit, handleSeleccionarArea, handleToggleSeleccionarTodas,
    handleGestionPasadaChange,
    onSubmitFormularioPrincipal: formMethodsPrincipal.handleSubmit(onSubmitFormularioPrincipal),
    handleCancelar, closeModalFeedback,
  };
}