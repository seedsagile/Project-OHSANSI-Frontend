import apiClient from '@/api/ApiPhp';
import type { 
  FaseGlobal, 
  CrearFasePayload, 
  ActualizarCronogramaPayload 
} from '../types';

export const cronogramaService = {
  async obtenerFasesActuales(): Promise<FaseGlobal[]> {
    const response = await apiClient.get<FaseGlobal[]>('/fase-global/actuales');
    return response.data;
  },

  async configurarFase(data: CrearFasePayload): Promise<void> {
    await apiClient.post('/fase-global/configurar', data);
  },

  async actualizarFaseCronograma(
    idFaseGlobal: number, 
    data: ActualizarCronogramaPayload
  ): Promise<void> {
    await apiClient.patch(`/fase-global/${idFaseGlobal}/cronograma`, data);
  }
};