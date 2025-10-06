// src/features/evaluadores/services/evaluadoresService.ts

import type {
  Area,
  Nivel,
  CreateEvaluadorPayload,
  EvaluadorResponse,
} from "../tipos/IndexEvaluador";

const API_BASE_URL = "http://localhost:8000/api/v1";

// ==================== SERVICIO DE ÁREAS ====================
export const areasService = {
  /**
   * Obtener todas las áreas
   */
  async obtenerAreas(): Promise<Area[]> {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/area", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Error al obtener las áreas");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error en obtenerAreas:", error);
      throw error;
    }
  },
};

// ==================== SERVICIO DE NIVELES ====================
export const nivelesService = {
  /**
   * Obtener todos los niveles
   */
  async obtenerNiveles(): Promise<Nivel[]> {
    try {
      // Por ahora devuelve datos de ejemplo hasta que tengas el endpoint
      // Reemplaza esto cuando tengas la API de niveles
      const nivelesData: Nivel[] = [
        { id_nivel: 1, nombre: "Tercero secundaria" },
        { id_nivel: 2, nombre: "Cuarto secundaria" },
        { id_nivel: 3, nombre: "Quinto secundaria" },
      ];
      
      return Promise.resolve(nivelesData);
      
      /* Cuando tengas el endpoint de niveles, reemplaza con:
      const response = await fetch("http://127.0.0.1:8000/api/nivel", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Error al obtener los niveles");
      }

      const data = await response.json();
      return data;
      */
    } catch (error) {
      console.error("Error en obtenerNiveles:", error);
      throw error;
    }
  },
};

// ==================== SERVICIO DE EVALUADORES ====================
export const evaluadoresService = {
  /**
   * Crear un nuevo evaluador
   */
  async crearEvaluador(
    payload: CreateEvaluadorPayload
  ): Promise<EvaluadorResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/evaluadores`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear el evaluador");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error en crearEvaluador:", error);
      throw error;
    }
  },

  /**
   * Obtener todos los evaluadores
   */
  async obtenerEvaluadores(): Promise<EvaluadorResponse[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/evaluadores`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Error al obtener los evaluadores");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error en obtenerEvaluadores:", error);
      throw error;
    }
  },

  /**
   * Obtener un evaluador por ID
   */
  async obtenerEvaluadorPorId(id: number): Promise<EvaluadorResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/evaluadores/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Error al obtener el evaluador");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error en obtenerEvaluadorPorId:", error);
      throw error;
    }
  },

  /**
   * Actualizar un evaluador
   */
  async actualizarEvaluador(
    id: number,
    payload: Partial<CreateEvaluadorPayload>
  ): Promise<EvaluadorResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/evaluadores/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Error al actualizar el evaluador"
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error en actualizarEvaluador:", error);
      throw error;
    }
  },

  /**
   * Eliminar un evaluador
   */
  async eliminarEvaluador(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/evaluadores/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el evaluador");
      }
    } catch (error) {
      console.error("Error en eliminarEvaluador:", error);
      throw error;
    }
  },
};