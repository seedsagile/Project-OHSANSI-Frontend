export type AreaNivel = {
  id_area_nivel: number;
  id_area: number;
  id_nivel: number;
  activo: boolean;
  created_at: string | null;
  updated_at: string | null;
};

export type NivelAsignado = {
  id_nivel: number;
  nombre: string;
  asignado_activo: boolean;
};

export type AreaConNiveles = {
  id_area: number;
  nombre: string;
  niveles: NivelAsignado[];
};

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
  olimpiada_actual?: string;
  success_count?: number;
  created_count?: number;
  error_count?: number;
  errors?: string[];
  distribucion?: Record<string, number>;
};

// ACTUALIZADO: Payload con id_grado_escolaridad
export type AsignacionPayload = {
  id_area: number;
  id_nivel: number;
  id_grado_escolaridad: number;
  activo: boolean;
};

export type Area = {
  id_area: number;
  nombre: string;
  created_at: string | null;
  updated_at: string | null;
};

export type Nivel = {
  id_nivel: number;
  nombre: string;
  created_at: string;
  updated_at: string;
};

export type Grado = {
  id_grado_escolaridad: number;
  nombre: string;
  created_at: string;
  updated_at: string;
};

export type GradosPorNivel = {
  [id_nivel: number]: Set<number>;
};

// NUEVO: Tipos para el GET de niveles y grados asignados
export type NivelConGrados = {
  id_nivel: number;
  nombre_nivel: string;
  grados: {
    id_grado_escolaridad: number;
    nombre: string;
  }[];
};

export type AreaNivelesResponse = {
  success: boolean;
  data: {
    area: {
      id_area: number;
      nombre: string;
    };
    olimpiada: {
      id_olimpiada: number;
      gestion: string;
      nombre: string;
    };
    niveles_con_grados_agrupados: NivelConGrados[];
    total_relaciones: number;
    total_niveles: number;
  };
  message: string;
};