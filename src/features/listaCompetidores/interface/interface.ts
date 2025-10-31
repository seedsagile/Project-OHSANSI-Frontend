// src/interface/interface.ts

export interface Area {
  id_area: number;
  nombre: string;
}

export interface Responsable {
  id: number;
  nombre: string;
  areas: Area[];
}
