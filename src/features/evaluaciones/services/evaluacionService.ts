// src/features/evaluaciones/services/evaluacionService.ts

import apiClient from '@/api/ApiPhp';
import { areasService } from '../../areas/services/areasService';
import { nivelesService } from '../../niveles/services/nivelesService';
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
  Competencia,
  Examen,
  DescalificarCompetidorRequest,
  DescalificarCompetidorResponse,
  BackendAreaNivelItem,
} from '../types/evaluacion.types';

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
    const [response, areasFull, nivelesFull] = await Promise.all([
      apiClient.get<BackendAreasNivelesResponse>(`/evaluadores/${idEvaluador}/areas-niveles`),
      areasService.obtenerAreas(),
      nivelesService.obtenerNiveles(),
    ]);

    const rawMappings = response.data.data;
    const areasMap = new Map<string, Area>();
    const areaNameToId = new Map(areasFull.map(a => [a.nombre, a.id_area]));
    const nivelNameToId = new Map(nivelesFull.map(n => [n.nombre, n.id_nivel]));

    rawMappings.forEach(item => {
      const areaKey = item.area;
      const idArea = areaNameToId.get(item.area);

      if (!idArea) {
        console.warn(`No se encontró ID para el área: ${item.area}`);
        return;
      }

      if (!areasMap.has(areaKey)) {
        areasMap.set(areaKey, {
          id_area: idArea,
          nombre_area: item.area,
          niveles: [],
        });
      }

      const area = areasMap.get(areaKey)!;
      const idNivel = nivelNameToId.get(item.nivel);

      if (!idNivel) {
        console.warn(`No se encontró ID para el nivel: ${item.nivel}`);
        return;
      }

      const nivelExiste = area.niveles.some(n => n.id_nivel === idNivel);

      if (!nivelExiste) {
        area.niveles.push({
          id_nivel: idNivel,
          nombre: item.nivel,
          id_area_nivel: item.id_area_nivel,
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
      backend_raw: rawMappings,
      frontend_transformed: areas,
    });

    return {
      evaluador: {
        id_usuario: idEvaluador,
        nombre_completo: 'Evaluador', // El backend no devuelve nombre
        id_evaluador: idEvaluador, // Usar el mismo ID
      },
      areas,
      mappings: rawMappings,
    };
  }


  /**
   * Obtiene las competencias por ID de área-nivel.
   * La respuesta de la API incluye los exámenes anidados en cada competencia.
   * También genera un nombre para cada competencia, ya que la API no lo proporciona.
   */
  async getCompetenciasPorAreaNivel(idAreaNivel: number): Promise<Competencia[]> {
    const response = await apiClient.get<Competencia[]>(`/area-nivel/${idAreaNivel}/competencias`);
    
    // La API devuelve un array directamente.
    // Además, generamos el `nombre` que no viene en la respuesta.
    return response.data.map(c => ({
      ...c,
      nombre: `Competencia ${c.id_competencia}`,
    }));
  }

  async getExamenesPorCompetencia(idCompetencia: number): Promise<Examen[]> {
    const response = await apiClient.get<Examen[]>(`/competencias/${idCompetencia}/examenes`);
    return response.data || [];
  }
  
  async getExamenById(idExamen: number): Promise<Examen> {
    const response = await apiClient.get<Examen>(`/examenes/${idExamen}`);
    return response.data;
  }

  /**
   * Obtiene los competidores por área y nivel
   * ⚠️ IMPORTANTE: Ahora recibe id_area_nivel en lugar de idArea e idNivel separados
   */
  async getCompetidores(
    idCompetencia: number,
    idArea: number,
    idNivel: number
  ): Promise<CompetidoresResponse> {
    const response = await apiClient.get<CompetidoresResponse>(
      `/competencias/${idCompetencia}/area/${idArea}/nivel/${idNivel}/competidores`
    );
    
    return response.data;
  }

  /**
   * PASO 1: Crear evaluación (al hacer clic en "Calificar")
   * Estado inicial: "En Proceso"
   */
  async crearEvaluacion(
    idExamen: number,
    data: CrearEvaluacionRequest
  ): Promise<CrearEvaluacionResponse> {
    console.log('DEBUG: Enviando a /examenes/{idExamen}/evaluaciones', {
      idExamen,
      payload: data,
    });
    const response = await apiClient.post<CrearEvaluacionResponse>(
      `/examenes/${idExamen}/evaluaciones`,
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
  
    /**
   * ================= DESCALIFICAR COMPETIDOR (ADMINISTRATIVO) =================
   * Descalifica a un competidor en cualquier momento, sin necesidad de una evaluación en curso.
   * Esto actualiza el estado del competidor a 'DESCALIFICADO' y crea un registro de auditoría.
   */
  async descalificarCompetidor(
    idCompetidor: number,
    data: DescalificarCompetidorRequest
  ): Promise<DescalificarCompetidorResponse> {
    const response = await apiClient.post<DescalificarCompetidorResponse>(
      `/competidores/${idCompetidor}/descalificar`,
      data
    );
    return response.data;
  }
}

export const evaluacionService = new EvaluacionService();