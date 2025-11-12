import { AxiosError } from 'axios';
import apiClient from '@/api/ApiPhp';
import {
  mapApiUsuarioToVerificacionCompleta,
  mapApiResponsableCreado,
} from '../utils/apiMappers';
import { GESTION_ACTUAL_ANIO, ID_OLIMPIADA_ACTUAL } from '../utils/constants';
import { generarPasswordUnica } from '../utils/security';
import type {
  VerificacionUsuarioCompleta,
  ApiUsuarioResponse,
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

// --- TIPO PARA LA NUEVA API ---
type ApiResponseAreasOcupadas = {
  message: string;
  data: Area[];
};

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
    const axiosError = error as AxiosError<ApiErrorResponse>;
    if (axiosError.response?.status === 404) {
      return null;
    }
    console.error('Error al verificar CI:', error);
    const apiError = axiosError.response?.data;
    let errorMessage: string;
    if (!axiosError.response) {
      errorMessage = '';
    } else {
      errorMessage =
        apiError?.message ||
        axiosError.message ||
        'Error inesperado del servidor.';
    }
    throw new Error(errorMessage);
  }
};

// --- FUNCIÓN AÑADIDA ---
/**
 * Obtiene las áreas que YA TIENEN un responsable asignado
 * en la gestión actual.
 */
export const obtenerAreasOcupadasActuales = async (): Promise<Area[]> => {
  try {
    const response = await apiClient.get<ApiResponseAreasOcupadas>(
      `/responsables/areas/ocupadas/gestion/actual`
    );
    // Devolvemos solo el array de áreas
    return response.data?.data || [];
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    console.error(`Error al obtener áreas ocupadas:`, error);
    const apiError = axiosError.response?.data;
    throw new Error(
      apiError?.message ||
        axiosError.message ||
        'Error de red al obtener áreas ocupadas.'
    );
  }
};
// --- FIN DE FUNCIÓN AÑADIDA ---

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
    const axiosError = error as AxiosError<ApiErrorResponse>;
    console.error(
      `Error al obtener áreas para la gestión ${GESTION_ACTUAL_ANIO}:`,
      error
    );
    const apiError = axiosError.response?.data;
    throw new Error(
      apiError?.message ||
        axiosError.message ||
        'Error de red al obtener áreas actuales.'
    );
  }
};

/**
 * Registra un nuevo responsable de área (POST - Escenario 1) (API 1).
 * @param payload Datos completos del nuevo responsable (personales + áreas).
 * @returns La respuesta de la API tras la creación.
 * @throws {AxiosError} Si la API devuelve un error (409, 422, 500, etc.).
 */
export const crearResponsable = async (
  payload: CrearResponsablePayload
): Promise<ResponsableCreado> => {
  const passwordSegura =
    payload.password ||
    generarPasswordUnica({
      length: 12,
      useLowercase: true,
      useUppercase: true,
      useNumbers: true,
      useSymbols: true,
    });

  const apiPayload = {
    nombre: payload.nombre,
    apellido: payload.apellido,
    ci: payload.ci,
    email: payload.email,
    telefono: payload.telefono,
    areas: payload.areas,
    password: passwordSegura,
    id_olimpiada: payload.id_olimpiada ?? ID_OLIMPIADA_ACTUAL,
    force_create_role: payload.force_create_role ?? false,
  };

  console.log(
    'Enviando payload a POST /responsables (Creación - Escenario 1):',
    apiPayload
  );

  const response = await apiClient.post<any>('/responsables', apiPayload);
  return mapApiResponsableCreado(response.data);
};

export const asignarResponsable = async (
  ci: string,
  payload: AsignarResponsablePayload
): Promise<ResponsableAsignado> => {
  const apiPayload = payload;

  console.log(
    `Enviando payload a POST /responsables/ci/${ci}/areas (Asignación - Escenarios 2/3):`,
    apiPayload
  );

  const response = await apiClient.post<any>(
    `/responsables/ci/${ci}/areas`,
    apiPayload
  );

  return mapApiResponsableCreado(response.data);
};