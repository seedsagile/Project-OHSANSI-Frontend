 export interface RolGlobal {
  id: number;
  nombre: string;
}

export interface AccionSistema {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
}

export interface PermisoRol {
  id_rol: number;
  id_accion: number;
  activo: boolean;
}

export interface MatrizRolesUI {
  roles: RolGlobal[];
  acciones: AccionSistema[];
  permisos: PermisoRol[];
}

export interface ApiResponseWrapper<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiAccionMaestra {
  id_accion_sistema: number;
  codigo: string;
  nombre: string;
  descripcion: string;
}

// GET /api/roles/matriz
export interface ApiRolDetalle {
  id_rol: number;
  nombre: string;
}

export interface ApiAccionRol {
  id_rol_accion: number;
  id_accion_sistema: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

export interface ApiRolData {
  rol: ApiRolDetalle;
  acciones: ApiAccionRol[];
}

// POST /api/roles/matriz
export interface PayloadAccionRol {
  id_accion_sistema: number;
  activo: boolean;
}

export interface PayloadRolItem {
  id_rol: number;
  acciones: PayloadAccionRol[];
}

export interface GuardarRolesPayload {
  user_id: number;
  roles: PayloadRolItem[];
}