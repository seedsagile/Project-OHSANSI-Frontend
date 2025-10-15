// ===============================
// 🟩 Parámetro de clasificación (Fases)
// ===============================
export interface ParametroClasificacion {
  Nota_maxima_clasificacion: number;
  Nota_minima_clasificacion: number;
  cantidad_maxima_de_clasificados: number;
  id_area: number;
  niveles: number[];
}

// ===============================
// 🟦 Área
// ===============================
export interface Area {
  id: number;
  nombre: string;
  descripcion?: string;
  created_at?: string;
  updated_at?: string;
}

// ===============================
// 🟨 Nivel
// ===============================
export interface Nivel {
  id: number;
  nombre: string;
  created_at?: string;
  updated_at?: string;
}

// ===============================
// 🟧 Relación Área-Nivel (respuesta de /api/area-niveles/{id_area})
// ===============================
export interface AreaNivel {
  id_area_nivel: number;
  id_area: number;
  id_nivel: number;
  activo: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

// ===============================
// 🟦 Interfaces para competidores
// ===============================
export interface Persona {
  id_persona: number;
  nombre: string;
  apellido: string;
  ci: string;
  fecha_nac: string;
  genero: string;
  telefono: string;
  email: string;
  created_at: string;
  updated_at: string;
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

export interface AreaAPI {
  id_area: number;
  nombre: string;
  descripcion?: string;
  activo: number;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface NivelAPI {
  id_nivel: number;
  nombre: string;
  descripcion?: string;
  orden?: number;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Competidor {
  id_competidor: number;
  id_area: number;
  id_nivel: number;
  area: AreaAPI;
  nivel: NivelAPI;
}

export interface CompetidoresResponse {
  success: boolean;
  data: Competidor[];
}
