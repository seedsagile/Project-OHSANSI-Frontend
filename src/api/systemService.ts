// src/api/systemService.ts

import { AxiosError } from 'axios';
import apiClient from './ApiPhp';

// --- Interfaces de Respuesta (DTOs) ---

/**
 * Estructura del objeto 'gestion' dentro de la respuesta de estado.
 */
export interface GestionSystem {
  id: number;
  nombre: string;
  anio: string; // En tu JSON viene como "anio": "2025"
}

/**
 * Estructura de la fase actual del sistema.
 */
export interface FaseSystem {
  id_fase_global: number;
  nombre: string;
  codigo: string; // Ej: "CONFIG"
  fecha_cierre: string;
  tiempo_restante: string;
}

/**
 * Respuesta completa del endpoint /sistema/estado
 */
export interface SystemStatusResponse {
  success: boolean;
  data: {
    estado_general: string;
    servidor_fecha: string;
    gestion: GestionSystem;
    fase_actual: FaseSystem;
  };
}

/**
 * Estructura de una acción individual permitida para el usuario.
 */
export interface UserAction {
  id_accion: number;
  codigo: string; // Ej: "MOD_AREAS"
  nombre: string;
  descripcion: string;
}

/**
 * Respuesta completa del endpoint de acciones de usuario.
 */
export interface UserActionsResponse {
  success: boolean;
  data: UserAction[];
  roles_detected: string;
}

// --- Servicio ---

export const systemService = {
  
  /**
   * Obtiene el "latido" del sistema: Gestión y Fase actuales.
   * Endpoint: GET /sistema/estado
   */
  async getSystemStatus() {
    try {
      // Llamada tipada al API
      const { data } = await apiClient.get<SystemStatusResponse>('/sistema/estado');
      
      if (!data.success || !data.data) {
        throw new Error('La respuesta del estado del sistema no es válida.');
      }

      return data.data;
    } catch (error) {
      console.error('[SystemService] Error obteniendo estado:', error);
      throw error;
    }
  },

  /**
   * Obtiene la lista combinada de permisos (acciones) para el usuario
   * basándose en sus roles y la fase actual.
   * Endpoint: GET /usuario/{id}/fase-global/{idFase}/gestion/{idGestion}/acciones
   * * @returns Array de códigos de acciones (ej: ['MOD_AREAS', 'MOD_NIVELES'])
   */
  async getUserActions(userId: number, faseId: number, gestionId: number): Promise<string[]> {
    try {
      const url = `/usuario/${userId}/fase-global/${faseId}/gestion/${gestionId}/acciones`;
      
      const { data } = await apiClient.get<UserActionsResponse>(url);

      if (!data.success || !Array.isArray(data.data)) {
        // Si no hay data o falló, retornamos array vacío para no romper la UI
        console.warn('[SystemService] No se pudieron cargar acciones o lista vacía.');
        return [];
      }

      // Mapeamos para devolver solo los códigos, que es lo que usa el hook 'can()'
      return data.data.map((accion) => accion.codigo);
      
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error(`[SystemService] Error HTTP: ${error.response?.status}`, error.message);
      } else {
        console.error('[SystemService] Error desconocido al cargar acciones:', error);
      }
      // En caso de error crítico, retornamos sin permisos por seguridad (fail-safe)
      return [];
    }
  }
};