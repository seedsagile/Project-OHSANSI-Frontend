import apiClient from '../../../api/ApiPhp';
// Importar los tipos actualizados, incluyendo ApiErrorResponse si se usa en interceptores
import type { InscripcionPayload, ApiResponseAreas, ApiErrorResponse } from '../types/indexInscritos';
import { AxiosError } from 'axios';

// --- Interceptors para Logging (útiles para depuración) ---
apiClient.interceptors.request.use((request) => {
  console.log('--- Iniciando Solicitud Axios ---');
  console.log('URL:', request.url);
  console.log('Método:', request.method);
  // No loguear todo el payload si es muy grande, quizás solo claves o tamaño
  console.log('Datos (Payload):', request.data ? 'Presente' : 'Ausente');
  console.log('-------------------------------');
  return request;
});

apiClient.interceptors.response.use(
  (response) => {
    console.log('--- Respuesta Exitosa Recibida ---');
    console.log('Status:', response.status);
    // No loguear toda la data si es muy grande
    // console.log('Datos de Respuesta:', response.data);
    console.log('----------------------------------');
    return response;
  },
  (error: AxiosError<ApiErrorResponse>) => { // Usar ApiErrorResponse aquí si aplica
    console.error('--- Error en la Solicitud Axios ---');
    if (error.response) {
      console.error('Status del Error:', error.response.status);
      console.error('Datos del Error:', error.response.data);
      // console.error('Headers del Error:', error.response.headers); // Generalmente no necesario
    } else if (error.request) {
      console.error(
        'No se recibió respuesta del servidor. Verifique la conexión o problemas de CORS.'
      );
      // console.error('Request Details:', error.request); // Puede ser muy verboso
    } else {
      console.error('Error al configurar la solicitud:', error.message);
    }
    console.error('-----------------------------------');
    // Rechazar con el error original para que React Query lo maneje
    return Promise.reject(error);
  }
);

/**
 * Llama a la API para importar competidores para una gestión específica.
 * @param gestion - El año de la gestión (ej. "2025").
 * @param payload - El objeto que contiene nombre_archivo y la lista de competidores.
 * @returns La respuesta de la API (se espera { message: string } en caso de éxito).
 * @throws {AxiosError} Si la API devuelve un error.
 */
export const importarCompetidoresAPI = async (gestion: string, payload: InscripcionPayload): Promise<{ message: string }> => {
  // Validar gestión mínimamente
  if (!gestion || typeof gestion !== 'string' || !/^\d{4}$/.test(gestion)) {
      throw new Error('La gestión proporcionada no es válida.');
  }
  // Validar payload mínimamente
  if (!payload || typeof payload !== 'object' || !payload.nombre_archivo || !Array.isArray(payload.competidores)) {
     throw new Error('El payload para importar competidores no es válido.');
  }

  const url = `/importar/${gestion}`; // Construye la URL dinámicamente
  console.log(`Enviando POST a: ${url}`);
  // No loguear el payload completo aquí por si es grande, ya se hace en el interceptor

  // Especificar el tipo de respuesta esperado para mayor seguridad
  const response = await apiClient.post<{ message: string }>(url, payload);

  // Devolver solo la data de la respuesta exitosa
  return response.data;
};

/**
 * Obtiene las áreas y sus niveles asignados (activos o sin asignar)
 * para la gestión actual implícita definida por la API.
 * @returns La respuesta completa de la API, incluyendo datos, éxito, mensaje y gestión actual.
 * @throws {AxiosError} Si la API devuelve un error.
 */
export const obtenerAreasConNivelesAPI = async (): Promise<ApiResponseAreas> => {
  const response = await apiClient.get<ApiResponseAreas>('/areas-con-niveles');
  // Devolver la estructura completa de la respuesta
  return response.data;
};