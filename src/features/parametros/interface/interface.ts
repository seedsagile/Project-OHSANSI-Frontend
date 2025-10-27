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
  niveles?: Nivel[];
}

// ===============================
// 🟨 Nivel
// ===============================
export interface Nivel {
  id: number;
  nombre: string;
}
export interface ParametroGestionAPI {
  area: string; // nombre del área
  nivel: string; // nombre del nivel, ej. "1ro de Secundaria"
  notaMinima: number;
  notaMaxima: number;
  cantidadMaxima: number;
}
