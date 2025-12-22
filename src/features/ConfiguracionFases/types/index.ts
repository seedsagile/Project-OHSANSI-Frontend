export interface Gestion {
  id: number;
  nombre: string;
  gestion: string;
  esActual: boolean;
}

export interface FaseGlobal {
  id: number;
  codigo: string;
  nombre: string;
  orden?: number;
}

export interface AccionSistema {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
}

export interface PermisoFase {
  id_fase: number;
  id_accion: number;
  habilitado: boolean;
}

export interface ConfiguracionUI {
  gestion: Gestion | null;
  fases: FaseGlobal[];
  acciones: AccionSistema[];
  permisos: PermisoFase[];
}

export interface ApiResponseWrapper<T> {
  status?: string;
  success?: boolean;
  data: T;
  count?: number;
}

export interface ApiAccionMaestra {
  id_accion_sistema: number;
  codigo: string;
  nombre: string;
  descripcion: string;
}

export interface ApiFaseDetalle {
  id: number;
  nombre: string;
  codigo: string;
  orden: number;
}

export interface ApiAccionConfigurada {
  id_configuracion_accion: number;
  id_accion_sistema: number;
  codigo: string;
  nombre_accion: string;
  habilitada: boolean;
}

export interface ApiFaseData {
  fase: ApiFaseDetalle;
  acciones: ApiAccionConfigurada[];
}

export type ApiConfiguracionResponse = Record<string, ApiFaseData>;

export interface ConfigAccionPayload {
  id_accion_sistema: number;
  id_fase_global: number;
  habilitada: boolean;
}

export interface GuardarConfiguracionPayload {
  user_id: number;
  accionesPorFase: ConfigAccionPayload[];
}