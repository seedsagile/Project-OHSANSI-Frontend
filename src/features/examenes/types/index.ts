// src/features/examenes/types/index.ts

export type Examen = {
  id_examen_conf: number;
  id_competencia: number;
  nombre: string;
  ponderacion: number;
  maxima_nota: number;
  created_at: string;
  updated_at: string;
};

export type CrearExamenData = {
  nombre: string;
  ponderacion: number;
  maxima_nota: number;
};

export type ExamenTabla = {
  nro: number;
  nombre: string;
  ponderacion: number;
  maxima_nota: number;
};