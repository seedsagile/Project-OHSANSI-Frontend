// src/features/usuarios/responsables/services/responsablesService.ts
import { AxiosError } from 'axios';
import apiClient from '@/api/ApiPhp';
// --- Importar mappers ---
import {
    mapApiUserDataToPersonaVerificada,
    mapApiGestionToGestion,
    mapApiResponsableCreado
} from '../utils/apiMappers';
// --- Importar constantes ---
import { GESTION_ACTUAL_ANIO, ID_OLIMPIADA_ACTUAL } from '../utils/constants';
import type {
  DatosPersonaVerificada,
  Gestion,
  CrearResponsablePayload,
  ResponsableCreado,
  AreaPasadaResponse,
  Area as AreaGeneral, // Renombrar para evitar conflicto con tipo local
} from '../types/index';

type Area = AreaGeneral; // Alias local

// Tipo para errores de API (sin cambios)
type ApiErrorResponse = {
  message?: string;
  errors?: Record<string, string[]>;
};

/**
 * Verifica CI usando el servicio y mapea la respuesta.
 */
export const verificarCI = async (ci: string): Promise<DatosPersonaVerificada | null> => {
  try {
    // La API devuelve { data: ApiUserResponse } según el mapper
    const response = await apiClient.get<{ data: any }>(`/usuarios/ci/${ci}`);

    // --- Usa el mapper ---
    const personaVerificada = mapApiUserDataToPersonaVerificada(response.data?.data);
    return personaVerificada;

  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 404) {
      return null; // No encontrado, devuelve null
    }
    // Manejo de otros errores
    console.error('Error al verificar CI:', error);
    const apiError = axiosError.response?.data as ApiErrorResponse;
    throw new Error(apiError?.message || axiosError.message || 'Error de red al verificar CI.');
  }
};

/**
 * Obtiene gestiones pasadas usando el servicio y mapea la respuesta.
 */
export const obtenerGestionesPasadas = async (ci: string): Promise<Gestion[]> => {
  if (!ci) return []; // Si no hay CI, no buscar
  try {
    // La API devuelve ApiGestionResponse[] directamente
    const response = await apiClient.get<any[]>(`/responsables/ci/${ci}/gestiones`);

    // --- Usa el mapper ---
    const gestiones = mapApiGestionToGestion(response.data);
    return gestiones;

  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 404) {
      return []; // No encontrado, devuelve vacío
    }
    console.error(`Error al obtener gestiones pasadas para CI ${ci}:`, error);
    const apiError = axiosError.response?.data as ApiErrorResponse;
    throw new Error(apiError?.message || axiosError.message || 'Error de red al obtener gestiones.');
  }
};

/**
 * Obtiene IDs de áreas de una gestión pasada.
 */
export const obtenerAreasPasadas = async (gestion: string, ci: string): Promise<number[]> => {
  if (!gestion || !ci) return [];
  try {
    // La API devuelve AreaPasadaResponse[] O {message: string, data: []}
    const response = await apiClient.get<AreaPasadaResponse[] | { message: string, data: [] }>(
      `/responsables/ci/${ci}/gestion/${gestion}/areas`
    );

    // --- CORRECCIÓN: Verificar si la respuesta es el array directamente o está dentro de 'data' ---
    const responseData = response.data;
    // Accede a 'data' si es un objeto con 'data', si no, usa la respuesta directamente (si es array)
    const areasData = Array.isArray(responseData) ? responseData : responseData?.data;

    // Asegurarse de que tenemos un array antes de mapear
    if (!Array.isArray(areasData)) {
        console.warn(`Respuesta inesperada para áreas pasadas (gestión ${gestion}, CI ${ci}):`, responseData);
        return []; // Devuelve vacío si no es un array
    }

    // Mapea la respuesta para extraer solo los IDs de área válidos
    return areasData
            .map(item => item?.Area?.Id_area) // Extrae Id_area (puede ser undefined si Area no existe)
            .filter((id): id is number => typeof id === 'number'); // Filtra nulos/undefined y asegura que sean números

  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 404) {
      // Si la API devuelve 404 (esperado si no hay datos), retornar array vacío.
      return [];
    }
    // Para otros errores, loguear y lanzar
    console.error(`Error al obtener áreas pasadas para gestión ${gestion} y CI ${ci}:`, error);
    const apiError = axiosError.response?.data as ApiErrorResponse;
    throw new Error(apiError?.message || axiosError.message || 'Error de red al obtener áreas pasadas.');
  }
};


/**
 * Obtiene las áreas disponibles para la gestión actual.
 */
export const obtenerAreasActuales = async (): Promise<Area[]> => {
  try {
    // La API devuelve { data: Array<{ id_area: number; nombre: string }> }
    const response = await apiClient.get<{ data: Array<{ id_area: number; nombre: string }> }>(
      `/olimpiadas/${GESTION_ACTUAL_ANIO}/areas`
    );
    // Mapea la respuesta al tipo `Area` del frontend
    return response.data?.data?.map((itemApi): Area => ({
      id_area: itemApi.id_area,
      nombre: itemApi.nombre,
      // Añade propiedades faltantes con valores por defecto si es necesario para el tipo Area
      activo: 1, // Asumiendo que las áreas obtenidas están activas por defecto
      created_at: '', // Puedes poner un valor por defecto o ajustar el tipo Area
      update_ad: '', // Puedes poner un valor por defecto o ajustar el tipo Area
      // descripcion: '', // Si el tipo Area lo requiere
    })) || []; // Devuelve array vacío si no hay datos

  } catch (error) {
    const axiosError = error as AxiosError;
    console.error(`Error al obtener áreas para la gestión ${GESTION_ACTUAL_ANIO}:`, error);
    const apiError = axiosError.response?.data as ApiErrorResponse;
    throw new Error(apiError?.message || axiosError.message || 'Error de red al obtener áreas actuales.');
  }
};

/**
 * Crea un responsable usando el servicio y mapea la respuesta.
 */
export const crearResponsable = async (
  payload: CrearResponsablePayload
): Promise<ResponsableCreado> => {
  // Prepara el payload para la API
  // La generación de contraseña y el id_olimpiada se manejan aquí ahora
  const apiPayload = {
    nombre: payload.nombre,
    apellido: payload.apellido,
    ci: payload.ci,
    email: payload.email,
    telefono: payload.telefono,
    areas: payload.areas,
    // Asegúrate que la generación de contraseña y el ID sean correctos según tu backend
    password: payload.password || 'password_predeterminado', // O usa la función generatePassword si la importas
    id_olimpiada: payload.id_olimpiada ?? ID_OLIMPIADA_ACTUAL,
  };

  try {
    console.log("Enviando payload a POST /responsables:", apiPayload);
    // La API devuelve ApiResponsableCreadoResponse (definido en apiMappers o types)
    const response = await apiClient.post<any>('/responsables', apiPayload);

    // --- Usa el mapper ---
    const responsableCreado = mapApiResponsableCreado(response.data);
    return responsableCreado;

  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    console.error('Error al crear responsable:', axiosError.response?.data || error); // Log más detallado
    let errorMessage = 'No se pudo registrar al responsable.';

        // Lógica de manejo de errores (sin cambios respecto a la versión anterior)
        if (axiosError.response?.data) {
            const apiError = axiosError.response.data;
            if (apiError.message) {
                errorMessage = apiError.message;
            } else if (apiError.errors) {
                // Intenta concatenar errores de validación si existen
                const validationErrors = Object.values(apiError.errors).flat().join(' ');
                if (validationErrors) errorMessage = validationErrors;
            }
        } else if (axiosError.request) {
            errorMessage = 'No se recibió respuesta del servidor al intentar crear el responsable.';
        } else {
            errorMessage = axiosError.message || errorMessage;
        }
    // Lanza el error con el mensaje procesado
    throw new Error(errorMessage);
  }
};