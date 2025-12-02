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

export type ModalState = {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'confirmation';
  onConfirm?: () => void;
};

export type ModalGradosState = {
  isOpen: boolean;
  nivelId: number | null;
  nombreNivel: string;
  grados: Grado[];
  gradosSeleccionados: Set<number>;
  isLoading: boolean;
};

// ACTUALIZADO: Tipos para el nuevo GET
export type NivelConGrados = {
  id_area_nivel: number;
  nivel: {
    id_nivel: number;
    nombre: string;
  };
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
    niveles_con_grados: NivelConGrados[];
    total_niveles: number;
    total_relaciones: number;
  };
  message: string;
};

// NUEVO: Tipo para obtener todas las áreas (sin niveles)
export type AreasSimpleResponse = {
  success: boolean;
  message: string;
  data: Area[];
};