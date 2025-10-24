import { AxiosError } from 'axios';
import apiClient from '@/api/ApiPhp';
import type {
  DatosPersonaVerificada,
  Gestion,
  CrearResponsablePayload,
  ResponsableCreado,
  AreaPasadaResponse,
  Area as AreaGeneral,
} from '../types/index';

type Area = AreaGeneral;
const GESTION_ACTUAL = '2025';
const ID_OLIMPIADA_ACTUAL = 1;

type ApiErrorResponse = {
  message?: string;
  errors?: Record<string, string[]>;
};

export const verificarCI = async (ci: string): Promise<DatosPersonaVerificada | null> => {
  try {
    const response = await apiClient.get<{ data: any }>(`/usuarios/ci/${ci}`);

    if (response.data && response.data.data) {
      const apiData = response.data.data;
      const personaVerificada: DatosPersonaVerificada = {
        Id_usuario: apiData.Id_usuario,
        Nombres: apiData.Nombres,
        Apellidos: apiData.Apellidos,
        Correo: apiData.Correo,
        Ci: apiData.Ci,
        Teléfono: apiData.Teléfono,
        Rol: apiData.Rol ? {
          Id_rol: apiData.Rol.Id_rol,
          Nombre_rol: apiData.Rol.Nombre_rol
        } : undefined,
        // TODO: Determinar cómo la API indica si está en la GESTIÓN ACTUAL para Escenario 3
        // estaEnGestionActual: apiData.estaEnGestionActual ?? false,
        // areasEnGestionActual: apiData.areasEnGestionActual ?? [],
      };
      return personaVerificada;
    }
    console.warn(`Respuesta inesperada o sin datos de /usuarios/ci/${ci}:`, response.data);
    return null;

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
    const response = await apiClient.get<Gestion[]>(`/responsables/ci/${ci}/gestiones`);
    return Array.isArray(response.data) ? response.data : [];
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
    const response = await apiClient.get<AreaPasadaResponse[]>(
      `/responsables/ci/${ci}/gestion/${gestion}/areas`
    );
    return response.data
            ?.map(item => item?.Area?.Id_area)
            .filter((id): id is number => typeof id === 'number')
          || [];
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
      `/olimpiadas/${GESTION_ACTUAL}/areas`
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
    console.error(`Error al obtener áreas para la gestión ${GESTION_ACTUAL}:`, error);
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
    password: payload.password,
    // TODO: Confirmar si se necesita enviar id_olimpiada y cómo obtener ID_OLIMPIADA_ACTUAL
    id_olimpiada: payload.id_olimpiada ?? ID_OLIMPIADA_ACTUAL,
  };

  try {
    console.log("Enviando payload a POST /responsables:", apiPayload);
    const response = await apiClient.post<ResponsableCreado>('/responsables', apiPayload);
    // TODO: Ajustar el tipo ResponsableCreado según la respuesta REAL
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    console.error('Error al crear responsable:', error);
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
      errorMessage = 'No se recibió respuesta del servidor.';
    } else {
      errorMessage = axiosError.message || errorMessage;
    }
    throw new Error(errorMessage);
  }
};