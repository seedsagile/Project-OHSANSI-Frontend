// src/features/evaluaciones/services/evaluacionService.ts

import apiClient from '@/api/ApiPhp';
import type {
  EvaluadorAreasNiveles,
  CompetidoresResponse,
  CrearEvaluacionRequest,
  CrearEvaluacionResponse,
  FinalizarEvaluacionRequest,
  FinalizarEvaluacionResponse,
  BloqueoCompetidorRequest,
  BloqueoCompetidorResponse,
  Area,
} from '../types/evaluacion.types';

// 📌 Tipo para la respuesta RAW del backend
interface BackendAreaNivelItem {
  id_evaluador_an: number;
  id_area_nivel: number;
  area: string;
  nivel: string;
  gestion: string;
}

interface BackendAreasNivelesResponse {
  success: boolean;
  message: string;
  data: BackendAreaNivelItem[];
}

class EvaluacionService {
  /**
   * Obtiene las áreas y niveles asignados a un evaluador
   * 🔄 Transforma la respuesta del backend al formato esperado por el frontend
   */
  async getAreasNivelesByEvaluador(idEvaluador: number): Promise<EvaluadorAreasNiveles> {
    const response = await apiClient.get<BackendAreasNivelesResponse>(
      `/evaluadores/${idEvaluador}/areas-niveles`
    );

    // 🔄 Transformar la respuesta del backend
    const areasMap = new Map<string, Area>();

    response.data.data.forEach((item) => {
      const areaKey = item.area;

      if (!areasMap.has(areaKey)) {
        // Crear nueva área
        areasMap.set(areaKey, {
          id_area: item.id_area_nivel, // Usar id_area_nivel como id_area temporal
          nombre_area: item.area,
          niveles: [],
        });
      }

      // Agregar nivel al área
      const area = areasMap.get(areaKey)!;
      
      // Verificar si el nivel ya existe para evitar duplicados
      const nivelExiste = area.niveles.some(n => 
        n.nombre === item.nivel && n.id_nivel === item.id_area_nivel
      );

      if (!nivelExiste) {
        area.niveles.push({
          id_nivel: item.id_area_nivel, // Usar id_area_nivel como id_nivel
          nombre: item.nivel,
        });
      }
    });

    // Convertir Map a Array y ordenar
    const areas = Array.from(areasMap.values()).sort((a, b) => 
      a.nombre_area.localeCompare(b.nombre_area)
    );

    // Ordenar niveles dentro de cada área
    areas.forEach(area => {
      area.niveles.sort((a, b) => a.nombre.localeCompare(b.nombre));
    });

    console.log('🔄 Datos transformados:', {
      backend_raw: response.data.data,
      frontend_transformed: areas,
    });

    return {
      evaluador: {
        id_usuario: idEvaluador,
        nombre_completo: 'Evaluador', // El backend no devuelve nombre
        id_evaluador: idEvaluador, // Usar el mismo ID
      },
      areas,
    };
  }

  /**
   * Obtiene los competidores por área y nivel
   * ⚠️ IMPORTANTE: Ahora recibe id_area_nivel en lugar de idArea e idNivel separados
   */
  async getCompetidoresByAreaNivel(
    idAreaNivel: number,
    _idNivel?: number // Parámetro opcional para mantener compatibilidad
  ): Promise<CompetidoresResponse> {
    // 🔍 Si tenemos el id_area_nivel, usarlo directamente
    // De lo contrario, necesitarías implementar lógica para obtenerlo
    
    const response = await apiClient.get<CompetidoresResponse>(
      `/competidores/area-nivel/${idAreaNivel}`
    );
    
    return response.data;
  }

  /**
   * PASO 1: Crear evaluación (al hacer clic en "Calificar")
   * Estado inicial: "En Proceso"
   */
  async crearEvaluacion(
    idCompetencia: number,
    data: CrearEvaluacionRequest
  ): Promise<CrearEvaluacionResponse> {
    const response = await apiClient.post<CrearEvaluacionResponse>(
      `/competencias/${idCompetencia}/evaluacion`,
      data
    );
    return response.data;
  }

  /**
   * PASO 2: Finalizar evaluación (al hacer clic en "Guardar")
   * Estado final: "Calificado"
   */
  async finalizarEvaluacion(
    idEvaluacion: number,
    data: FinalizarEvaluacionRequest
  ): Promise<FinalizarEvaluacionResponse> {
    const response = await apiClient.post<FinalizarEvaluacionResponse>(
      `/evaluaciones/${idEvaluacion}/finalizar`,
      data
    );
    return response.data;
  }

  /**
   * Bloquea un competidor (simulación local)
   */
  async bloquearCompetidor(data: BloqueoCompetidorRequest): Promise<BloqueoCompetidorResponse> {
    try {
      const response = await apiClient.post<BloqueoCompetidorResponse>(
        '/competidores/bloqueo',
        data
      );
      return response.data;
    } catch (error) {
      console.warn('Endpoint de bloqueo no implementado, simulando...');
      return {
        success: data.accion === 'bloquear',
        message: data.accion === 'bloquear' 
          ? 'Competidor bloqueado temporalmente' 
          : 'Competidor desbloqueado',
      };
    }
  }

  /**
   * Verifica si un competidor está bloqueado
   */
  async verificarBloqueo(ci: string): Promise<BloqueoCompetidorResponse> {
    try {
      const response = await apiClient.get<BloqueoCompetidorResponse>(
        `/competidores/${ci}/estado-bloqueo`
      );
      return response.data;
    } catch (error) {
      console.warn('Endpoint de verificación no implementado, simulando...');
      return {
        success: true,
        message: 'No bloqueado',
        bloqueado_por: undefined,
      };
    }
  }
}

export const evaluacionService = new EvaluacionService();