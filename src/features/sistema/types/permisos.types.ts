export interface AccionSistema {
  codigo: string;
  nombre: string;
  descripcion: string;
}

export interface DebugEstado {
  olimpiada_activa: string;
  fase_detectada: string;
  cronograma_activo: boolean;
}

export interface UserCapabilities {
  user_id: number;
  usuario: string;
  roles: string[];
  debug_estado: DebugEstado;
  acciones_permitidas: AccionSistema[];
}

export interface CapabilitiesResponse {
  success: boolean;
  data: UserCapabilities;
  message: string;
}

export type SystemPermissionCode = 
  | 'DASHBOARD'
  | 'OLIMPIADAS'
  | 'CRONOGRAMA'
  | 'AREAS'
  | 'NIVELES'
  | 'ASIGNACIONES'
  | 'RESPONSABLES'
  | 'EVALUADORES'
  | 'INSCRIPCION'
  | 'COMPETIDORES'
  | 'COMPETENCIAS'
  | 'EXAMENES'
  | 'SALA_EVALUACION'
  | 'MEDALLERO'
  | 'PARAMETROS'
  | 'ACTIVIDADES_FASES'
  | 'GESTIONAR_ROLES'
  | 'REPORTES'
  | 'REPORTES_CAMBIOS'
  | 'CONFIGURAR_SISTEMA';