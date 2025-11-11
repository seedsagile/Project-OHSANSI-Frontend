// src/features/evaluaciones/services/evaluacionService.ts

import apiClient from '@/api/ApiPhp';
import type {
  EvaluadorAreasNiveles,
  CompetidoresResponse,
  CalificacionData,
  CalificacionResponse,
  BloqueoCompetidorRequest,
  BloqueoCompetidorResponse,
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
   * Bloquea un competidor para que solo el evaluador actual pueda calificarlo
   * TODO: Implementar endpoint en backend: POST /competidores/bloqueo
   */
  async bloquearCompetidor(data: BloqueoCompetidorRequest): Promise<BloqueoCompetidorResponse> {
    try {
      const response = await apiClient.post<BloqueoCompetidorResponse>(
        '/competidores/bloqueo',
        data
      );
      return response.data;
    } catch (error) {
      // Si el endpoint no existe aún, simular comportamiento
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
   * TODO: Implementar endpoint en backend: GET /competidores/{ci}/estado-bloqueo
   */
  async verificarBloqueo(ci: string): Promise<BloqueoCompetidorResponse> {
    try {
      const response = await apiClient.get<BloqueoCompetidorResponse>(
        `/competidores/${ci}/estado-bloqueo`
      );
      return response.data;
    } catch (error) {
      // Si el endpoint no existe aún, simular que no está bloqueado
      console.warn('Endpoint de verificación no implementado, simulando...');
      return {
        success: true,
        message: 'No bloqueado',
        bloqueado_por: undefined,
      };
    }
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