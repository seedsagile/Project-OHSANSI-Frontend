// src/features/evaluaciones/types/evaluacion.types.ts

export interface Evaluacion {
  id_evaluacion: number;
  nota: string;
  observaciones: string | null;
  fecha_evaluacion: string;
  estado: string;
  id_competidor: number;
  id_competencia: number;
  id_evaluadorAN: number | null;
  id_parametro: number | null;
}

export interface Competidor {
  id_competidor?: number;
  apellido: string;
  nombre: string;
  genero: string;
  ci: string;
  departamento: string;
  colegio: string;
  area: string;
  nivel: string;
  grado: string;
  id_olimpiada?: number;
  evaluaciones?: Evaluacion[]; // Array de evaluaciones del API
  estado?: 'Pendiente' | 'En calificacion' | 'Calificado';
  calificacion?: number;
  observaciones?: string;
  bloqueado_por?: number;
  id_evaluacion?: number; // Para guardar el ID de la evaluación activa
}

export interface Area {
  id_area: number;
  nombre_area: string;
  niveles: Nivel[];
}

export interface Nivel {
  id_nivel: number;
  nombre: string;
}

export interface EvaluadorAreasNiveles {
  evaluador: {
    id_usuario: number;
    nombre_completo: string;
  };
  areas: Area[];
}

// Request para crear evaluación
export interface CrearEvaluacionRequest {
  id_competidor: number;
  id_evaluadorAN: number;
}

// Response al crear evaluación
export interface CrearEvaluacionResponse {
  id_evaluacion: number;
  id_competidor: number;
  id_evaluadorAN: number;
  id_competencia: number;
  id_parametro: number;
  estado: string;
  nota: number;
  fecha_evaluacion: string;
  created_at: string;
  updated_at: string;
}

// Request para finalizar evaluación
export interface FinalizarEvaluacionRequest {
  nota: number;
  observaciones?: string;
}

// Response al finalizar evaluación
export interface FinalizarEvaluacionResponse {
  id_evaluacion: number;
  nota: number;
  observaciones: string;
  fecha_evaluacion: string;
  estado: string;
  id_competidor: number;
  id_competencia: number;
  id_evaluadorAN: number;
  id_parametro: number;
  created_at: string;
  updated_at: string;
}

export interface CompetidoresResponse {
  success: boolean;
  data: {
    competidores: Competidor[];
  };
  message: string;
}

export interface BloqueoCompetidorRequest {
  ci: string;
  id_evaluador: number;
  accion: 'bloquear' | 'desbloquear';
}

export interface BloqueoCompetidorResponse {
  success: boolean;
  message: string;
  bloqueado_por?: number;
}