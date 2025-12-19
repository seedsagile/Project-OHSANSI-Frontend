import apiClient from '@/api/ApiPhp';
import type { DescalificarPayload } from '../types/sala.types';

export const descalificarCompetidor = async (idEvaluacion: number, payload: DescalificarPayload): Promise<void> => {
  await apiClient.post(`/sala-evaluacion/${idEvaluacion}/descalificar`, payload);
};