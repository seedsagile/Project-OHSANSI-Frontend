export interface AccionSistema {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
}

export interface FaseGlobal {
  id: number;
  nombre: string;
  codigo: string;
  orden: number;
}

export interface PermisoFase {
  id_fase: number;
  id_accion: number;
  habilitado: boolean;
  id_configuracion_accion: number;
}

export interface ApiAccionMaestra {
  id_accion_sistema: number;
  codigo: string;
  nombre: string;
  descripcion: string;
}

export interface ApiConfiguracionDetalle {
  id_configuracion_accion: number;
  id_accion_sistema: number;
  habilitada: boolean;
}

export interface ApiFaseDetalle {
  id: number;
  nombre: string;
  codigo: string;
  orden: number;
}

export interface ApiConfiguracionItem {
  fase: ApiFaseDetalle;
  acciones: ApiConfiguracionDetalle[];
}

export interface ApiConfiguracionResponse {
  [key: string]: ApiConfiguracionItem;
}

export interface ApiResponseWrapper<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface Gestion {
  id: number;
  gestion: string | number;
  esActual: boolean;
  activa: boolean;
}

export interface ConfiguracionUI {
  gestion: Gestion | null;
  fases: FaseGlobal[];
  acciones: AccionSistema[];
  permisos: PermisoFase[];
}

// NUEVOS TIPOS PARA EL POST (Payload)
export interface ConfigPayloadItem {
  id_configuracion_accion: number;
  habilitada: boolean;
}

export interface GuardarConfiguracionPayload {
  user_id: number;
  configuraciones: ConfigPayloadItem[];
}