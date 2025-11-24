import { MOCK_HISTORIAL } from '../utils/mocks';
import type { HistorialCambio } from '../types';
export interface MetaPaginacion {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ReporteResponse {
  success: boolean;
  data: HistorialCambio[];
  meta: MetaPaginacion;
}

export const reporteService = {

  async obtenerHistorial(
    areaId: number | null,
    nivelesIds: number[],
    page: number = 1,
    limit: number = 10
  ): Promise<ReporteResponse> {
    await new Promise((resolve) => setTimeout(resolve, 600));
    let resultados = [...MOCK_HISTORIAL];
    if (areaId !== null) {
      if (!nivelesIds || nivelesIds.length === 0) {
        return {
          success: true,
          data: [],
          meta: { total: 0, page, limit, totalPages: 0 }
        };
      }

      resultados = resultados.filter((item) => {
        const perteneceAlArea = item.id_area === areaId;
        const perteneceANivel = nivelesIds.includes(item.id_nivel);
        return perteneceAlArea && perteneceANivel;
      });
    }

    const total = resultados.length;
    const totalPages = Math.ceil(total / limit);

    const safePage = totalPages > 0 ? Math.max(1, Math.min(page, totalPages)) : 1;
    
    const startIndex = (safePage - 1) * limit;
    const endIndex = startIndex + limit;

    const dataPaginada = resultados.slice(startIndex, endIndex);

    return {
      success: true,
      data: dataPaginada,
      meta: {
        total,
        page: safePage,
        limit,
        totalPages
      }
    };

    /* ---------------------------------------------------------
     * CÓDIGO PARA PRODUCCIÓN (INTEGRACIÓN REAL):
     * Cuando el backend esté listo, descomenta esto y borra lo anterior.
     * ---------------------------------------------------------
     * try {
     * const params = {
     * id_area: areaId,
     * // Si es null, no enviamos ids_niveles o enviamos string vacío según requiera el back
     * ids_niveles: areaId ? nivelesIds.join(',') : undefined, 
     * page,
     * limit
     * };
     * * const response = await apiClient.get<ReporteResponse>(
     * '/reportes/historial-calificaciones', 
     * { params }
     * );
     * * return response.data;
     * } catch (error) {
     * console.error('[reporteService] Error API:', error);
     * throw error; 
     * }
     */
  },

  async exportarExcelBackend(areaId: number, nivelesIds: number[]): Promise<Blob> {
    console.info('[reporteService] Solicitando exportación backend...', { areaId, nivelesIds });
    throw new Error("Método no implementado. Usando exportación local.");
  }
};