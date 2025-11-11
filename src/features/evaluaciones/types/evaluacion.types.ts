// src/features/evaluaciones/types/evaluacion.types.ts

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
  estado?: 'Pendiente' | 'En calificacion' | 'Calificado';
  calificacion?: number;
  observaciones?: string;
  bloqueado_por?: number; // ID del evaluador que está calificando
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

export interface CalificacionData {
  nota: number;
  observaciones?: string;
  id_competidor: number;
  id_evaluadorAN: number;
  estado: boolean;
}

export interface CalificacionResponse {
  nota: number;
  observaciones: string;
  id_competidor: number;
  id_evaluadorAN: number;
  estado: boolean;
  fecha_evaluacion: string;
  updated_at: string;
  created_at: string;
  id_evaluacion: number;
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