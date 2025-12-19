export type CodigoFase = 'CONFIGURACION' | 'EVALUACION' | 'FINAL';

export interface CronogramaFase {
  id_cronograma_fase: number;
  id_fase_global: number;
  fecha_inicio: string;
  fecha_fin: string;
  estado: number;
}

export interface FaseGlobal {
  id_fase_global: number;
  id_olimpiada: number;
  codigo: CodigoFase;
  nombre: string;
  orden: number;
  cronograma?: CronogramaFase | null; 
}

export interface CrearFasePayload {
  nombre: string;
  codigo: CodigoFase;
  orden: number;
  fecha_inicio: string;
  fecha_fin: string;
  activar_ahora: boolean;
}

export interface ActualizarCronogramaPayload {
  fecha_inicio?: string;
  fecha_fin?: string;
  estado?: number;
}