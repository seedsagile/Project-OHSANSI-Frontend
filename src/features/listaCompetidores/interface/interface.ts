// src/interface/interface.ts

export interface Persona {
  id_persona: number;
  nombre: string;
  apellido: string;
  ci: string;
  fecha_nac: string;
  genero: string;
  telefono: string;
  email: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface Institucion {
  id_institucion: number;
  nombre: string;
  tipo: string;
  departamento: string;
  direccion: string;
  telefono: string | null;
  id_persona: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Area {
  id_area: number;
  nombre: string;
  descripcion: string;
  activo: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface Nivel {
  id_nivel: number;
  nombre: string;
  descripcion: string;
  orden: number;
  created_at: string | null;
  updated_at: string | null;
}

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

export interface CompetidoresResponse {
  success: boolean;
  data: Competidor[];
}
