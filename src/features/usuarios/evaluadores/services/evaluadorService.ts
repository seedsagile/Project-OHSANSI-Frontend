import { AxiosError } from 'axios';
import apiClient from '@/api/ApiPhp';
import {
    mapApiUserDataToPersonaVerificada,
    mapApiGestionToGestion,
    mapApiEvaluadorCreado 
} from '../utils/apiMappers';
import { GESTION_ACTUAL_ANIO, ID_OLIMPIADA_ACTUAL } from '../utils/constants';
import type {
  DatosPersonaVerificada,
  Gestion,
  CrearEvaluadorPayload,
  EvaluadorCreado, //
  AreaPasadaResponse, //
  Area as AreaGeneral,
  ActualizarEvaluadorPayload, //
  EvaluadorActualizado //
} from '../types/index'; //

// Define el tipo Area localmente si es necesario, o usa el importado
type Area = AreaGeneral;

// Tipo para la respuesta de error de la API
type ApiErrorResponse = {
  message?: string;
  errors?: Record<string, string[]>; // Para errores de validación
};

/**
 * Verifica si un CI ya existe en el sistema.
 * @param ci Carnet de Identidad a verificar.
 * @returns Los datos de la persona si existe, o null si no existe (404). Lanza error en otros casos.
 */
export const verificarCI = async (ci: string): Promise<DatosPersonaVerificada | null> => { //
  try {
    // Llama al endpoint GET para verificar el CI
    const response = await apiClient.get<{ data: any }>(`/usuarios/ci/${ci}`); //

    // Mapea la respuesta de la API a la estructura de datos del frontend
    const personaVerificada = mapApiUserDataToPersonaVerificada(response.data?.data); //
    return personaVerificada;

  } catch (error) {
    const axiosError = error as AxiosError;
    // Si la API devuelve 404, significa que el CI no existe, devolvemos null
    if (axiosError.response?.status === 404) {
      return null;
    }
    // Para otros errores, loguea y lanza un error más descriptivo
    console.error('Error al verificar CI:', error);
    const apiError = axiosError.response?.data as ApiErrorResponse;
    throw new Error(apiError?.message || axiosError.message || 'Error de red al verificar CI.');
  }
};

/**
 * Obtiene las gestiones pasadas en las que participó un Evaluador.
 * @param ci Carnet de Identidad del Evaluador.
 * @returns Un array de objetos Gestion. Devuelve array vacío si no hay datos o el CI es inválido.
 */
export const obtenerGestionesPasadas = async (ci: string): Promise<Gestion[]> => { //
  if (!ci) return []; // No hacer la llamada si no hay CI
  try {
    // Llama al endpoint GET para obtener las gestiones
    const response = await apiClient.get<any[]>(`/evaluadores/ci/${ci}/gestiones`); //

    // Mapea la respuesta de la API
    const gestiones = mapApiGestionToGestion(response.data); //
    return gestiones;

  } catch (error) {
    const axiosError = error as AxiosError;
    // Si es 404, significa que no tiene gestiones pasadas
    if (axiosError.response?.status === 404) {
      return [];
    }
    console.error(`Error al obtener gestiones pasadas para CI ${ci}:`, error);
    const apiError = axiosError.response?.data as ApiErrorResponse;
    throw new Error(apiError?.message || axiosError.message || 'Error de red al obtener gestiones.');
  }
};

/**
 * Obtiene los IDs de las áreas asignadas a un Evaluador en una gestión específica.
 * @param gestion Año de la gestión (ej: "2024").
 * @param ci Carnet de Identidad del Evaluador.
 * @returns Un array de IDs numéricos de las áreas. Devuelve array vacío si no hay datos o los parámetros son inválidos.
 */
export const obtenerAreasPasadas = async (gestion: string, ci: string): Promise<number[]> => { //
  if (!gestion || !ci) return []; // No hacer la llamada si faltan parámetros
  try {
    // Llama al endpoint GET para obtener las áreas de una gestión
    const response = await apiClient.get<AreaPasadaResponse[] | { message: string, data: [] }>( //
      `/evaludores/ci/${ci}/gestion/${gestion}/areas`
    ); //
    const responseData = response.data;
    // Maneja respuestas donde 'data' es un array o está anidado
    const areasData = Array.isArray(responseData) ? responseData : responseData?.data;

    // Verifica que areasData sea realmente un array antes de mapear
    if (!Array.isArray(areasData)) {
        console.warn(`Respuesta inesperada para áreas pasadas (gestión ${gestion}, CI ${ci}):`, responseData);
        return [];
    }

    // Extrae y filtra solo los IDs numéricos válidos de las áreas
    return areasData
            .map(item => item?.Area?.Id_area) // Obtiene el ID del área
            .filter((id): id is number => typeof id === 'number'); // Asegura que solo sean números

  } catch (error) {
    const axiosError = error as AxiosError;
    // Si es 404, no hay áreas asignadas para esa gestión/CI
    if (axiosError.response?.status === 404) {
      return [];
    }
    console.error(`Error al obtener áreas pasadas para gestión ${gestion} y CI ${ci}:`, error);
    const apiError = axiosError.response?.data as ApiErrorResponse;
    throw new Error(apiError?.message || axiosError.message || 'Error de red al obtener áreas pasadas.');
  }
};

/**
 * Obtiene todas las áreas disponibles para la gestión actual.
 * @returns Un array de objetos Area.
 */
export const obtenerAreasActuales = async (): Promise<Area[]> => { //
  try {
    // Llama al endpoint GET usando la constante del año actual
    const response = await apiClient.get<{ data: Array<{ id_area: number; nombre: string }> }>(
      `/olimpiadas/${GESTION_ACTUAL_ANIO}/areas` //
    ); //
    // Mapea la respuesta de la API a la interfaz Area del frontend
    return response.data?.data?.map((itemApi): Area => ({
      id_area: itemApi.id_area,
      nombre: itemApi.nombre,
      // Añade valores por defecto para propiedades que podrían faltar en la API
      activo: 1, // Asume activo por defecto
      created_at: '', // Valor por defecto o null
      update_ad: '', // Valor por defecto o null
    })) || []; // Devuelve array vacío si no hay datos

  } catch (error) {
    const axiosError = error as AxiosError;
    console.error(`Error al obtener áreas para la gestión ${GESTION_ACTUAL_ANIO}:`, error); //
    const apiError = axiosError.response?.data as ApiErrorResponse;
    throw new Error(apiError?.message || axiosError.message || 'Error de red al obtener áreas actuales.');
  }
};

/**
 * Registra un nuevo Evaluador de área (POST).
 * @param payload Datos del nuevo Evaluador.
 * @returns La respuesta de la API tras la creación.
 */
export const crearEvaluador = async ( //
  payload: CrearEvaluadorPayload //
): Promise<EvaluadorCreado> => { //
  // Construye el objeto a enviar a la API
  const apiPayload = {
    nombre: payload.nombre,
    apellido: payload.apellido,
    ci: payload.ci,
    email: payload.email,
    telefono: payload.telefono,
    areas: payload.areas,
    // La contraseña podría ser generada por el backend, aquí se envía una por defecto si no viene
    password: payload.password || 'password_predeterminado',
    // Usa el ID de olimpiada actual por defecto si no se especifica
    id_olimpiada: payload.id_olimpiada ?? ID_OLIMPIADA_ACTUAL, //
  };

  try {
    console.log("Enviando payload a POST /evaluadores:", apiPayload);
    // Llama al endpoint POST
    const response = await apiClient.post<any>('/evaluadores', apiPayload); //

    // Mapea la respuesta
    const evaluadorCreado = mapApiEvaluadorCreado(response.data); //
    return evaluadorCreado;

  } catch (error) {
    // Manejo de errores detallado
    const axiosError = error as AxiosError<ApiErrorResponse>;
    console.error('Error al crear evaluador:', axiosError.response?.data || error);
    let errorMessage = 'No se pudo registrar al evaluador.';

    if (axiosError.response?.data) {
        const apiError = axiosError.response.data;
        if (apiError.message) {
            errorMessage = apiError.message;
        } else if (apiError.errors) {
            // Concatena errores de validación si existen
            const validationErrors = Object.values(apiError.errors).flat().join(' ');
            if (validationErrors) errorMessage = validationErrors;
        }
    } else if (axiosError.request) { // Error de red o sin respuesta
        errorMessage = 'No se recibió respuesta del servidor al intentar crear el Evaluador.';
    } else { // Otro tipo de error (configuración, etc.)
        errorMessage = axiosError.message || errorMessage;
    }
    // Lanza un nuevo error con el mensaje procesado
    throw new Error(errorMessage);
  }
};

/**
 * Actualiza las áreas asignadas a un Evaluador existente (PUT).
 * @param ci Carnet de Identidad del Evaluador a actualizar (usado en la URL).
 * @param payload Objeto que contiene id_olimpiada y la lista de areas.
 * @returns La respuesta de la API tras la actualización.
 */
export const actualizarEvaluador = async ( //
  ci: string, // CI va en la URL
  payload: ActualizarEvaluadorPayload // Payload simplificado { id_olimpiada, areas }
): Promise<EvaluadorActualizado> => { //

  // El payload ya tiene la estructura { id_olimpiada, areas }
  const apiPayload = payload;

  try {
    console.log(`Enviando payload a PUT /evaluadores/ci/${ci}:`, apiPayload);
    // Llama al endpoint PUT usando el CI en la URL
    const response = await apiClient.put<any>(`/evaluadores/ci/${ci}`, apiPayload); //

    // Asume respuesta similar a POST para el mensaje, usa el mismo mapper
    // Si la respuesta PUT fuera distinta, se necesitaría un mapApiEvaluadorActualizado
    const evaluadorActualizado = mapApiEvaluadorCreado(response.data); //
    return evaluadorActualizado;

  } catch (error) {
    // Manejo de errores similar a crearEvaluador
    const axiosError = error as AxiosError<ApiErrorResponse>;
    console.error(`Error al actualizar evaluador con CI ${ci}:`, axiosError.response?.data || error);
    let errorMessage = 'No se pudo actualizar al evaluador.';

    if (axiosError.response?.data) {
        const apiError = axiosError.response.data;
        if (apiError.message) {
            errorMessage = apiError.message;
        } else if (apiError.errors) {
            // Podría haber errores si, por ejemplo, un ID de área no existe
            const validationErrors = Object.values(apiError.errors).flat().join(' ');
            if (validationErrors) errorMessage = validationErrors;
        }
    } else if (axiosError.request) {
        errorMessage = 'No se recibió respuesta del servidor al intentar actualizar.';
    } else {
        errorMessage = axiosError.message || errorMessage;
    }
    throw new Error(errorMessage);
  }
};