import { useState, useCallback, useRef, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
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

type BackendValidationError = {
    errors?: Record<keyof ResponsableFormData | string, string[]>;
    message?: string;
};

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
    const { reset: resetPrincipalForm, setError, setFocus } = formMethodsPrincipal;

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

    const { mutate: crearResponsable, isPending: isCreatingResponsable } = useMutation<
        ResponsableCreado,
        AxiosError<BackendValidationError>,
        CrearResponsablePayload
    >({
        mutationFn: responsableService.crearResponsable,
        onSuccess: (data) => {
            onFormSubmitSuccess(data);
        },
        onError: (error) => {
            let errorMessage = 'No se pudo registrar al responsable.';
            const errorData = error.response?.data;

            if (error.response?.status === 422 && errorData?.errors) {
                let firstFieldWithError: keyof ResponsableFormData | null = null;
                Object.entries(errorData.errors).forEach(([field, messages]) => {
                    const fieldName = field as keyof ResponsableFormData;
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
        },
    });

    // Callback para cambio de gestión pasada
    const handleGestionSelect = useCallback((selectedValue: string | number | null) => {
        const id = typeof selectedValue === 'number' ? selectedValue : (selectedValue === '' ? null : (selectedValue ? parseInt(String(selectedValue), 10) : null)); // Manejar '' como null
        const anio = id ? gestionesPasadas.find(g => g.Id_olimpiada === id)?.gestion ?? null : null;
        setGestionPasadaSeleccionadaId(id);
        setGestionPasadaSeleccionadaAnio(anio);
    }, [gestionesPasadas]);

    const onSubmitFormularioPrincipal: SubmitHandler<ResponsableFormData> = useCallback((formData) => {
        if (isReadOnly) return;
        const payload: CrearResponsablePayload = {
            nombre: formData.nombres,
            apellido: formData.apellidos,
            ci: formData.ci,
            email: formData.correo,
            telefono: formData.celular,
            areas: formData.areas,
        };
        crearResponsable(payload);
    }, [crearResponsable, isReadOnly]);

    const resetFormularioPrincipalHook = useCallback((resetToDefault = false) => {
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
        handleGestionSelect,
        gestionPasadaSeleccionadaId,
        gestionPasadaSeleccionadaAnio,
        primerInputRef,
        resetFormularioPrincipal: resetFormularioPrincipalHook,
    };
}