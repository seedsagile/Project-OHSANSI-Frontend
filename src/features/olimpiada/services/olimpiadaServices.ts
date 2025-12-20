import axios from 'axios';
import { Olimpiada, ApiResponse } from '../types';

const API_URL = 'http://127.0.0.1:8000/api/olimpiadas';

export const olimpiadaService = {
  obtenerOlimpiadas: async (): Promise<Olimpiada[]> => {
    const { data } = await axios.get<ApiResponse>(API_URL);
    return data.data;
  },

  crearOlimpiada: async (nueva: { nombre: string; gestion: string }): Promise<void> => {
    await axios.post(API_URL, nueva);
  },

  // Nueva función para activar olimpiada
  activarOlimpiada: async (id: number): Promise<void> => {
    await axios.put(`${API_URL}/${id}/activar`);
  }
};