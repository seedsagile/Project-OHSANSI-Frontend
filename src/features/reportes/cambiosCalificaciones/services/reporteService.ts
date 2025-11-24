import { MOCK_HISTORIAL } from '../utils/mocks';
import type { HistorialCambio } from '../types';

export const reporteService = {

  async obtenerHistorial(areaId: number | null, nivelesIds: number[]): Promise<HistorialCambio[]> {
    await new Promise((resolve) => setTimeout(resolve, 600));
    if (areaId === null) {
      return [...MOCK_HISTORIAL];
    }
    if (!nivelesIds || nivelesIds.length === 0) {
      console.warn('[reporteService] Se intentó filtrar por área sin niveles seleccionados.');
      return [];
    }

    try {
      const historialFiltrado = MOCK_HISTORIAL.filter((item) => {
        const perteneceAlArea = item.id_area === areaId;
        const perteneceANivel = nivelesIds.includes(item.id_nivel);
        return perteneceAlArea && perteneceANivel;
      });

      return historialFiltrado;

    } catch (error) {
      console.error('[reporteService] Error al obtener el historial:', error);
      throw new Error('No se pudo cargar el historial de calificaciones. Intente nuevamente.');
    }
  },

  async exportarExcelBackend(areaId: number, nivelesIds: number[]): Promise<Blob> {
    console.info('[reporteService] Solicitando exportación backend para:', { areaId, nivelesIds });
    throw new Error("Método de exportación por backend no implementado aún. Usando generación local.");
  }
};