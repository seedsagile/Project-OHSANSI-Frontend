// src/features/evaluaciones/services/evaluacionService.ts

import apiClient from '@/api/ApiPhp';
import type {
  EvaluadorAreasNiveles,
  CompetidoresResponse,
  CalificacionData,
  CalificacionResponse,
} from '../types/evaluacion.types';

class EvaluacionService {
  /**
   * Obtiene las áreas y niveles asignados a un evaluador
   */
  async getAreasNivelesByEvaluador(idEvaluador: number): Promise<EvaluadorAreasNiveles> {
    const response = await apiClient.get<EvaluadorAreasNiveles>(
      `/evaluadores/${idEvaluador}/areas-niveles`
    );
    return response.data;
  }

  /**
   * Obtiene los competidores por área y nivel
   */
  async getCompetidoresByAreaNivel(
    idArea: number,
    idNivel: number
  ): Promise<CompetidoresResponse> {
    const response = await apiClient.get<CompetidoresResponse>(
      `/competidores/area/${idArea}/nivel/${idNivel}`
    );
    return response.data;
  }

  /**
   * Guarda o actualiza la evaluación de un competidor
   */
  async guardarEvaluacion(
    idCompetencia: number,
    data: CalificacionData
  ): Promise<CalificacionResponse> {
    const response = await apiClient.post<CalificacionResponse>(
      `/competencias/${idCompetencia}/evaluacion`,
      data
    );
    return response.data;
  }
}

export const evaluacionService = new EvaluacionService();