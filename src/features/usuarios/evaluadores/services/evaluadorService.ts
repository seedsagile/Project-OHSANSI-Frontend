import { AxiosError } from 'axios';
import apiClient from '@/api/ApiPhp';
import {
  mapApiUsuarioToVerificacionCompleta,
  mapApiEvaluadorModificado,
} from '../utils/apiMappers';
import { ID_OLIMPIADA_ACTUAL } from '../utils/constants';
import type {
  VerificacionUsuarioCompleta,
  ApiUsuarioResponse,
  CrearEvaluadorPayload,
  EvaluadorCreado,
  AreaParaAsignar,
  AsignarEvaluadorPayload,
  EvaluadorAsignado,
} from '../types/index';

type ApiErrorResponse = {
  message?: string;
  errors?: Record<string, string[]>;
};

const _handleMutationError = (error: unknown): Error => {
  const axiosError = error as AxiosError<ApiErrorResponse>;
  let errorMessage = 'No se pudo completar la operación.';

  if (axiosError.response) {
    const errorData = axiosError.response.data;

    if (axiosError.response.status === 422 && errorData?.errors) {
      const validationErrors = Object.values(errorData.errors).flat().join(' ');
      errorMessage = validationErrors || errorData.message || errorMessage;
    } else {
      errorMessage = errorData?.message || errorMessage;
    }
  } else if (axiosError.request) {
    errorMessage = 'No se recibió respuesta del servidor. Verifique su conexión.';
  } else {
    errorMessage = axiosError.message || errorMessage;
  }

  console.error('[evaluadorService] Error en mutación:', error);
  return new Error(errorMessage);
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

export const obtenerAreasYNivelesActuales = async (): Promise<AreaParaAsignar[]> => {
  try {
    const response = await apiClient.get<any[]>(`/area-nivel/actuales`);

    return (
      response.data?.map(
        (area): AreaParaAsignar => ({
          id_area: Number(area.id_area),
          area: area.area,
          niveles: Array.isArray(area.niveles)
            ? area.niveles.map((nivel: any) => ({
                id_area_nivel: Number(nivel.id_area_nivel),
                id_nivel: Number(nivel.id_nivel),
                nombre: nivel.nombre,
              }))
            : [],
        })
      ) || []
    );
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error(`Error al obtener áreas y niveles:`, error);
    const apiError = axiosError.response?.data as ApiErrorResponse;
    throw new Error(
      apiError?.message || axiosError.message || 'Error de red al obtener áreas y niveles.'
    );
  }
};

export const crearEvaluador = async (
  payload: CrearEvaluadorPayload
): Promise<EvaluadorCreado> => {
  const apiPayload = {
    nombre: payload.nombre,
    apellido: payload.apellido,
    ci: payload.ci,
    email: payload.email,
    telefono: payload.telefono,
    password: payload.password || 'password_predeterminado',
    id_olimpiada: payload.id_olimpiada ?? ID_OLIMPIADA_ACTUAL,
    area_nivel_ids: payload.area_nivel_ids,
    // --- INICIO DE LA MODIFICACIÓN (CA 56) ---
    force_create_role: payload.force_create_role ?? false,
    // --- FIN DE LA MODIFICACIÓN ---
  };

  try {
    console.log('Enviando payload a POST /evaluadores (Creación):', apiPayload);
    const response = await apiClient.post<any>('/evaluadores', apiPayload);
    return mapApiEvaluadorModificado(response.data);
  } catch (error) {
    throw _handleMutationError(error);
  }
};

export const asignarEvaluador = async (
  ci: string,
  payload: AsignarEvaluadorPayload
): Promise<EvaluadorAsignado> => {
  const apiPayload = payload;

  try {
    console.log(
      `Enviando payload a POST /evaluadores/ci/${ci}/asignaciones (Asignación):`,
      apiPayload
    );
    const response = await apiClient.post<any>(
      `/evaluadores/ci/${ci}/asignaciones`,
      apiPayload
    );
    return mapApiEvaluadorModificado(response.data);
  } catch (error) {
    throw _handleMutationError(error);
  }
};