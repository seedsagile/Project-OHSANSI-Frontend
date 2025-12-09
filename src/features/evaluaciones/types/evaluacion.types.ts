// src/features/evaluaciones/types/evaluacion.types.ts

export interface Nivel {
  id_nivel: number;
  nombre: string;
  id_area_nivel: number;
}

export interface Area {
  id_area: number;
  nombre_area: string;
  niveles: Nivel[];
}

export interface BackendAreaNivelItem {
  id_evaluador_an: number;
  id_area_nivel: number;
  area: string;
  nivel: string;
  gestion: string;
}

export interface Evaluador {
  id_usuario: number;
  nombre_completo: string;
  id_evaluador: number;
}

export interface EvaluadorAreasNiveles {
  evaluador: Evaluador;
  areas: Area[];
  mappings: BackendAreaNivelItem[];
}

export type Competencia = {
  id_competencia: number;
  id_area_nivel: number;
  nombre: string; // Asumiendo que la competencia tiene un nombre
  fecha_inicio: string;
  fecha_fin: string;
  estado: boolean;
  examenes: Examen[];
};

export type Examen = {
  id_examen_conf: number;
  id_competencia: number;
  nombre: string;
  ponderacion: number;
  maxima_nota: number;
};

export interface Competidor {
  id_competidor: number;
  nombre: string;
  apellido: string;
  ci: string;
  estado: 'Calificado' | 'En Proceso' | 'Pendiente' | 'DESCALIFICADO' | 'disponible para calificar';
  calificacion?: number;
}

export interface CompetidoresResponse {
  success: boolean;
  data: Competidor[];
}

export interface DescalificarCompetidorRequest {
  observaciones: string;
}

export interface DescalificarCompetidorResponse {
  success: boolean;
  message: string;
}

// ==================== Tipos para el Flujo de Calificación ====================

export interface CrearEvaluacionRequest {
  id_competidor: number;
  id_evaluador_an: number;
}

export interface CrearEvaluacionResponse {
  id_evaluacion: number;
  id_competidor: number;
  id_examen_conf: number;
  id_evaluador_an: number;
  nota: string;
  estado_competidor: string;
  fecha: string;
  estado: boolean;
  created_at: string;
  updated_at: string;
}

export interface FinalizarEvaluacionRequest {
  nota: number;
  observaciones: string;
}

export interface FinalizarEvaluacionResponse {
  success: boolean;
  message: string;
  nota: string;
  observaciones: string;
}
