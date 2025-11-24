// src/features/ConfiguracionFases/types/index.ts

/**
 * ------------------------------------------------------------------
 * MÓDULO DE TIPOS: Configuración de Fases Globales
 * ------------------------------------------------------------------
 * Definiciones TypeScript basadas en el contrato de API real.
 * * Estructura alineada con:
 * 1. GET /api/gestiones
 * 2. GET /api/gestiones/{id}/configuracion-acciones
 * 3. PUT /api/gestiones/{id}/configuracion-acciones
 */

// --- Interfaces Genéricas de Respuesta API ---

/**
 * Wrapper estándar que devuelve tu backend.
 * @template T Tipo de dato contenido en la respuesta.
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

// --- Entidades de Dominio ---

/**
 * Representa una gestión (olimpiada) completa.
 * Fuente: GET /api/gestiones
 */
export interface Gestion {
  id: number;
  nombre: string;    // Ej: "Olimpiada Científica 2025"
  gestion: string;   // Ej: "2025" (El backend lo devuelve como string)
  esActual: boolean; // Flag para identificar la gestión vigente
}

/**
 * Representa una de las fases globales del sistema.
 * Fuente: Array "fases" en la matriz de configuración.
 */
export interface FaseGlobal {
  id: number;
  codigo: string; // Ej: "CONFIG", "EVAL"
  nombre: string; // Ej: "Fase de Configuración"
  orden?: number; // Opcional, si el backend lo envía para ordenar columnas
}

/**
 * Representa el estado de un permiso para una fase específica.
 * Se encuentra anidado dentro de cada acción en la respuesta del API.
 */
export interface PermisoFaseDetalle {
  idFase: number;
  habilitada: boolean;
}

/**
 * Representa una acción del sistema con su configuración actual.
 * Fuente: Array "acciones" en la matriz de configuración.
 */
export interface AccionSistema {
  id: number;
  codigo: string;        // Ej: "REG_ESTUD"
  nombre: string;        // Ej: "Registrar estudiantes"
  descripcion?: string;  // Opcional
  porFase: PermisoFaseDetalle[]; // Array con el estado de esta acción en cada fase
}

// --- DTOs (Data Transfer Objects) ---

/**
 * Estructura de la respuesta del endpoint de lectura de la matriz.
 * Fuente: GET /api/gestiones/{id}/configuracion-acciones
 * * NOTA: La propiedad 'gestion' aquí es un subconjunto simplificado,
 * no el objeto Gestion completo.
 */
export interface MatrizConfiguracionResponse {
  gestion: { 
    id: number; 
    gestion: string;
  };
  fases: FaseGlobal[];
  acciones: AccionSistema[]; // CORREGIDO: El backend devuelve "acciones", no "accionesPorFase"
}

/**
 * Objeto individual para el payload de guardado.
 * Representa una celda modificada.
 */
export interface PermisoFasePayload {
  idAccion: number;
  idFase: number;
  habilitada: boolean;
}

/**
 * Payload completo para guardar la configuración.
 * Fuente: PUT /api/gestiones/{id}/configuracion-acciones
 */
export interface GuardarConfiguracionPayload {
  fases: number[]; // Lista de IDs de las fases activas/presentes
  accionesPorFase: PermisoFasePayload[]; // Lista plana de permisos
}

// --- Tipos Utilitarios para la UI (Frontend) ---

/**
 * Tipo interno optimizado para manejar la matriz en el estado de React.
 * Mapea una coordenada (Fase, Acción) a un valor booleano.
 */
export interface PermisoFase {
  id_fase: number;
  id_accion: number;
  habilitado: boolean;
}