import axios from 'axios';
import { Olimpiada, ApiResponse } from '../types';

const API_URL = 'http://127.0.0.1:8000/api/olimpiadas';

export const olimpiadaService = {
  obtenerOlimpiadas: async (): Promise<Olimpiada[]> => {
    const { data } = await axios.get<ApiResponse>(API_URL);
    return data.data;
  },

  // Nueva función para el POST
  crearOlimpiada: async (nueva: { nombre: string; gestion: string }): Promise<void> => {
    await axios.post(API_URL, nueva);
  }
};