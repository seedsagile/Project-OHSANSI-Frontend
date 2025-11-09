export type ApiAsignacionDetalle = {
  id_area_nivel: number;
  nombre_area: string;
  nombre_nivel: string;
  nombre_grado: string;
};

export type ApiRolDetalle = {
  asignaciones_evaluador?: ApiAsignacionDetalle[];
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

export type VerificacionUsuarioCompleta = {
  datosPersona: DatosPersonaVerificada;
  isAssignedToCurrentGestion: boolean;
  initialAsignaciones: ApiAsignacionDetalle[];
  gestionesPasadas: Gestion[];
  rolesPorGestion: ApiGestionRoles[];
};

export type NivelParaAsignar = {
  id_area_nivel: number;
  id_nivel: number;
  nombre: string;
};

export type AreaParaAsignar = {
  id_area: number;
  area: string;
  niveles: NivelParaAsignar[];
};

export type CrearEvaluadorPayload = {
  nombre: string;
  apellido: string;
  ci: string;
  email: string;
  telefono: string;
  password?: string;
  id_olimpiada?: number;
  area_nivel_ids: number[];
};

export type AsignarEvaluadorPayload = {
  id_olimpiada: number;
  area_nivel_ids: number[];
};

export type EvaluadorCreado = {
  message: string;
  [key: string]: any;
};

export type EvaluadorAsignado = {
  message: string;
  [key: string]: any;
};

export type PasoRegistroEvaluador =
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

export type { AreaParaAsignar as Area };
export type { NivelParaAsignar as Nivel };

export type EvaluadorActualizado = EvaluadorAsignado;