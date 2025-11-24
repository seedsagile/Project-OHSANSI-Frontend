// src/features/reportes/cambiosCalificaciones/utils/mocks.ts

import type { HistorialCambio } from '../types';

/**
 * MOCK_HISTORIAL
 * * Datos simulados para el reporte de auditoría de calificaciones.
 * Cubre los casos de uso:
 * - Calificación inicial (Happy path)
 * - Modificación de notas (Corrección de errores)
 * - Desclasificación (Sanciones)
 * * NOTA: En producción, estos datos serán reemplazados por la respuesta del endpoint:
 * GET /api/reportes/historial-calificaciones
 */
export const MOCK_HISTORIAL: readonly HistorialCambio[] = [
  // ------------------------------------------------------------------
  // CASO 1: Flujo normal de calificación (Matemáticas)
  // ------------------------------------------------------------------
  {
    id_historial: 1,
    fecha_hora: '2025-11-20T08:30:00',
    nombre_evaluador: 'Juan Pérez',
    nombre_olimpista: 'María López',
    area: 'Matemáticas',
    id_area: 1,
    nivel: '1ro de Secundaria',
    id_nivel: 101,
    accion: 'Calificar',
    observacion: null,
    descripcion: 'Calificación inicial asignada: 85 pts.',
    nota_nueva: 85,
  },
  {
    id_historial: 2,
    fecha_hora: '2025-11-20T08:45:00',
    nombre_evaluador: 'Juan Pérez',
    nombre_olimpista: 'José Mamani',
    area: 'Matemáticas',
    id_area: 1,
    nivel: '1ro de Secundaria',
    id_nivel: 101,
    accion: 'Calificar',
    observacion: null,
    descripcion: 'Calificación inicial asignada: 90 pts.',
    nota_nueva: 90,
  },

  // ------------------------------------------------------------------
  // CASO 2: Corrección de error (Modificar)
  // ------------------------------------------------------------------
  {
    id_historial: 3,
    fecha_hora: '2025-11-20T09:15:00',
    nombre_evaluador: 'Juan Pérez',
    nombre_olimpista: 'María López',
    area: 'Matemáticas',
    id_area: 1,
    nivel: '1ro de Secundaria',
    id_nivel: 101,
    accion: 'Modificar',
    observacion: 'Error de tipeo en la pregunta 3, se verificó la hoja de respuestas.',
    descripcion: 'Nota modificada de 85 a 95 pts.',
    nota_anterior: 85,
    nota_nueva: 95,
  },

  // ------------------------------------------------------------------
  // CASO 3: Desclasificación por infracción (Física)
  // ------------------------------------------------------------------
  {
    id_historial: 4,
    fecha_hora: '2025-11-21T10:00:00',
    nombre_evaluador: 'Carlos Ruiz',
    nombre_olimpista: 'Pedro Pascal',
    area: 'Física',
    id_area: 2,
    nivel: 'Nivel Avanzado',
    id_nivel: 302,
    accion: 'Desclasificar',
    observacion: 'Uso de calculadora programable no permitida según reglamento Art. 4.',
    descripcion: 'Participante desclasificado. Nota anulada.',
    nota_anterior: 70,
    nota_nueva: 0,
  },

  // ------------------------------------------------------------------
  // CASO 4: Calificación en otra área (Robótica)
  // ------------------------------------------------------------------
  {
    id_historial: 5,
    fecha_hora: '2025-11-22T14:20:00',
    nombre_evaluador: 'Ana Gómez',
    nombre_olimpista: 'Roberto Carlos',
    area: 'Robótica',
    id_area: 3,
    nivel: 'Categoría A (Constructores)',
    id_nivel: 201,
    accion: 'Calificar',
    observacion: 'Excelente desempeño en pista, cumplió el reto en tiempo récord.',
    descripcion: 'Calificación inicial asignada: 100 pts.',
    nota_nueva: 100,
  },

  // ------------------------------------------------------------------
  // CASO 5: Modificación por reclamo (Química)
  // ------------------------------------------------------------------
  {
    id_historial: 6,
    fecha_hora: '2025-11-23T11:45:00',
    nombre_evaluador: 'Luis Fernández',
    nombre_olimpista: 'Carla Bruni',
    area: 'Química',
    id_area: 4,
    nivel: '6to de Secundaria',
    id_nivel: 106,
    accion: 'Modificar',
    observacion: 'Revisión de reclamo procedente. Se valida el procedimiento del ejercicio 2.',
    descripcion: 'Nota modificada de 60 a 65 pts.',
    nota_anterior: 60,
    nota_nueva: 65,
  },

  // ------------------------------------------------------------------
  // CASO 6: Error de cálculo (Matemáticas - Otro nivel)
  // ------------------------------------------------------------------
  {
    id_historial: 7,
    fecha_hora: '2025-11-20T15:00:00',
    nombre_evaluador: 'Juan Pérez',
    nombre_olimpista: 'Sofía Vergara',
    area: 'Matemáticas',
    id_area: 1,
    nivel: '2do de Secundaria',
    id_nivel: 102,
    accion: 'Calificar',
    observacion: null,
    descripcion: 'Calificación inicial asignada: 40 pts.',
    nota_nueva: 40,
  },
  {
    id_historial: 8,
    fecha_hora: '2025-11-20T16:30:00',
    nombre_evaluador: 'Juan Pérez',
    nombre_olimpista: 'Sofía Vergara',
    area: 'Matemáticas',
    id_area: 1,
    nivel: '2do de Secundaria',
    id_nivel: 102,
    accion: 'Modificar',
    observacion: 'Suma incorrecta en el total parcial.',
    descripcion: 'Nota modificada de 40 a 45 pts.',
    nota_anterior: 40,
    nota_nueva: 45,
  },
];