import { mockConfiguracion2025 } from '../utils/mocks'; // Importamos el mock

import type {
  MatrizConfiguracionResponse,
  GuardarConfiguracionPayload,
} from '../types';

/* type ApiErrorResponse = {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
};
*/

export const configuracionService = {

  /**
   * Obtiene la configuración.
   * MODO MOCK ACTIVADO: Devuelve datos estáticos locales.
   */
  async obtenerConfiguracion(gestion: string): Promise<MatrizConfiguracionResponse> {
    console.log(`[ConfigService] (MOCK) GET /configuracion-fases/${gestion}`);
    
    // Simulamos un retraso de red de 800ms para ver el spinner de carga
    await new Promise(resolve => setTimeout(resolve, 800));

    // Retornamos el mock directamente (simulando que viene de response.data.data)
    return {
      ...mockConfiguracion2025,
      gestion: gestion // Aseguramos que devuelva la gestión que pedimos
    };

    /* --- CÓDIGO PARA CUANDO EL BACKEND ESTÉ LISTO ---
    try {
      const response = await apiClient.get<{ data: MatrizConfiguracionResponse }>(
        `/configuracion-fases/${gestion}`
      );
      return response.data.data;
    } catch (error) {
      // ... manejo de errores original
      throw error;
    }
    */
  },

  /**
   * Guarda la configuración.
   * MODO MOCK ACTIVADO: Simula un guardado exitoso.
   */
  async guardarConfiguracion(payload: GuardarConfiguracionPayload): Promise<void> {
    console.log('[ConfigService] (MOCK) POST /configuracion-fases', payload);
    
    // Simulamos retraso de red
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulamos una validación simple
    if (!payload.permisos || payload.permisos.length === 0) {
      throw new Error('No se enviaron datos para guardar.');
    }

    console.log('✅ Guardado simulado exitoso.');
    
    /* --- CÓDIGO PARA CUANDO EL BACKEND ESTÉ LISTO ---
    try {
      await apiClient.post('/configuracion-fases', payload);
    } catch (error) {
      // ... manejo de errores original
      throw error;
    }
    */
  }
};