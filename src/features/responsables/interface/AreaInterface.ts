// src/modules/responsable/types/IndexResponsable.ts
export interface AreaInterface {
  nombre: string;
  apellido: string;
  ci: string; // carnet de identidad
  email: string;
  password: string;
  areas: number[]; // IDs de las áreas asignadas
}
