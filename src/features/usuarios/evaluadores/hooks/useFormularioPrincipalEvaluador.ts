import { useState, useCallback, useRef, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import * as evaluadorService from '../services/evaluadorService';
import { datosEvaluadorSchema } from '../utils/validations';
import { ID_OLIMPIADA_ACTUAL } from '../utils/constants';
import type {
    Gestion,
    Area,
    DatosPersonaVerificada,
    CrearEvaluadorPayload,
    ActualizarEvaluadorPayload,
    EvaluadorCreado,
    EvaluadorActualizado,
} from '../types';
import type {
    EvaluadorFormData,
    EvaluadorFormInput
} from '../utils/validations';

const defaultFormValues: EvaluadorFormInput = {
    nombres: '', apellidos: '', correo: '', ci: '', celular: '',
    areas: [],
};

interface UseFormularioPrincipalProps {
    ciVerificado: string | null;
    datosPersonaVerificada: DatosPersonaVerificada | null;
    isReadOnly: boolean;
    initialAreas?: number[];
    onFormSubmitSuccess: (data: EvaluadorCreado | EvaluadorActualizado, esActualizacion: boolean) => void;
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
    initialAreas = [],
    onFormSubmitSuccess,
    onFormSubmitError,
}: UseFormularioPrincipalProps) {
    const [gestionPasadaSeleccionadaId, setGestionPasadaSeleccionadaId] = useState<number | null>(null);
    const [gestionPasadaSeleccionadaAnio, setGestionPasadaSeleccionadaAnio] = useState<string | null>(null);
    const primerInputRef = useRef<HTMLInputElement>(null);

    const formMethodsPrincipal = useForm<EvaluadorFormData, any, EvaluadorFormInput>({
        resolver: zodResolver(datosEvaluadorSchema),
        mode: 'all',
        defaultValues: defaultFormValues,
        shouldFocusError: true,
        delayError: 400,
    });
    const { reset: resetPrincipalForm, setError, setFocus } = formMethodsPrincipal;

    const { data: gestionesPasadas = [], isLoading: isLoadingGestiones } = useQuery<Gestion[], Error>({
        queryKey: ['gestionesPasadas', ciVerificado],
        queryFn: () => evaluadorService.obtenerGestionesPasadas(ciVerificado!),
        enabled: !!ciVerificado && !!datosPersonaVerificada && !isReadOnly,
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });

    const areasDisponiblesQuery = useQuery<Area[], Error>({
        queryKey: ['areasActuales'],
        queryFn: evaluadorService.obtenerAreasActuales,
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
        enabled: true,
    });

    useEffect(() => {
            const resetValuesBase: EvaluadorFormInput = {
                ...defaultFormValues,
                ci: ciVerificado ?? '',
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
            } else if (datosPersonaVerificada) {
                resetPrincipalForm({
                    nombres: datosPersonaVerificada.Nombres || '',
                    apellidos: datosPersonaVerificada.Apellidos || '',
                    celular: datosPersonaVerificada.Teléfono || '',
                    correo: datosPersonaVerificada.Correo || '',
                    ci: ciVerificado ?? '',
                    areas: [],
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

    const handleMutationError = (error: AxiosError<BackendValidationError>) => {
        let errorMessage = 'No se pudo guardar.';
        const errorData = error.response?.data;

        if (error.response?.status === 422 && errorData?.errors) {
            let firstFieldWithError: keyof EvaluadorFormData | null = null;
            Object.entries(errorData.errors).forEach(([field, messages]) => {
                const fieldName = field as keyof EvaluadorFormData;
                if (messages.length > 0) {
                    setError(fieldName, { type: 'backend', message: messages[0] });
                    if (!firstFieldWithError) {
                        firstFieldWithError = fieldName;
                    }
                }
            });
            if (firstFieldWithError) {
                setFocus(firstFieldWithError);
                errorMessage = errorData.message || errorData.errors[firstFieldWithError]?.[0] || errorMessage;
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
    }

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

    const { mutate: actualizarEvaluador, isPending: isUpdatingEvaluador } = useMutation<
        EvaluadorActualizado,
        AxiosError<BackendValidationError>,
        { ci: string; payload: ActualizarEvaluadorPayload }
    >({
        mutationFn: ({ ci, payload }) => evaluadorService.actualizarEvaluador(ci, payload),
        onSuccess: (data) => {
            onFormSubmitSuccess(data, true);
        },
        onError: handleMutationError,
    });

    const handleGestionSelect = useCallback((selectedValue: string | number | null) => {
        const id = typeof selectedValue === 'number' ? selectedValue : (selectedValue === '' ? null : (selectedValue ? parseInt(String(selectedValue), 10) : null));
        const anio = id ? gestionesPasadas.find(g => g.Id_olimpiada === id)?.gestion ?? null : null;
        setGestionPasadaSeleccionadaId(id);
        setGestionPasadaSeleccionadaAnio(anio);
    }, [gestionesPasadas]);

    const onSubmitFormularioPrincipal: SubmitHandler<EvaluadorFormData> = useCallback((formData) => {
        if (isReadOnly) return;

        if (datosPersonaVerificada && !isReadOnly) {
            if (!ciVerificado) {
                onFormSubmitError("Error: No se encontró el CI para actualizar.");
                return;
            }
            const payload: ActualizarEvaluadorPayload = {
                id_olimpiada: ID_OLIMPIADA_ACTUAL,
                areas: formData.areas,
            };
            actualizarEvaluador({ ci: ciVerificado, payload });

        } else if (!datosPersonaVerificada) {
            const payload: CrearEvaluadorPayload = {
                nombre: formData.nombres,
                apellido: formData.apellidos,
                ci: formData.ci,
                email: formData.correo,
                telefono: formData.celular,
                areas: formData.areas,
            };
            crearEvaluador(payload);
        } else {
            console.warn("Intento de guardado en estado inesperado.");
        }

    }, [isReadOnly, datosPersonaVerificada, ciVerificado, crearEvaluador, actualizarEvaluador, onFormSubmitError]);

    const resetFormularioPrincipalHook = useCallback((resetToDefault = false) => {
        setGestionPasadaSeleccionadaId(null);
        setGestionPasadaSeleccionadaAnio(null);
        if(resetToDefault) {
            resetPrincipalForm(defaultFormValues);
        }
    }, [resetPrincipalForm]);

    const isSaving = isCreatingEvaluador || isUpdatingEvaluador;

    return {
        formMethodsPrincipal,
        gestionesPasadas,
        areasDisponiblesQuery,
        isLoadingGestiones,
        isSaving,
        onSubmitFormularioPrincipal: formMethodsPrincipal.handleSubmit(onSubmitFormularioPrincipal),
        handleGestionSelect,
        gestionPasadaSeleccionadaId,
        gestionPasadaSeleccionadaAnio,
        primerInputRef,
        resetFormularioPrincipal: resetFormularioPrincipalHook,
    };
}