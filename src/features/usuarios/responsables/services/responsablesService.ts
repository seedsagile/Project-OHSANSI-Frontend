import { AxiosError } from 'axios';
import apiClient from '@/api/ApiPhp';
import {
  mapApiUsuarioToVerificacionCompleta,
  mapApiResponsableCreado,
} from '../utils/apiMappers';
import { GESTION_ACTUAL_ANIO, ID_OLIMPIADA_ACTUAL } from '../utils/constants';
import type {
  VerificacionUsuarioCompleta,
  ApiUsuarioResponse,
  //Gestion,
  CrearResponsablePayload,
  ResponsableCreado,
  Area as AreaGeneral,
  AsignarResponsablePayload,
  ResponsableAsignado,
} from '../types/index';

type Area = AreaGeneral;

type ApiErrorResponse = {
  message?: string;
  errors?: Record<string, string[]>;
};

/**
 * Verifica un CI y devuelve todos los datos de la persona, roles y gestiones.
 * @param ci Carnet de Identidad a verificar.
 * @returns Un objeto 'VerificacionUsuarioCompleta' si se encuentra (200 OK).
 * @returns 'null' si el usuario no se encuentra (404 - Escenario 1).
 */
export const verificarCI = async (
  ci: string
): Promise<VerificacionUsuarioCompleta | null> => {
  try {
    const response = await apiClient.get<{ data: ApiUsuarioResponse }>(
      `/usuarios/ci/${ci}`
    );

    const verificacionCompleta = mapApiUsuarioToVerificacionCompleta(
      response.data.data
    );
    return verificacionCompleta;
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 404) {
      return null;
    }
    console.error('Error al verificar CI:', error);
    const apiError = axiosError.response?.data as ApiErrorResponse;
    throw new Error(
      apiError?.message || axiosError.message || 'Error de red al verificar CI.'
    );
  }
};

/**
 * (OBSOLETO) Reemplazado por la lógica dentro de 'verificarCI'.
 * @deprecated La información de gestiones pasadas ahora viene de 'verificarCI'.
 */
/*export const obtenerGestionesPasadas = async (ci: string): Promise<Gestion[]> => {
  console.warn(
    'OBSOLETO: La llamada a "obtenerGestionesPasadas" ya no es necesaria y ha sido deprecada.'
  );
  return Promise.resolve([]);
};*/

/**
 * (OBSOLETO) Reemplazado por la lógica dentro de 'verificarCI'.
 * @deprecated La información de áreas pasadas ahora viene de 'verificarCI'.
 */
/*export const obtenerAreasPasadas = async (
  gestion: string,
  ci: string
): Promise<number[]> => {
  console.warn(
    'OBSOLETO: La llamada a "obtenerAreasPasadas" ya no es necesaria y ha sido deprecada.'
  );
  return Promise.resolve([]);
};
*/

/**
 * (SIN CAMBIOS)
 * Obtiene todas las áreas disponibles para la gestión actual (API 5).
 * @returns Un array de objetos Area.
 */
export const obtenerAreasActuales = async (): Promise<Area[]> => {
  try {
    const response = await apiClient.get<{
      data: Array<{ id_area: number; nombre: string }>;
    }>(`/olimpiadas/${GESTION_ACTUAL_ANIO}/areas`);

    return (
      response.data?.data?.map(
        (itemApi): Area => ({
          id_area: itemApi.id_area,
          nombre: itemApi.nombre,
          activo: 1,
          created_at: '',
          update_ad: '',
        })
      ) || []
    );
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error(`Error al obtener áreas para la gestión ${GESTION_ACTUAL_ANIO}:`, error);
    const apiError = axiosError.response?.data as ApiErrorResponse;
    throw new Error(
      apiError?.message || axiosError.message || 'Error de red al obtener áreas actuales.'
    );
  }
};

/**
 * Registra un nuevo responsable de área (POST - Escenario 1) (API 1).
 * @param payload Datos completos del nuevo responsable (personales + áreas).
 * @returns La respuesta de la API tras la creación.
 */
export const crearResponsable = async (
  payload: CrearResponsablePayload
): Promise<ResponsableCreado> => {
  const apiPayload = {
    nombre: payload.nombre,
    apellido: payload.apellido,
    ci: payload.ci,
    email: payload.email,
    telefono: payload.telefono,
    areas: payload.areas,
    password: payload.password || 'password_predeterminado',
    id_olimpiada: payload.id_olimpiada ?? ID_OLIMPIADA_ACTUAL,
  };

  try {
    console.log(
      'Enviando payload a POST /responsables (Creación - Escenario 1):',
      apiPayload
    );
    const response = await apiClient.post<any>('/responsables', apiPayload);
    const responsableCreado = mapApiResponsableCreado(response.data);
    return responsableCreado;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    console.error('Error al crear responsable (Escenario 1):', axiosError.response?.data || error);
    let errorMessage = 'No se pudo registrar al responsable.';
    if (axiosError.response?.data) {
      const apiError = axiosError.response.data;
      if (apiError.message) {
        errorMessage = apiError.message;
      } else if (apiError.errors) {
        const validationErrors = Object.values(apiError.errors)
          .flat()
          .join(' ');
        if (validationErrors) errorMessage = validationErrors;
      }
    } else if (axiosError.request) {
      errorMessage =
        'No se recibió respuesta del servidor al intentar crear el responsable.';
    } else {
      errorMessage = axiosError.message || errorMessage;
    }
    throw new Error(errorMessage);
  }
};

/**
 * @param ci El CI del usuario (para la URL).
 * @param payload Payload simplificado { id_olimpiada, areas }.
 * @returns La respuesta de la API tras la asignación.
 */
export const asignarResponsable = async (
  ci: string,
  payload: AsignarResponsablePayload
): Promise<ResponsableAsignado> => {
  
  const apiPayload = payload;

  try {
    console.log(
      `Enviando payload a POST /responsables/ci/${ci}/areas (Asignación - Escenarios 2/3):`,
      apiPayload
    );
    const response = await apiClient.post<any>(
      `/responsables/ci/${ci}/areas`,
      apiPayload
    );

    const responsableAsignado = mapApiResponsableCreado(response.data);
    return responsableAsignado;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    console.error(`Error al asignar responsable con CI ${ci} (Escenarios 2/3):`, axiosError.response?.data || error);
    let errorMessage = 'No se pudo asignar al responsable.';
    if (axiosError.response?.data) {
      const apiError = axiosError.response.data;
      if (apiError.message) {
        errorMessage = apiError.message;
      } else if (apiError.errors) {
        const validationErrors = Object.values(apiError.errors)
          .flat()
          .join(' ');
        if (validationErrors) errorMessage = validationErrors;
      }
    } else if (axiosError.request) {
      errorMessage = 'No se recibió respuesta del servidor al intentar asignar.';
    } else {
      errorMessage = axiosError.message || errorMessage;
    }
    throw new Error(errorMessage);
  }
};