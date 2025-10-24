// src/features/usuarios/responsables/services/responsablesService.ts
import { AxiosError } from 'axios';
import apiClient from '@/api/ApiPhp'; // Usa el alias configurado
// Asegúrate que la ruta al archivo de tipos sea correcta (debería ser index.ts)
import type {
  DatosPersonaVerificada,
  Gestion,
  CrearResponsablePayload,
  ResponsableCreado,
} from '../types/index';

// Tipo genérico para errores de API con posible campo 'message' o 'errors'
type ApiErrorResponse = {
  message?: string;
  errors?: Record<string, string[]>; // Para errores de validación del backend
};

/**
 * Verifica si existe una persona registrada con el CI proporcionado.
 * @param ci - Carnet de Identidad a verificar.
 * @returns Los datos de la persona si existe, o null si no existe.
 * @throws Error si ocurre un problema de red o un error inesperado del servidor.
 */
export const verificarCI = async (ci: string): Promise<DatosPersonaVerificada | null> => {
  try {
    // *** AJUSTA ESTE ENDPOINT *** Ejemplo: '/v1/personas/ci/{ci}'
    const response = await apiClient.get<DatosPersonaVerificada>(`/v1/personas/ci/${ci}`);
    // Asumimos que la API devuelve los datos directamente si la persona existe
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 404) {
      // Si la API devuelve 404 cuando la persona no existe, retornamos null
      return null;
    }
    // Para otros errores (red, servidor 500, etc.), lanzamos el error
    console.error('Error al verificar CI:', error);
    const apiError = axiosError.response?.data as ApiErrorResponse;
    // Prioriza mensaje de API, luego mensaje Axios, luego mensaje genérico
    throw new Error(apiError?.message || axiosError.message || 'Error de red al verificar CI.');
  }
};

/**
 * Obtiene la lista de gestiones pasadas disponibles para seleccionar.
 * @returns Un array de objetos Gestion.
 * @throws Error si ocurre un problema al obtener las gestiones.
 */
export const obtenerGestionesPasadas = async (): Promise<Gestion[]> => {
  try {
    // *** AJUSTA ESTE ENDPOINT *** Ejemplo: '/v1/gestiones?tipo=pasada'
    // Asumimos que la respuesta tiene una estructura como { data: Gestion[] }
    const response = await apiClient.get<{ data: Gestion[] }>('/v1/gestiones/pasadas');
    return response.data.data || []; // Devuelve el array de gestiones o uno vacío si no hay data
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Error al obtener gestiones pasadas:', error);
    const apiError = axiosError.response?.data as ApiErrorResponse;
    throw new Error(
      apiError?.message || axiosError.message || 'Error de red al obtener gestiones pasadas.'
    );
  }
};

/**
 * Envía los datos para crear un nuevo responsable de área.
 * @param payload - Datos del responsable a crear (tipo CrearResponsablePayload).
 * @returns Los datos del responsable creado (tipo ResponsableCreado).
 * @throws Error si ocurre un problema durante la creación.
 */
export const crearResponsable = async (
  payload: CrearResponsablePayload
): Promise<ResponsableCreado> => {
  try {
    // *** AJUSTA ESTE ENDPOINT *** Ejemplo: '/v1/responsables' o '/v1/responsableArea'
    const response = await apiClient.post<ResponsableCreado>('/v1/responsableArea', payload);
    return response.data; // Devuelve la respuesta completa de la API
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    console.error('Error al crear responsable:', error);

    let errorMessage = 'No se pudo registrar al responsable.';
    if (axiosError.response?.data) {
      const apiError = axiosError.response.data;
      // Priorizar mensaje general si existe
      if (apiError.message) {
        errorMessage = apiError.message;
      } else if (apiError.errors) {
        // Si no hay mensaje general, tomar el primer error de validación
        const firstErrorKey = Object.keys(apiError.errors)[0];
        if (firstErrorKey && apiError.errors[firstErrorKey]?.[0]) {
           errorMessage = apiError.errors[firstErrorKey][0];
        }
      }
    } else if (axiosError.request) {
      errorMessage = 'No se recibió respuesta del servidor al intentar crear el responsable.';
    } else {
      errorMessage = axiosError.message || errorMessage;
    }
    throw new Error(errorMessage);
  }
};

/**
 * Obtiene la lista completa de responsables (si es necesaria para validación de duplicados u otra pantalla).
 * @returns Un array con los datos de los responsables. Define un tipo específico si usas esto.
 * @throws Error si ocurre un problema al obtener la lista.
 */
export const obtenerResponsables = async (): Promise<any[]> => {
  // TODO: Define una interfaz para la lista de responsables si usas esta función (ej: ResponsableListItem[])
  try {
    // *** AJUSTA ESTE ENDPOINT *** Ejemplo: '/v1/responsables' o '/v1/responsableArea'
    const response = await apiClient.get<{ data: any[] }>('/v1/responsableArea');
    return response.data.data || [];
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Error al obtener responsables:', error);
    const apiError = axiosError.response?.data as ApiErrorResponse;
    throw new Error(
      apiError?.message || axiosError.message || 'Error de red al obtener responsables.'
    );
  }
};