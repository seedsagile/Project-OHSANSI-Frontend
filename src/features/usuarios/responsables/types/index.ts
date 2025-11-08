import type { Area as AreaGeneral } from '@/features/areas/types';

export type ApiAreaResponsable = {
  id_area: number;
  nombre_area: string;
};

export type ApiRolDetalle = {
  areas_responsable?: ApiAreaResponsable[];
  [key: string]: any;
};

export type ApiRolPorGestion = {
  rol: string;
  detalles: ApiRolDetalle | null;
};

export type ApiGestionRoles = {
  id_olimpiada: number;
  gestion: string;
  roles: ApiRolPorGestion[];
};

export type ApiUsuarioResponse = {
  id_usuario: number;
  nombre: string;
  apellido: string;
  ci: string;
  email: string;
  telefono: string;
  created_at: string;
  updated_at: string;
  roles_por_gestion: ApiGestionRoles[];
};

export type VerificacionUsuarioCompleta = {
  datosPersona: DatosPersonaVerificada;
  isAssignedToCurrentGestion: boolean;
  initialAreas: number[];
  gestionesPasadas: Gestion[];
  rolesPorGestion: ApiGestionRoles[];
};

export type DatosPersonaVerificada = {
  Id_usuario: number;
  Nombres: string;
  Apellidos: string;
  Correo: string;
  Ci: string;
  Teléfono: string;
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

export type AsignarResponsablePayload = {
  id_olimpiada: number;
  areas: number[];
};

export type ResponsableCreado = {
  message: string;
  [key: string]: any;
};

export type ResponsableAsignado = {
  message: string;
  [key: string]: any;
};

export type PasoRegistroResponsable =
  | 'VERIFICACION_CI'
  | 'CARGANDO_VERIFICACION'
  | 'FORMULARIO_DATOS'
  | 'CARGANDO_GUARDADO';

export type ModalFeedbackState = {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
};

export type { AreaGeneral as Area };
export type ActualizarResponsablePayload = AsignarResponsablePayload;
export type ResponsableActualizado = ResponsableAsignado;