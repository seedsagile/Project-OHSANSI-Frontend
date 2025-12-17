export type EstadoFase = 'borrador' | 'publicada' | 'en_proceso' | 'concluida' | 'avalada';

export interface Competencia {
  id_competencia: number;
  id_fase_global: number;
  id_area_nivel: number;
  nivel: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado_fase: EstadoFase;
  criterio_clasificacion: string;
  id_usuario_aval: number | null;
  fecha_aval: string | null;
}

export interface AreaFiltro {
  id_area: number;
  nombre: string;
}

export interface FaseGlobal {
  id_fase_global: number;
  id_olimpiada: number;
  codigo: string;
  nombre: string;
  orden: number;
}

export interface NivelFiltro {
  id_area_nivel: number;
  nivel: string;
}

export interface CrearCompetenciaPayload {
  id_fase_global: number;
  id_area_nivel: number;
  fecha_inicio: string;
  fecha_fin: string;
  criterio_clasificacion: string;
}