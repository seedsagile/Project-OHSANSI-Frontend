export type AreaNivel = {
  id_area_nivel: number;
  id_area: number;
  id_nivel: number;
  activo: boolean;
  created_at: string | null;
  updated_at: string | null;
};

export type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export type AsignacionPayload = {
  id_area: number;
  id_nivel: number;
  activo: boolean;
};
