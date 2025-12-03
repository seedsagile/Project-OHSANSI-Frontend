// src/features/medallero/types/medallero.types.ts

export interface MedalData {
  id_area_nivel: number;
  nombre_nivel: string;
  oro: number;
  plata: number;
  bronce: number;
  menciones: number;
  ya_parametrizado?: boolean;
}

export interface Area {
  id_area: number;
  nombre_area: string;
  gestion: string;
}

export interface Nivel {
  id_area_nivel: number;
  id_nivel: number;
  nombre_nivel: string;
  gestion: string;
  oro?: number;
  plata?: number;
  bronce?: number;
  menciones?: number;
  ya_parametrizado?: boolean;
}

export interface AreasResponse {
  success: boolean;
  data: {
    areas: Area[];
  };
}

export interface NivelesResponse {
  success: boolean;
  data: {
    niveles: Nivel[];
  };
}

export interface MedalleroSaveData {
  id_area_nivel: number;
  oro: number;
  plata: number;
  bronce: number;
  menciones: number;
}