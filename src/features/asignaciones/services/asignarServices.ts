// src/features/asignaciones/services/asignacionesService.ts

import apiClient from '../../../api/ApiPhp';
import type { ApiResponse, AreaNivel, AsignacionPayload } from '../types';

export const asignacionesService = {
  
  async obtenerNivelesPorArea(id_area: number): Promise<AreaNivel[]> {
    const response = await apiClient.get<ApiResponse<AreaNivel[]>>(`/area-niveles/${id_area}`);
    return response.data.data;
  },

  async actualizarNivelesDeArea(id_area: number, payload: AsignacionPayload[]): Promise<AreaNivel[]> {
    const response = await apiClient.put<ApiResponse<AreaNivel[]>>(`/area-niveles/${id_area}`, payload);
    return response.data.data;
  },

  async crearAsignacionesDeArea(payload: AsignacionPayload[]): Promise<AreaNivel[]> {
    const response = await apiClient.post<ApiResponse<AreaNivel[]>>('/area-niveles', payload);
    return response.data.data;
  }
};