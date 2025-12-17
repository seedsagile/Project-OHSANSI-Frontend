export type EstadoExamen = 'no_iniciada' | 'en_curso' | 'finalizada';
export type TipoRegla = 'nota_corte' | 'sumativo' | null;

export interface ConfiguracionReglas {
  nota_minima?: number;
}

export interface Examen {
  id_examen: number;
  id_competencia: number;
  nombre: string;
  ponderacion: string | number;
  maxima_nota: string | number;
  fecha_hora_inicio: string | null;
  tipo_regla: TipoRegla;
  configuracion_reglas: ConfiguracionReglas | null;
  estado_ejecucion: EstadoExamen;
  fecha_inicio_real: string | null;
}

export interface CrearExamenPayload {
  id_competencia: number;
  nombre: string;
  ponderacion: number;
  maxima_nota: number;
  fecha_hora_inicio?: string;
  tipo_regla?: TipoRegla;
  configuracion_reglas?: ConfiguracionReglas;
}

export interface EditarExamenPayload {
  id_examen: number;
  nombre: string;
  ponderacion: number;
  fecha_hora_inicio?: string;
  tipo_regla?: TipoRegla;
  configuracion_reglas?: ConfiguracionReglas;
}

export interface AreaNivelCompetencia {
  id_area: number;
  area: string;
  niveles: {
    id_area_nivel: number;
    id_nivel: number;
    nombre_nivel: string;
    id_competencia: number;
  }[];
}