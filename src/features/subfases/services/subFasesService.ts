import { AxiosError } from 'axios';
import apiClient from '@/api/ApiPhp';
import type { SubFase, EstadoSubFase } from '../types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface AreaBackend {
  id_area: number;
  nombre: string;
}

export interface NivelBackend {
  id_nivel: number;
  nombre: string;
}

export const subFasesService = {
  
  async obtenerAreas(): Promise<AreaBackend[]> {
    try {
      const response = await apiClient.get<ApiResponse<AreaBackend[]>>('/areas/actuales');
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener áreas:', error);
      throw new Error('No se pudieron cargar las áreas disponibles.');
    }
  },

  async obtenerNivelesPorArea(areaId: number, idOlimpiada: number): Promise<NivelBackend[]> {
    try {
      const url = `/area-nivel/olimpiada/${idOlimpiada}/area/${areaId}`;
      const response = await apiClient.get<ApiResponse<NivelBackend[]>>(url);
      return response.data.data;
    } catch (error) {
      console.error(`Error al obtener niveles para área ${areaId}:`, error);
      throw new Error('No se pudieron cargar los niveles para el área seleccionada.');
    }
  },

  async obtenerSubFases(
    areaId: number, 
    nivelId: number, 
    idOlimpiada: number
  ): Promise<SubFase[]> {
    try {
      const url = `/sub-fases/area/${areaId}/nivel/${nivelId}/olimpiada/${idOlimpiada}`;
      const response = await apiClient.get<ApiResponse<SubFase[]>>(url);
      
      // Ordenamos por el campo 'orden' para asegurar la secuencia visual correcta (1, 2, 3...)
      const fasesOrdenadas = response.data.data.sort((a, b) => a.orden - b.orden);
      
      return fasesOrdenadas;
    } catch (error) {
      console.error('Error al obtener sub-fases:', error);
      throw new Error('No se pudo obtener la información de las fases.');
    }
  },

  async cambiarEstadoSubFase(idSubFase: number, nuevoEstado: EstadoSubFase): Promise<void> {
    try {
      const url = `/sub-fases/${idSubFase}/estado`;
      const payload = { estado: nuevoEstado };
      
      await apiClient.patch(url, payload);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const mensajeBackend = axiosError.response?.data?.message;
      
      console.error(`Error al cambiar estado de fase ${idSubFase}:`, error);
      
      throw new Error(mensajeBackend || 'Error al actualizar el estado de la fase.');
    }
  }
};