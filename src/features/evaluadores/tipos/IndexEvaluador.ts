// src/evaluadores/tipos/IndexEvaluador.ts

// Tipo para los datos que vienen del formulario
export type FormularioDataEvaluador = {
  nombre: string;
  apellido: string;
  email: string;
  ci: string;
  password: string;
  password_confirmation: string;
  codigo_evaluador: string;
};

// Define la estructura del payload que se enviará a la API
export type PayloadEvaluador = {
  nombre: string;
  apellido: string;
  ci: string;
  email: string;
  password: string;
  password_confirmation: string;
  codigo_evaluador: string;
};

// Tipo para la respuesta de la API (basado en tu ejemplo)
export type EvaluadorResponse = {
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
      id_codigo_evaluador: number;
      id_codigo_encargado: null;
      created_at: string;
      updated_at: string;
    };
    evaluador: {
      id_evaluador: number;
      activo: boolean;
      id_persona: number;
      created_at: string;
      updated_at: string;
    };
  };
  area: string;
  nivel: string;
};

// Tipo para errores de validación con área y nivel
export type ErrorValidacionResponse = {
  errors?: {
    ci?: string[];
    email?: string[];
    [key: string]: string[] | undefined;
  };
  message?: string;
  area_email: string | null;
  nivel_email: string | null;
  area_ci: string | null;
  nivel_ci: string | null;
};

// Tipo para el error extendido con errorData
export type ErrorConData = Error & {
  errorData?: ErrorValidacionResponse;
};