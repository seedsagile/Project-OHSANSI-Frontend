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

export interface SubFasesResponse {
  data: SubFase[];
  message: string;
}