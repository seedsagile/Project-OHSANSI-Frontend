// src/config/modules.ts

/**
 * ------------------------------------------------------------------
 * CATÁLOGO DE MÓDULOS Y ACCIONES DEL SISTEMA
 * ------------------------------------------------------------------
 * Este archivo centraliza los códigos únicos (slugs) que utiliza el Backend
 * para identificar los permisos y funcionalidades.
 *
 * Estos códigos deben coincidir EXACTAMENTE con la columna 'codigo'
 * de la tabla 'acciones_sistema' en tu base de datos.
 *
 * Uso:
 * import { MODULES } from '@/config/modules';
 * if (can(MODULES.GESTION_AREAS)) { ... }
 */

export const MODULES = {
  // --- Módulos de Gestión y Configuración ---
  GESTION_AREAS: 'MOD_AREAS',          // Gestión de Áreas
  GESTION_NIVELES: 'MOD_NIVELES',      // Gestión de Niveles
  ASIGNACION_NIVELES: 'MOD_ASIG_NIV',  // Asignación de Niveles a Áreas
  CONFIG_FASES: 'MOD_FASES_GLB',       // Configuración de Fases Globales
  ADMINISTRACION_SUBFASES: 'MOD_SUBFASES', // Administración de Subfases

  // --- Módulos de Usuarios ---
  GESTION_RESPONSABLES: 'MOD_RESPONSABLES', // Gestión de Responsables de Área
  GESTION_EVALUADORES: 'MOD_EVALUADORES',   // Gestión de Evaluadores

  // --- Módulos de Competidores ---
  IMPORTAR_COMPETIDORES: 'MOD_IMPORT_CSV',  // Registrar Competidores (Carga Masiva)
  LISTA_COMPETIDORES: 'MOD_LISTA_COMP',     // Listado, filtrado y exportación

  // --- Módulos de Evaluación y Clasificación ---
  PARAMETROS_CLASIFICACION: 'MOD_PARAM_CLAS', // Definir notas mínimas y cupos
  PARAMETRIZAR_MEDALLERO: 'MOD_MEDALLERO',    // Configurar distribución de medallas
  EVALUACION_COMPETIDORES: 'MOD_EVALUACION',   // Evaluar Competidores
  
  // --- Módulos de Auditoría y Reportes ---
  AUDITORIA_CAMBIOS: 'MOD_AUDITORIA',   // Reporte de Cambios / Logs
} as const;

/**
 * Tipo derivado automáticamente de los valores del objeto MODULES.
 * Permite que TypeScript sugiera y valide los códigos en funciones como can().
 * * Ejemplo de tipo resultante:
 * 'MOD_AREAS' | 'MOD_NIVELES' | 'MOD_ASIG_NIV' | ...
 */
export type ModuleCode = typeof MODULES[keyof typeof MODULES];