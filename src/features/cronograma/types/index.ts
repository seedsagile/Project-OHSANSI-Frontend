export interface FaseGlobal {
  id_fase_global: number;
  id_olimpiada: number;
  codigo: string;
  nombre: string;
  orden: number;
  created_at: string;
  updated_at: string;
}

export interface CronogramaFase {
  id_cronograma_fase: number;
  id_fase_global: number;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string | null;
  created_at: string | null;
  updated_at: string | null;
  fase_global: {
    id_fase_global: number;
    nombre: string;
    codigo: string;
    orden: number;
  };
}


export interface FaseCalendario {
  id_fase_global: number;
  nombre: string;
  codigo: string;
  orden: number;

  id_cronograma_fase?: number; 
  fecha_inicio?: string;
  fecha_fin?: string;
  estado?: string | null;

  esta_configurada: boolean;
}

export interface CrearCronogramaPayload {
  id_fase_global: number;
  fecha_inicio: string;
  fecha_fin: string;
  descripcion?: string;
}

export interface ActualizarCronogramaPayload {
  fecha_inicio: string;
  fecha_fin: string;
  estado?: string | null;
}

export interface EditarCronogramaPayload extends ActualizarCronogramaPayload {
  id_cronograma_fase: number;
  id_fase_global: number;
}