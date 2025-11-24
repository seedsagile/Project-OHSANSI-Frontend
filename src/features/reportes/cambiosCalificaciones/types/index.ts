export type TipoAccion = 'Modificar' | 'Calificar' | 'Desclasificar';
export interface HistorialCambio {
  readonly id_historial: number;
  readonly fecha_hora: string;
  readonly nombre_evaluador: string;
  readonly nombre_olimpista: string;
  readonly area: string;
  readonly nivel: string;
  readonly accion: TipoAccion;
  readonly observacion: string | null;
  readonly descripcion: string;
  readonly id_area: number;
  readonly id_nivel: number;
  readonly nota_anterior?: number;
  readonly nota_nueva?: number;
}

export interface NivelOpcion {
  id: number;
  nombre: string;
  disabled?: boolean;
}

export interface FiltrosReporteState {
  areaId: number | null;
  nivelesIds: Set<number>;
  terminoBusqueda: string;
}