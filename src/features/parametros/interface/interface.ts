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
  grados?: Grado[];
  areaNiveles: number[];
}

// ===============================
// 🟩 Grado
// ===============================
export interface Grado {
  id: number;
  nombre: string;
}

// ===============================
// 🟧 Parámetros de Clasificación
// ===============================
export interface AreaNivel {
  id_area_nivel: number;
  nota_min_aprobacion: number;
  cantidad_maxima: number | null;
}

export interface ParametroClasificacion {
  area_niveles: AreaNivel[];
}

// ===============================
// 🟪 Parámetro Gestión API
// ===============================
export interface ParametroGestionAPI {
  area: string; // nombre del área
  nivel: string; // nombre del nivel, ej. "1ro de Secundaria"
  notaMinima: number;
  notaMaxima: number;
  cantidadMaxima: number;
  gestion: string;
}

// ===============================
// 🟫 Interfaces movidas desde Formulario.tsx
// ===============================

export interface NivelIndividual {
  nivel: Nivel;
  id_area_nivel: number;
}

export interface FormularioProps {
  nivelesSeleccionados: Nivel[];
  idArea: number;
  onCerrar: () => void;
  onMarcarEnviado: (nombreNivel: string, idArea: number) => void;
  nivelesConParametros: Record<number, string[]>; // <-- Asegúrate de definir su tipo

  valoresCopiados?: {
    notaMinima: number | '';
    cantidadMaxima: number | '';
  };
  valoresCopiadosManualmente?: boolean;
  onLimpiarSeleccion?: () => void;
  // onSuccess?: () => void;

  // ⬇⬇⬇ MODIFICAR ESTA PARTE
  onSuccess?: (tipo: 'notaYCantidad' | 'soloNota') => void;
  onLimpiarGestionSeleccionada?: () => void;
}
