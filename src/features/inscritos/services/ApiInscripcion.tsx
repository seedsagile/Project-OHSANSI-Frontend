import apiClient from "../../../api/ApiPhp";
import type { InscripcionPayload } from "../types/indexInscritos";
import { AxiosError } from "axios";

// --- Interceptores de Axios para depuración ---

// 1. Interceptor de Solicitud: Se ejecuta ANTES de que la petición se envíe.
apiClient.interceptors.request.use(request => {
    console.log('--- Iniciando Solicitud Axios ---');
    console.log('URL:', request.url);
    console.log('Método:', request.method);
    console.log('Datos (Payload):', request.data);
    console.log('-------------------------------');
    return request;
});

// 2. Interceptor de Respuesta: Se ejecuta DESPUÉS de recibir una respuesta.
apiClient.interceptors.response.use(response => {
    console.log('--- Respuesta Exitosa Recibida ---');
    console.log('Status:', response.status);
    console.log('Datos de Respuesta:', response.data);
    console.log('----------------------------------');
    return response;
}, (error: AxiosError) => {
    console.error('--- Error en la Solicitud Axios ---');
    if (error.response) {
        // El servidor respondió con un código de estado fuera del rango 2xx
        console.error('Status del Error:', error.response.status);
        console.error('Datos del Error:', error.response.data);
        console.error('Headers del Error:', error.response.headers);
    } else if (error.request) {
        // La solicitud se hizo pero no se recibió respuesta (ej. problema de red, CORS)
        console.error('No se recibió respuesta del servidor. Verifique la conexión o problemas de CORS.');
        console.error('Request Details:', error.request);
    } else {
        // Algo ocurrió al configurar la solicitud que disparó un error
        console.error('Error al configurar la solicitud:', error.message);
    }
    console.error('-----------------------------------');
    return Promise.reject(error); // Es importante rechazar la promesa para que .onError() se active
});


/**
 * Envía el objeto de inscripción con la lista de competidores para ser importados.
 * @param payload - El objeto que contiene la lista de competidores.
 * @returns La respuesta de la API.
 */
export const importarCompetidoresAPI = async (payload: InscripcionPayload) => {
    const response = await apiClient.post('/competidores/importar', payload);
    return response.data;
};