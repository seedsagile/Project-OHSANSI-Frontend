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
  evaluaciones?: Evaluacion[];
  estado?: 'Pendiente' | 'En Proceso' | 'Calificado'; // 👈 Agregado "En Proceso"
  calificacion?: number;
  observaciones?: string;
  bloqueado_por?: number;
  id_evaluacion?: number;
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

export interface CrearEvaluacionRequest {
  id_competidor: number;
  id_evaluadorAN: number;
}

export interface CrearEvaluacionResponse {
  id_evaluacion: number;
  id_competidor: number;
  id_evaluadorAN: number;
  id_competencia: number;
  id_parametro: number;
  estado: string;
  nota: string;
  fecha_evaluacion: string;
  created_at: string;
  updated_at: string;
  observaciones?: string;
}

export interface FinalizarEvaluacionRequest {
  nota: number;
  observaciones?: string;
}

export interface FinalizarEvaluacionResponse {
  id_evaluacion: number;
  nota: string;
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