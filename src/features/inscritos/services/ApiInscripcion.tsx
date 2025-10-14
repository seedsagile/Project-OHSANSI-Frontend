import apiClient from '../../../api/ApiPhp';
import type { InscripcionPayload } from '../types/indexInscritos';
import { AxiosError } from 'axios';

apiClient.interceptors.request.use((request) => {
  console.log('--- Iniciando Solicitud Axios ---');
  console.log('URL:', request.url);
  console.log('Método:', request.method);
  console.log('Datos (Payload):', request.data);
  console.log('-------------------------------');
  return request;
});

apiClient.interceptors.response.use(
  (response) => {
    console.log('--- Respuesta Exitosa Recibida ---');
    console.log('Status:', response.status);
    console.log('Datos de Respuesta:', response.data);
    console.log('----------------------------------');
    return response;
  },
  (error: AxiosError) => {
    console.error('--- Error en la Solicitud Axios ---');
    if (error.response) {
      console.error('Status del Error:', error.response.status);
      console.error('Datos del Error:', error.response.data);
      console.error('Headers del Error:', error.response.headers);
    } else if (error.request) {
      console.error(
        'No se recibió respuesta del servidor. Verifique la conexión o problemas de CORS.'
      );
      console.error('Request Details:', error.request);
    } else {
      console.error('Error al configurar la solicitud:', error.message);
    }
    console.error('-----------------------------------');
    return Promise.reject(error);
  }
);

export const importarCompetidoresAPI = async (payload: InscripcionPayload) => {
  const response = await apiClient.post('/competidores/importar', payload);
  return response.data;
};
