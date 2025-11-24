export type EstadoSubFase = 'NO_INICIADA' | 'EN_EVALUACION' | 'FINALIZADA';

export interface SubFase {
  id_subfase: number;
  nombre: string;
  orden: number;
  estado: EstadoSubFase;
  cant_estudiantes: number;
  cant_evaluadores: number;
  progreso: number;
}

export interface AreaSelectorItem {
  id_area: number;
  nombre: string;
}

export interface NivelSelectorItem {
  id_nivel: number;
  nombre: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface CambioEstadoPayload {
  estado: EstadoSubFase;
}