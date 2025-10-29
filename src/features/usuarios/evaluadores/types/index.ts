import type { Area as AreaGeneral } from '@/features/areas/types';

export type DatosPersonaVerificada = {
  Id_usuario: number;
  Nombres: string;
  Apellidos: string;
  Correo: string;
  Ci: string;
  Teléfono: string;
  Rol?: {
    Id_rol: number;
    Nombre_rol: string;
  };
};

export type Gestion = {
  Id_olimpiada: number;
  gestion: string;
};

export type AreaPasadaResponse = {
  id_evaluador: number;
  Area: {
    Id_area: number;
    Nombre: string;
  };
};

// Payload para Crear (POST)
export type CrearEvaluadorPayload = {
  nombre: string;
  apellido: string;
  ci: string;
  email: string;
  password?: string;
  telefono: string;
  id_olimpiada?: number;
  areas: number[];
};

export type ActualizarEvaluadorPayload = { //
  id_olimpiada: number;
  areas: number[];
};

// Respuesta de Crear (POST)
export type EvaluadorCreado = {
  message: string;
  [key: string]: any;
};

// Respuesta de Actualizar (PUT) - Puede ser similar a la de Crear
export type EvaluadorActualizado = {
  message: string;
  [key: string]: any;
};

// Estados del flujo de registro/edición
export type PasoRegistroEvaluador = //
  | 'VERIFICACION_CI'
  | 'CARGANDO_VERIFICACION'
  | 'FORMULARIO_DATOS'
  | 'CARGANDO_GUARDADO'
  | 'READ_ONLY';

// Estado para el modal de feedback
export type ModalFeedbackState = {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
};

export type { AreaGeneral as Area }; //