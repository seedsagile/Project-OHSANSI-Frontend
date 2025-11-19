export interface FaseGlobal {
  id_fase: number;
  nombre: string;
  codigo: string;
  orden: number;
  activa: boolean;
  descripcion?: string;
}

export interface AccionSistema {
  id_accion: number;
  nombre: string;
  codigo: string;
  categoria: 'Gestión' | 'Evaluación' | 'Resultados' | 'Sistema' | string; 
  descripcion?: string;
}

export interface PermisoFase {
  id_fase: number;
  id_accion: number;
  habilitado: boolean;
}

export interface MatrizConfiguracionResponse {
  gestion: string;
  fases: FaseGlobal[];
  acciones: AccionSistema[];
  permisos: PermisoFase[];
}

export interface GuardarConfiguracionPayload {
  id_gestion: number;
  permisos: PermisoFase[];
}