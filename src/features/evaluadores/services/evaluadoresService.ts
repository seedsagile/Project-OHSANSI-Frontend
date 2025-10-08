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
   * Obtener niveles por área ID
   */
  async obtenerNivelesPorArea(idArea: number): Promise<Nivel[]> {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/area-niveles/detalle/${idArea}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al obtener los niveles del área");
      }

      const responseData = await response.json();
      
      // Extraer los niveles del response
      if (responseData.success && responseData.data) {
        // Mapear para evitar duplicados y extraer solo la info del nivel
        const nivelesUnicos = responseData.data.reduce((acc: Nivel[], item: any) => {
          const nivelExiste = acc.find(n => n.id_nivel === item.nivel.id_nivel);
          if (!nivelExiste && item.nivel) {
            acc.push({
              id_nivel: item.nivel.id_nivel,
              nombre: item.nivel.nombre
            });
          }
          return acc;
        }, []);
        
        return nivelesUnicos;
      }
      
      return [];
    } catch (error) {
      console.error("Error en obtenerNivelesPorArea:", error);
      throw error;
    }
  },
};

// ==================== SERVICIO DE EVALUADORES ====================
export const evaluadoresService = {
  /**
   * Crear un nuevo evaluador con múltiples áreas y niveles
   */
  async crearEvaluador(
    payload: CreateEvaluadorPayload
  ): Promise<EvaluadorResponse> {
    try {
      console.log("🔵 Servicio - Payload recibido:", JSON.stringify(payload, null, 2));
      
      const response = await fetch(`${API_BASE_URL}/evaluadores`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("🔵 Servicio - Status de respuesta:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("🔴 Servicio - Error del backend:", errorData);
        throw new Error(errorData.message || "Error al crear el evaluador");
      }

      const data = await response.json();
      console.log("🟢 Servicio - Respuesta exitosa:", JSON.stringify(data, null, 2));
      return data;
    } catch (error) {
      console.error("🔴 Servicio - Error en crearEvaluador:", error);
      throw error;
    }
  }
}