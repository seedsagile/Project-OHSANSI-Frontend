import { AxiosError } from 'axios';
import apiClient from '@/api/ApiPhp';
import {
    mapApiUserDataToPersonaVerificada,
    mapApiGestionToGestion,
    mapApiResponsableCreado
} from '../utils/apiMappers';
import { GESTION_ACTUAL_ANIO, ID_OLIMPIADA_ACTUAL } from '../utils/constants';
import type {
  DatosPersonaVerificada,
  Gestion,
  CrearResponsablePayload,
  ResponsableCreado,
  AreaPasadaResponse,
  Area as AreaGeneral,
} from '../types/index';

type Area = AreaGeneral;

type ApiErrorResponse = {
  message?: string;
  errors?: Record<string, string[]>;
};

export const verificarCI = async (ci: string): Promise<DatosPersonaVerificada | null> => {
  try {
    const response = await apiClient.get<{ data: any }>(`/usuarios/ci/${ci}`);

    const personaVerificada = mapApiUserDataToPersonaVerificada(response.data?.data);
    return personaVerificada;

  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 404) {
      return null;
    }
    console.error('Error al verificar CI:', error);
    const apiError = axiosError.response?.data as ApiErrorResponse;
    throw new Error(apiError?.message || axiosError.message || 'Error de red al verificar CI.');
  }
};

export const obtenerGestionesPasadas = async (ci: string): Promise<Gestion[]> => {
  if (!ci) return [];
  try {
    const response = await apiClient.get<any[]>(`/responsables/ci/${ci}/gestiones`);

    const gestiones = mapApiGestionToGestion(response.data);
    return gestiones;

  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 404) {
      return [];
    }
    console.error(`Error al obtener gestiones pasadas para CI ${ci}:`, error);
    const apiError = axiosError.response?.data as ApiErrorResponse;
    throw new Error(apiError?.message || axiosError.message || 'Error de red al obtener gestiones.');
  }
};

export const obtenerAreasPasadas = async (gestion: string, ci: string): Promise<number[]> => {
  if (!gestion || !ci) return [];
  try {
    const response = await apiClient.get<AreaPasadaResponse[] | { message: string, data: [] }>(
      `/responsables/ci/${ci}/gestion/${gestion}/areas`
    );
    const responseData = response.data;
    const areasData = Array.isArray(responseData) ? responseData : responseData?.data;

    if (!Array.isArray(areasData)) {
        console.warn(`Respuesta inesperada para áreas pasadas (gestión ${gestion}, CI ${ci}):`, responseData);
        return [];
    }

    return areasData
            .map(item => item?.Area?.Id_area) 
            .filter((id): id is number => typeof id === 'number');

  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 404) {
      return [];
    }
    console.error(`Error al obtener áreas pasadas para gestión ${gestion} y CI ${ci}:`, error);
    const apiError = axiosError.response?.data as ApiErrorResponse;
    throw new Error(apiError?.message || axiosError.message || 'Error de red al obtener áreas pasadas.');
  }
};

export const obtenerAreasActuales = async (): Promise<Area[]> => {
  try {
    const response = await apiClient.get<{ data: Array<{ id_area: number; nombre: string }> }>(
      `/olimpiadas/${GESTION_ACTUAL_ANIO}/areas`
    );
    return response.data?.data?.map((itemApi): Area => ({
      id_area: itemApi.id_area,
      nombre: itemApi.nombre,
      activo: 1,
      created_at: '',
      update_ad: '',
    })) || [];

  } catch (error) {
    const axiosError = error as AxiosError;
    console.error(`Error al obtener áreas para la gestión ${GESTION_ACTUAL_ANIO}:`, error);
    const apiError = axiosError.response?.data as ApiErrorResponse;
    throw new Error(apiError?.message || axiosError.message || 'Error de red al obtener áreas actuales.');
  }
};

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
    console.log("Enviando payload a POST /responsables:", apiPayload);
    const response = await apiClient.post<any>('/responsables', apiPayload);

    const responsableCreado = mapApiResponsableCreado(response.data);
    return responsableCreado;

  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    console.error('Error al crear responsable:', axiosError.response?.data || error);
    let errorMessage = 'No se pudo registrar al responsable.';

        if (axiosError.response?.data) {
            const apiError = axiosError.response.data;
            if (apiError.message) {
                errorMessage = apiError.message;
            } else if (apiError.errors) {
                const validationErrors = Object.values(apiError.errors).flat().join(' ');
                if (validationErrors) errorMessage = validationErrors;
            }
        } else if (axiosError.request) {
            errorMessage = 'No se recibió respuesta del servidor al intentar crear el responsable.';
        } else {
            errorMessage = axiosError.message || errorMessage;
        }
    throw new Error(errorMessage);
  }
};