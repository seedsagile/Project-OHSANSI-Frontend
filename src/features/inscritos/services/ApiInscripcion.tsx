import apiClient from '../../../api/ApiPhp';
import type { 
  InscripcionPayload, 
  ApiResponseAreas, 
  ImportacionResponse 
} from '../types/indexInscritos';

export const importarCompetidoresAPI = async (
  gestion: string, 
  payload: InscripcionPayload
): Promise<ImportacionResponse> => {
  if (!gestion || typeof gestion !== 'string' || !/^\d{4}$/.test(gestion)) {
      throw new Error('La gestión proporcionada no es válida.');
  }
  if (!payload || typeof payload !== 'object' || !payload.nombre_archivo || !Array.isArray(payload.competidores)) {
    throw new Error('El payload para importar competidores no es válido.');
  }

  const url = `/importar/${gestion}`;
  const response = await apiClient.post<ImportacionResponse>(url, payload);

  return response.data;
};

export const obtenerAreasConNivelesAPI = async (): Promise<ApiResponseAreas> => {
  const response = await apiClient.get<ApiResponseAreas>('/area-nivel/sim/simplificado');
  return response.data;
};