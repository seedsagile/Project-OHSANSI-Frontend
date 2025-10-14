export type Nivel = {
  id_nivel: number;
  nombre: string;
  descripcion: string | null;
  orden: number;
  created_at: string | null;
  updated_at: string | null;
};

export type CrearNivelData = {
  nombre: string;
};
