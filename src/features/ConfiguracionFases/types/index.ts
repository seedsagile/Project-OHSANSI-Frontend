export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

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

export interface PermisoFaseDetalle {
  idFase: number;
  habilitada: boolean;
}

export interface AccionSistema {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  porFase: PermisoFaseDetalle[];
}

export interface MatrizConfiguracionResponse {
  gestion: { 
    id: number; 
    gestion: string;
  };
  fases: FaseGlobal[];
  acciones: AccionSistema[];
}

export interface PermisoFasePayload {
  idAccion: number;
  idFase: number;
  habilitada: boolean;
}

export interface GuardarConfiguracionPayload {
  fases: number[];
  accionesPorFase: PermisoFasePayload[];
}

export interface PermisoFase {
  id_fase: number;
  id_accion: number;
  habilitado: boolean;
}