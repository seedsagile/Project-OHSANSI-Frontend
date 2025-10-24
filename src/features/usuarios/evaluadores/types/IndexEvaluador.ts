// src/features/evaluadores/tipos/IndexEvaluador.ts

// ==================== TIPOS DE ÁREA ====================
export interface Area {
  id_area: number;
  nombre: string;
}

// ==================== TIPOS DE NIVEL ====================
export interface Nivel {
  id_nivel: number;
  nombre: string;
}

// ==================== TIPOS DE EVALUADOR ====================
export interface AreaConNiveles {
  area: Area;
  niveles: Nivel[];
}

// Estructura para cada área con sus niveles en el payload
export interface AreaNivelPayload {
  area: number;
  niveles: number[];
}

// Payload que se envía al backend para crear evaluador
export interface CreateEvaluadorPayload {
  nombre: string;
  apellido: string;
  ci: string;
  email: string;
  password: string;
  areas_niveles: AreaNivelPayload[];
}

// Respuesta del backend al crear evaluador
export interface EvaluadorResponse {
  evaluador: {
    nombre: string;
    apellido: string;
    ci: string;
    email: string;
    updated_at: string;
    created_at: string;
    id_persona: number;
    usuario: {
      id_usuario: number;
      nombre: string;
      rol: string;
      id_persona: number;
      id_codigo_evaluador: number | null;
      id_codigo_encargado: number | null;
      created_at: string;
      updated_at: string;
    };
    evaluador: {
      id_evaluador: number;
      activo: boolean;
      id_persona: number;
      id_area: number;
      id_nivel: number;
      created_at: string;
      updated_at: string;
    };
  };
}

// Tipo para errores de validación
export interface ErrorValidacionResponse {
  errors?: {
    ci?: string[];
    email?: string[];
    [key: string]: string[] | undefined;
  };
  message?: string;
}

// Tipo para el error extendido
export type ErrorConData = Error & {
  errorData?: ErrorValidacionResponse;
};
