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
};

export type AsignacionPayload = {
  id_area: number;
  id_nivel: number;
  activo: boolean;
};

// Nuevo tipo para Grado de Escolaridad
export type Grado = {
  id_grado: number;
  nombre: string;
  id_nivel: number;
};

// Tipo para almacenar grados seleccionados por nivel
export type GradosPorNivel = {
  [id_nivel: number]: Set<number>; // id_nivel -> Set de id_grados
};