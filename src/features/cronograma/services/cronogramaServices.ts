import apiClient from '@/api/ApiPhp';
import type { 
  CronogramaFase, 
  FaseGlobal, 
  CrearCronogramaPayload, 
  EditarCronogramaPayload 
} from '../types';

export const cronogramaService = {

  async obtenerFasesGlobales(): Promise<FaseGlobal[]> {
    try {
      const response = await apiClient.get<FaseGlobal[]>('/fases-globales/actuales');
      return response.data;
    } catch (error) {
      console.error('Error al obtener fases globales:', error);
      throw error;
    }
  },

  async obtenerCronogramaActual(): Promise<CronogramaFase[]> {
    try {
      const response = await apiClient.get<CronogramaFase[]>('/cronograma-fases/actuales');
      return response.data;
    } catch (error) {
      console.error('Error al obtener el cronograma actual:', error);
      throw error;
    }
  },

  async crearCronograma(data: CrearCronogramaPayload): Promise<CronogramaFase> {
    try {
      const response = await apiClient.post<CronogramaFase>('/cronograma-fases', data);
      return response.data;
    } catch (error) {
      console.error('Error al crear cronograma:', error);
      throw error;
    }
  },

  async editarCronograma(data: EditarCronogramaPayload): Promise<CronogramaFase> {
    const { id_cronograma_fase, ...payload } = data;
    try {
      const response = await apiClient.put<CronogramaFase>(
        `/cronograma-fases/${id_cronograma_fase}`, 
        payload
      );
      return response.data;
    } catch (error) {
      console.error(`Error al editar cronograma ${id_cronograma_fase}:`, error);
      throw error;
    }
  },

  async actualizarParcial(
    id: number, 
    data: Partial<Pick<EditarCronogramaPayload, 'fecha_inicio' | 'fecha_fin'>>
  ): Promise<CronogramaFase> {
    try {
      const response = await apiClient.patch<CronogramaFase>(
        `/cronograma-fases/${id}`, 
        data
      );
      return response.data;
    } catch (error) {
      console.error(`Error al parchear cronograma ${id}:`, error);
      throw error;
    }
  }
};