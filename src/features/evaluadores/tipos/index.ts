/*export type Evaluador = {
    id: number;
    name: string;
    emailStudent: string;
    ci: string;
    codigoAcceso: string;
    imagen?: string;
};

export type CrearEvaluadorData = {
    name: string;
    emailStudent: string;
    ci: string;
    codigoAcceso: string;
    imagen?: string;
};*/

// src/features/evaluadores/types/index.ts
// Archivo opcional para centralizar los tipos si prefieres tenerlos separados

export interface Area {
  id_area: number;
  nombre: string;
}

export interface Nivel {
  id_nivel: number;
  nombre: string;
}

export interface AreaConNiveles {
  area: Area;
  niveles: Nivel[];
}

export interface Evaluador {
  id?: number;
  nombre: string;
  apellido: string;
  correo: string;
  carnet: string;
  password: string;
  areasAsignadas: AreaConNiveles[];
}

export interface CreateEvaluadorPayload {
  nombre: string;
  apellido: string;
  correo: string;
  carnet: string;
  password: string;
  areasAsignadas: {
    id_area: number;
    niveles: number[];
  }[];
}