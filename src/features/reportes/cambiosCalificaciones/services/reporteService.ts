import apiClient from '@/api/ApiPhp';
import type { 
  ReporteResponse, 
  AreasNivelesResponse, 
  HistorialCambio 
} from '../types';

export const reporteService = {
  async obtenerHistorial(
    areaId: number | null,
    nivelesIds: number[],
    page: number = 1,
    limit: number = 10,
    search: string = ''
  ): Promise<ReporteResponse> {
    const params = new URLSearchParams();
  
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (areaId) {
      params.append('id_area', areaId.toString());
    }
    
    if (nivelesIds.length > 0) {
      params.append('ids_niveles', nivelesIds.join(','));
    }
    
    if (search) {
      params.append('search', search);
    }

    try {
      const { data } = await apiClient.get<ReporteResponse>('/reportes/historial-calificaciones', { params });
      return data;
    } catch (error) {
      console.error("Error al obtener historial:", error);
      throw error;
    }
  },

  async obtenerTodoParaExportar(
    areaId: number | null,
    nivelesIds: number[],
    search: string = ''
  ): Promise<HistorialCambio[]> {
    const params = new URLSearchParams();
    
    params.append('page', '1');
    params.append('limit', '10000');
    
    if (areaId) params.append('id_area', areaId.toString());
    if (nivelesIds.length > 0) params.append('ids_niveles', nivelesIds.join(','));
    if (search) params.append('search', search);
    
    try {
      const { data } = await apiClient.get<ReporteResponse>('/reportes/historial-calificaciones', { params });
      return data.data;
    } catch (error) {
      console.error("Error al obtener datos para exportación:", error);
      throw error;
    }
  },

  async obtenerAreasConNiveles(idUser: number): Promise<AreasNivelesResponse> {
    try {
      const { data } = await apiClient.get<AreasNivelesResponse>(
        `/responsables/${idUser}/areas-con-niveles/olimpiada-actual`
      );
      return data;
    } catch (error) {
      console.error("Error al obtener áreas y niveles del responsable:", error);
      return { areas: [] };
    }
  }
};