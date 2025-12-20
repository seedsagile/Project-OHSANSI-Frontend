export type SystemStatus = 'active' | 'sin_gestion' | 'loading' | 'error';

export interface Olimpiada {
  id_olimpiada: number;
  nombre: string;
  gestion: string;
  estado: boolean;
  created_at?: string;
  updated_at?: string;
}

interface BaseSistemaResponse {
  mensaje?: string;
  server_timestamp?: string;
}

export interface SistemaSinGestionResponse extends BaseSistemaResponse {
  status: 'sin_gestion';
  gestion_actual: null;
  fase_global_activa: null;
  cronograma_vigente: null;
}

export interface SistemaActivoResponse extends BaseSistemaResponse {
  status: 'active';
  gestion_actual: Olimpiada;
  fase_global_activa: {
    id: number;
    nombre: string;
    estado: string;
  } | null;
  cronograma_vigente: {
    id: number;
    fecha_inicio: string;
    fecha_fin: string;
    mensaje: string;
    en_fecha: boolean;
  } | null;
}

export type SistemaStateData = SistemaSinGestionResponse | SistemaActivoResponse;

export interface CrearGestionPayload {
  nombre: string;
  anio: string;
  activar: boolean;
}

export interface CrearGestionResponse {
  success: boolean;
  message: string;
  data: Olimpiada;
}