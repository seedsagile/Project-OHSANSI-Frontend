import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import * as responsableService from '../services/responsablesService';
import { datosResponsableSchema } from '../utils/validations';
import { ID_OLIMPIADA_ACTUAL } from '../utils/constants';
import { z } from 'zod';
import type {
    Gestion,
    Area,
    DatosPersonaVerificada,
    CrearResponsablePayload,
    AsignarResponsablePayload,
    ResponsableCreado,
    ResponsableAsignado,
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
    initialAreas: number[];
    gestionesPasadas: Gestion[];
    onFormSubmitSuccess: (data: ResponsableCreado | ResponsableAsignado, esActualizacion: boolean) => void;
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
    gestionesPasadas = [],
    onFormSubmitSuccess,
    onFormSubmitError,
}: UseFormularioPrincipalProps) {
    const [gestionPasadaSeleccionadaId, setGestionPasadaSeleccionadaId] = useState<number | null>(null);
    const [gestionPasadaSeleccionadaAnio, setGestionPasadaSeleccionadaAnio] = useState<string | null>(null);
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
    const { reset: resetPrincipalForm, setError, setFocus } = formMethodsPrincipal;

    const isLoadingGestiones = false;

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

    const handleMutationError = (error: AxiosError<BackendValidationError>) => {
        let errorMessage = 'No se pudo guardar.';
        const errorData = error.response?.data;

        if (error.response?.status === 422 && errorData?.errors) {
            let firstFieldWithError: keyof ResponsableFormData | null = null;
            Object.entries(errorData.errors).forEach(([field, messages]) => {
                const fieldName = field as keyof ResponsableFormData;
                if (messages.length > 0) {
                    setError(fieldName, { type: 'backend', message: messages[0] });
                    if (!firstFieldWithError) firstFieldWithError = fieldName;
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

    const { mutate: crearResponsable, isPending: isCreatingResponsable } = useMutation<
        ResponsableCreado,
        AxiosError<BackendValidationError>,
        CrearResponsablePayload
    >({
        mutationFn: responsableService.crearResponsable,
        onSuccess: (data) => {
            onFormSubmitSuccess(data, false);
        },
        onError: handleMutationError,
    });

    const { mutate: asignarResponsable, isPending: isAsigningResponsable } = useMutation<
        ResponsableAsignado,
        AxiosError<BackendValidationError>,
        { ci: string; payload: AsignarResponsablePayload }
    >({
        mutationFn: ({ ci, payload }) => responsableService.asignarResponsable(ci, payload),
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

    const onSubmitFormularioPrincipal: SubmitHandler<ResponsableFormData> = useCallback((formData) => {
        
        if (datosPersonaVerificada) {
            if (!ciVerificado) {
                onFormSubmitError("Error: No se encontró el CI para asignar.");
                return;
            }
            const payload: AsignarResponsablePayload = {
                id_olimpiada: ID_OLIMPIADA_ACTUAL,
                areas: formData.areas,
            };
            asignarResponsable({ ci: ciVerificado, payload });

        } else {
            const payload: CrearResponsablePayload = {
                nombre: formData.nombres,
                apellido: formData.apellidos,
                ci: formData.ci,
                email: formData.correo,
                telefono: formData.celular,
                areas: formData.areas,
            };
            crearResponsable(payload);
        }

    }, [datosPersonaVerificada, ciVerificado, crearResponsable, asignarResponsable, onFormSubmitError]);

    const resetFormularioPrincipalHook = useCallback((resetToDefault = false) => {
        setGestionPasadaSeleccionadaId(null);
        setGestionPasadaSeleccionadaAnio(null);
        if(resetToDefault) {
            resetPrincipalForm(defaultFormValues);
        }
    }, [resetPrincipalForm]);

    const isSaving = isCreatingResponsable || isAsigningResponsable;

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