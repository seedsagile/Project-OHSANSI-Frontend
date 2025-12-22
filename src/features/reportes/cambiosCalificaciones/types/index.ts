export type TipoAccion = 'Modificar' | 'Calificar' | 'Desclasificar';

export interface HistorialCambio {
  readonly id_historial: number;
  readonly fecha_hora: string;
  readonly nombre_evaluador: string;
  readonly nombre_olimpista: string;
  readonly institucion: string;
  readonly grado_escolaridad: string;
  readonly area: string;
  readonly nivel: string;
  readonly accion: TipoAccion;
  readonly tipo_cambio: string;
  readonly observacion: string | null;
  readonly descripcion: string;
  readonly id_area?: number; 
  readonly id_nivel?: number;
  readonly nota_anterior: number;
  readonly nota_nueva: number;
  readonly diferencia: number;
}

export interface MetaPaginacion {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ReporteResponse {
  success: boolean;
  data: HistorialCambio[];
  meta: MetaPaginacion;
}

export interface NivelNested {
  id_area_nivel: string;
  id_nivel: string;
  nombre: string;
}

export interface AreaNested {
  id_area: string;
  area: string;
  niveles: NivelNested[];
}

export interface AreasNivelesResponse {
  areas: AreaNested[];
}

export interface AreaFiltro {
  id_area: number;
  nombre: string;
}

export interface NivelFiltro {
  id_nivel: number;
  nombre: string;
}