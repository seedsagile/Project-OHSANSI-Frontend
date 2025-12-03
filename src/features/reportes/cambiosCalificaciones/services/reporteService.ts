import apiClient from '@/api/ApiPhp';
import type { ReporteResponse, AreaFiltro, NivelFiltro, HistorialCambio } from '../types';

export const reporteService = {

  async obtenerHistorial(
    areaId: number | null,
    nivelesIds: number[],
    page: number = 1,
    limit: number = 10
  ): Promise<ReporteResponse> {
    
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    if (areaId) params.append('id_area', areaId.toString());
    if (nivelesIds.length > 0) params.append('ids_niveles', nivelesIds.join(','));

    const { data } = await apiClient.get<ReporteResponse>('/reportes/historial-calificaciones', { params });
    return data;
  },

  async obtenerTodoParaExportar(
    areaId: number | null,
    nivelesIds: number[]
  ): Promise<HistorialCambio[]> {
    const params = new URLSearchParams();
    
    params.append('page', '1');
    params.append('limit', '10000'); 
    
    if (areaId) params.append('id_area', areaId.toString());
    if (nivelesIds.length > 0) params.append('ids_niveles', nivelesIds.join(','));
    
    try {
      const { data } = await apiClient.get<ReporteResponse>('/reportes/historial-calificaciones', { params });
      return data.data;
    } catch (error) {
      console.error("Error al obtener datos para exportación:", error);
      throw error;
    }
  },
  
  async obtenerAreasFiltro(): Promise<AreaFiltro[]> {
    try {
      const { data } = await apiClient.get<{ data: AreaFiltro[] }>('/reportes/areas');
      return data.data || [];
    } catch { return []; }
  },

  async obtenerNivelesPorAreaFiltro(idArea: number): Promise<NivelFiltro[]> {
    try {
      const { data } = await apiClient.get<{ data: NivelFiltro[] }>(`/reportes/areas/${idArea}/niveles`);
      return data.data || [];
    } catch { return []; }
  }
};