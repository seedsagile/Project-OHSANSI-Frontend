// src/features/competencias/types/index.ts

export type Competencia = {
  id_competencia: number;
  id_area_nivel: number;
  fecha_inicio: string;
  fecha_fin: string;
  estado: boolean;
  created_at: string;
  updated_at: string;
  // Datos adicionales para mostrar en la tabla
  area?: string;
  nivel?: string;
};

export type CrearCompetenciaData = {
  id_area_nivel: number;
  fecha_inicio: string;
  fecha_fin: string;
};

export type AreaConNiveles = {
  id_area: number;
  area: string;
  niveles: Nivel[];
};

export type Nivel = {
  id_area_nivel: number;
  id_nivel: number;
  nombre: string;
};

export type AreasConNivelesResponse = {
  areas: AreaConNiveles[];
};