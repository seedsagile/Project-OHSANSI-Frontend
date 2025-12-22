import type { Persona } from "./persona-Type";
import type { Institucion } from "./institucion-Type";
import type { Area } from "./area-Type";
import type { Nivel } from "./nivel-Type";

export interface Competidor {
  id_competidor: number;
  grado_escolar: string;
  departamento: string;
  nombre_tutor: string;
  contacto_tutor: string;
  contacto_emergencia: string;
  id_persona: number;
  id_institucion: number;
  id_area: number;
  id_nivel: number;
  created_at: string;
  updated_at: string;

  persona: Persona;
  institucion: Institucion;
  area: Area;
  nivel: Nivel;
}
