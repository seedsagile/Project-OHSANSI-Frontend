import apiClient from '../../../api/ApiPhp';
import type { 
  InscripcionPayload, 
  ApiResponseAreas, 
  ApiErrorResponse,
  ImportacionResponse 
} from '../types/indexInscritos';
import { AxiosError } from 'axios';

apiClient.interceptors.request.use((request) => {
  console.log('--- Iniciando Solicitud Axios ---');
  console.log('URL:', request.url);
  console.log('Método:', request.method);
  console.log('Datos (Payload):', request.data ? 'Presente' : 'Ausente');
  console.log('-------------------------------');
  return request;
});

apiClient.interceptors.response.use(
  (response) => {
    console.log('--- Respuesta Exitosa Recibida ---');
    console.log('Status:', response.status);
    console.log('----------------------------------');
    return response;
  },
  (error: AxiosError<ApiErrorResponse>) => {
    console.error('--- Error en la Solicitud Axios ---');
    if (error.response) {
      console.error('Status del Error:', error.response.status);
      console.error('Datos del Error:', error.response.data);
    } else if (error.request) {
      console.error(
        'No se recibió respuesta del servidor. Verifique la conexión o problemas de CORS.'
      );
    } else {
      console.error('Error al configurar la solicitud:', error.message);
    }
    console.error('-----------------------------------');
    return Promise.reject(error);
  }
);

export const importarCompetidoresAPI = async (
  gestion: string, 
  payload: InscripcionPayload
): Promise<ImportacionResponse> => {
  if (!gestion || typeof gestion !== 'string' || !/^\d{4}$/.test(gestion)) {
      throw new Error('La gestión proporcionada no es válida.');
  }
  if (!payload || typeof payload !== 'object' || !payload.nombre_archivo || !Array.isArray(payload.competidores)) {
     throw new Error('El payload para importar competidores no es válido.');
  }

  const url = `/importar/${gestion}`;
  console.log(`Enviando POST a: ${url}`);
  const response = await apiClient.post<ImportacionResponse>(url, payload);

  return response.data;
};

export const obtenerAreasConNivelesAPI = async (): Promise<ApiResponseAreas> => {
  const response = await apiClient.get<ApiResponseAreas>('/area-nivel/sim/simplificado');
  return response.data;
};