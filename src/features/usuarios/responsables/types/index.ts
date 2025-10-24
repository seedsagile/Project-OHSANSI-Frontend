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
  // TODO: Confirmar con Backend cómo se indicará si ya está en la gestión actual para Escenario 3
  // Propiedades conceptuales para Escenario 3:
  // estaEnGestionActual?: boolean;
  // areasEnGestionActual?: number[]; // IDs de áreas si ya está en la gestión actual
};

export type Gestion = {
  Id_olimpiada: number;
  gestion: string;
};

export type AreaPasadaResponse = {
  id_responsable_area: number;
  Area: {
    Id_area: number;
    Nombre: string;
  };
};

export type CrearResponsablePayload = {
  nombre: string;
  apellido: string;
  ci: string;
  email: string;
  password?: string;
  telefono: string;
  id_olimpiada?: number;
  areas: number[];
};

export type ResponsableCreado = {
  message: string;
  [key: string]: any;
};

export type PasoRegistroResponsable =
  | 'VERIFICACION_CI'
  | 'CARGANDO_VERIFICACION'
  | 'FORMULARIO_DATOS'
  | 'CARGANDO_GUARDADO'
  | 'READ_ONLY';

export type ModalFeedbackState = {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
};

export type { AreaGeneral as Area };