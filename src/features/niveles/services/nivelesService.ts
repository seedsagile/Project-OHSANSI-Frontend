/*import apiClient from '../../../api/ApiPhp';
import type { Nivel, CrearNivelData } from '../types';
import { AxiosError } from 'axios';

type ApiErrorResponse = {
  message?: string;
};

export const nivelesService = {
  async obtenerNiveles(): Promise<Nivel[]> {
    const response = await apiClient.get<Nivel[]>('/niveles');
    return response.data;
  },

  async crearNivel(data: CrearNivelData): Promise<Nivel> {
    try {
      const response = await apiClient.post<Nivel>('/niveles', data);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const apiError = error.response?.data as ApiErrorResponse;
        if (error.response?.status === 409) {
          throw new Error('Ya existe un nivel con este nombre en esta área.');
        }
        throw new Error(apiError?.message || 'Ocurrió un error al crear el nivel.');
      }
      throw new Error('Error de conexión al servidor.');
    }
  },
};*/


import apiClient from '../../../api/ApiPhp';
import type { Nivel, CrearNivelData } from '../types';
import { AxiosError } from 'axios';

type ApiErrorResponse = {
  message?: string;
};

type CrearNivelResponse = {
  nivel: Nivel;
};

export const nivelesService = {
  async obtenerNiveles(): Promise<Nivel[]> {
    const response = await apiClient.get<Nivel[]>('/niveles');
    return response.data;
  },

  async crearNivel(data: CrearNivelData): Promise<Nivel> {
    try {
      const response = await apiClient.post<CrearNivelResponse>('/niveles', data);
      // Extraemos el nivel del objeto de respuesta
      return response.data.nivel;
    } catch (error) {
      if (error instanceof AxiosError) {
        const apiError = error.response?.data as ApiErrorResponse;
        if (error.response?.status === 409) {
          throw new Error('Ya existe un nivel con este nombre.');
        }
        throw new Error(apiError?.message || 'Ocurrió un error al crear el nivel.');
      }
      throw new Error('Error de conexión al servidor.');
    }
  },
};