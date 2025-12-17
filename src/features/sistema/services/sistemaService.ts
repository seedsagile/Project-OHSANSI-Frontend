import apiClient from '@/api/ApiPhp';
import { SistemaEstado } from '../types/sistema.types';

export const sistemaService = {
  getUpdateEstado: async (): Promise<SistemaEstado> => {
    try {
      const { data } = await apiClient.get<SistemaEstado>('/sistema/estado');
      return data;
    } catch (error) {
      console.error('Error al recuperar el estado del sistema:', error);
      throw error;
    }
  },
};