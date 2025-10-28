import { useState, useCallback, useRef, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import * as responsableService from '../services/responsablesService';
import { datosResponsableSchema } from '../utils/validations';
import { ID_OLIMPIADA_ACTUAL } from '../utils/constants'; // Asegúrate que ID_OLIMPIADA_ACTUAL esté exportada
import type {
    Gestion,
    Area,
    DatosPersonaVerificada,
    CrearResponsablePayload,
    ActualizarResponsablePayload, // <--- Añadir tipo PUT Payload
    ResponsableCreado,
    ResponsableActualizado, // <--- Añadir tipo PUT Response
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
    onFormSubmitSuccess: (data: ResponsableCreado | ResponsableActualizado, esActualizacion: boolean) => void; // Modificado para indicar si fue PUT
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

    // --- Queries (sin cambios) ---
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

    // --- useEffect para resetear (sin cambios) ---
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
                // Escenario 2: Usuario existente pero NO read-only
                resetPrincipalForm({
                    nombres: datosPersonaVerificada.Nombres || '',
                    apellidos: datosPersonaVerificada.Apellidos || '',
                    celular: datosPersonaVerificada.Teléfono || '',
                    correo: datosPersonaVerificada.Correo || '',
                    ci: ciVerificado ?? '',
                    areas: [], // Las áreas se cargarán si selecciona gestión pasada
                });
                setGestionPasadaSeleccionadaId(null);
                setGestionPasadaSeleccionadaAnio(null);
                 // No enfocar aquí, los campos están deshabilitados
            } else if (ciVerificado) {
                // Escenario 1: Usuario nuevo
                resetPrincipalForm(resetValuesBase);
                setGestionPasadaSeleccionadaId(null);
                setGestionPasadaSeleccionadaAnio(null);
                setTimeout(() => primerInputRef.current?.focus(), 100);
            } else {
                 // Estado inicial sin CI verificado
                resetPrincipalForm(defaultFormValues);
                setGestionPasadaSeleccionadaId(null);
                setGestionPasadaSeleccionadaAnio(null);
            }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ciVerificado, datosPersonaVerificada, isReadOnly, initialAreas, resetPrincipalForm]); // Mantener deps originales si funcionan


    // --- Función genérica para manejo de errores de mutación ---
    const handleMutationError = (error: AxiosError<BackendValidationError>) => {
        let errorMessage = 'No se pudo guardar.';
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
    }

    // --- Mutación POST (Crear) ---
    const { mutate: crearResponsable, isPending: isCreatingResponsable } = useMutation<
        ResponsableCreado,
        AxiosError<BackendValidationError>,
        CrearResponsablePayload
    >({
        mutationFn: responsableService.crearResponsable,
        onSuccess: (data) => {
            onFormSubmitSuccess(data, false); // false indica que no fue actualización
        },
        onError: handleMutationError,
    });

    // --- Mutación PUT (Actualizar) --- NUEVA ---
    const { mutate: actualizarResponsable, isPending: isUpdatingResponsable } = useMutation<
        ResponsableActualizado,
        AxiosError<BackendValidationError>,
        { ci: string; payload: ActualizarResponsablePayload } // Ajustar tipo de variables
    >({
        // Usar mutationFn que acepte un objeto con 'ci' y 'payload'
        mutationFn: ({ ci, payload }) => responsableService.actualizarResponsable(ci, payload),
        onSuccess: (data) => {
            onFormSubmitSuccess(data, true); // true indica que fue actualización
        },
        onError: handleMutationError,
    });


    // --- Callback para cambio de gestión pasada (sin cambios) ---
    const handleGestionSelect = useCallback((selectedValue: string | number | null) => {
        const id = typeof selectedValue === 'number' ? selectedValue : (selectedValue === '' ? null : (selectedValue ? parseInt(String(selectedValue), 10) : null));
        const anio = id ? gestionesPasadas.find(g => g.Id_olimpiada === id)?.gestion ?? null : null;
        setGestionPasadaSeleccionadaId(id);
        setGestionPasadaSeleccionadaAnio(anio);
    }, [gestionesPasadas]);


    // --- Handler onSubmit MODIFICADO ---
    const onSubmitFormularioPrincipal: SubmitHandler<ResponsableFormData> = useCallback((formData) => {
        if (isReadOnly) return;

        // Decidir si es CREAR (POST) o ACTUALIZAR (PUT)
        if (datosPersonaVerificada && !isReadOnly) {
            // Escenario 2: Usuario existente, NO read-only -> PUT
            if (!ciVerificado) {
                onFormSubmitError("Error: No se encontró el CI para actualizar.");
                return;
            }
            const payload: ActualizarResponsablePayload = {
                id_olimpiada: ID_OLIMPIADA_ACTUAL, // Usar constante
                areas: formData.areas,
            };
            actualizarResponsable({ ci: ciVerificado, payload });

        } else if (!datosPersonaVerificada) {
            // Escenario 1: Usuario nuevo -> POST
            const payload: CrearResponsablePayload = {
                nombre: formData.nombres,
                apellido: formData.apellidos,
                ci: formData.ci,
                email: formData.correo,
                telefono: formData.celular,
                areas: formData.areas,
                 // id_olimpiada y password usarán defaults del servicio
            };
            crearResponsable(payload);
        } else {
             // Caso inesperado o ReadOnly (ya cubierto por isReadOnly)
             console.warn("Intento de guardado en estado inesperado.");
        }

    }, [isReadOnly, datosPersonaVerificada, ciVerificado, crearResponsable, actualizarResponsable, onFormSubmitError]);


    // --- Reset Hook (sin cambios) ---
    const resetFormularioPrincipalHook = useCallback((resetToDefault = false) => {
        setGestionPasadaSeleccionadaId(null);
        setGestionPasadaSeleccionadaAnio(null);
        if(resetToDefault) {
            resetPrincipalForm(defaultFormValues);
        }
    }, [resetPrincipalForm]);

    // Indicar si alguna mutación está en progreso
    const isSaving = isCreatingResponsable || isUpdatingResponsable;

    return {
        formMethodsPrincipal,
        gestionesPasadas,
        areasDisponiblesQuery,
        isLoadingGestiones,
        isSaving, // <--- Usar este estado combinado
        onSubmitFormularioPrincipal: formMethodsPrincipal.handleSubmit(onSubmitFormularioPrincipal),
        handleGestionSelect,
        gestionPasadaSeleccionadaId,
        gestionPasadaSeleccionadaAnio,
        primerInputRef,
        resetFormularioPrincipal: resetFormularioPrincipalHook,
    };
}