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