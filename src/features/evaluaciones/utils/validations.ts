// src/features/evaluaciones/utils/validations.ts

import { z } from 'zod';

// ==================== ESQUEMAS DE VALIDACIÓN ====================

/**
 * Schema para validar la nota del competidor
 * - Debe ser un número
 * - Debe estar entre 0 y 100 (rango configurable)
 * - Puede ser decimal con punto
 */
export const notaSchema = z
  .string()
  .min(1, 'El campo Nota del competidor es obligatorio.')
  .refine((val) => {
    const trimmed = val.trim();
    if (trimmed === '') return false;
    return !isNaN(parseFloat(trimmed));
  }, {
    message: 'La nota debe ser un número válido.',
  })
  .refine((val) => {
    const num = parseFloat(val);
    return num >= 0 && num <= 100;
  }, {
    message: 'Rango de nota no permitido. Solo se puede calificar entre 0-100.',
  });

/**
 * Schema para validar observaciones en el formulario de calificación
 * - Es opcional (puede estar vacío)
 * - No puede contener solo espacios en blanco
 * - Máximo 300 caracteres
 * - Solo letras, números, espacios, coma (,), punto y coma (;), punto (.)
 */
export const observacionesCalificacionSchema = z
  .string()
  .optional()
  .refine(
    (val) => {
      if (!val || val.length === 0) return true; // Vacío es válido
      return val.trim().length > 0; // Si tiene contenido, no puede ser solo espacios
    },
    {
      message: 'El campo Observaciones no puede contener solo espacios.',
    }
  )
  .refine(
    (val) => {
      if (!val) return true;
      return val.length <= 300;
    },
    {
      message: 'Las observaciones no pueden exceder 300 caracteres.',
    }
  )
  .refine(
    (val) => {
      if (!val) return true;
      // Solo permite letras (incluye acentos), números, espacios, comas, punto y coma, puntos
      const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s,;.]+$/;
      return regex.test(val);
    },
    {
      message: 'El campo Observaciones solo puede contener letras, números y los caracteres especiales: coma (,), punto y coma (;) y punto (.).',
    }
  );

/**
 * Schema para validar observaciones en el formulario de modificación
 * - Es OBLIGATORIO (no puede estar vacío)
 * - No puede contener solo espacios en blanco
 * - Máximo 300 caracteres
 * - Solo letras, números, espacios, coma (,), punto y coma (;), punto (.)
 */
export const observacionesModificacionSchema = z
  .string()
  .min(1, 'El campo Observaciones es obligatorio.')
  .refine((val) => val.trim().length > 0, {
    message: 'El campo Observaciones no puede contener solo espacios.',
  })
  .refine((val) => val.length <= 300, {
    message: 'Las observaciones no pueden exceder 300 caracteres.',
  })
  .refine((val) => {
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s,;.]+$/;
    return regex.test(val);
  }, {
    message: 'El campo Observaciones solo puede contener letras, números y los caracteres especiales: coma (,), punto y coma (;) y punto (.).',
  });

/**
 * Schema para validar el campo de búsqueda
 * - Máximo 50 caracteres
 * - Solo permite letras (incluye acentos y ñ)
 * - No permite números ni caracteres especiales
 */
export const busquedaSchema = z
  .string()
  .max(50, 'La búsqueda no puede exceder 50 caracteres.')
  .refine(
    (val) => {
      if (!val || val.trim().length === 0) return true; // Vacío es válido
      // Solo permite letras con acentos, ñ y espacios
      const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
      return regex.test(val);
    },
    {
      message: 'El campo de búsqueda permite el ingreso únicamente de letras.',
    }
  );

/**
 * Schema completo para el formulario de calificación
 */
export const formularioCalificacionSchema = z.object({
  nota: notaSchema,
  observaciones: observacionesCalificacionSchema,
});

/**
 * Schema completo para el formulario de modificación
 */
export const formularioModificacionSchema = z.object({
  nota: notaSchema,
  observaciones: observacionesModificacionSchema,
});

// ==================== TIPOS TYPESCRIPT ====================

export type FormularioCalificacion = z.infer<typeof formularioCalificacionSchema>;
export type FormularioModificacion = z.infer<typeof formularioModificacionSchema>;

// ==================== FUNCIONES DE VALIDACIÓN ====================

/**
 * Valida la nota del competidor
 * @param calificacion - Nota en formato string
 * @returns Objeto con resultado de validación
 */
export const validarCalificacion = (
  calificacion: string,
  rangoMin: number = 0,
  rangoMax: number = 100
): { valido: boolean; mensaje?: string } => {
  try {
    if (!calificacion || calificacion.trim() === '') {
      return { valido: false, mensaje: 'El campo Nota del competidor es obligatorio.' };
    }

    const num = parseFloat(calificacion);
    
    if (isNaN(num)) {
      return { valido: false, mensaje: 'La nota debe ser un número válido.' };
    }

    if (num < rangoMin || num > rangoMax) {
      return { 
        valido: false, 
        mensaje: `Rango de nota no permitido. Solo se puede calificar entre ${rangoMin}-${rangoMax}.` 
      };
    }

    return { valido: true };
  } catch (error) {
    return { valido: false, mensaje: 'Error de validación desconocido.' };
  }
};

/**
 * Valida las observaciones para calificación (opcional)
 * @param observaciones - Texto de observaciones
 * @returns true si es válido, false si no
 */
export const validarObservacionesCalificacion = (observaciones: string): { valido: boolean; mensaje?: string } => {
  try {
    // Si está vacío, es válido (es opcional)
    if (!observaciones || observaciones.length === 0) {
      return { valido: true };
    }

    // Verificar que no sea solo espacios
    if (observaciones.trim().length === 0) {
      return { valido: false, mensaje: 'El campo Observaciones no puede contener solo espacios.' };
    }

    // Verificar longitud máxima
    if (observaciones.length > 300) {
      return { valido: false, mensaje: 'Las observaciones no pueden exceder 300 caracteres.' };
    }

    // Verificar caracteres permitidos
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s,;.]+$/;
    if (!regex.test(observaciones)) {
      return { 
        valido: false, 
        mensaje: 'El campo Observaciones solo puede contener letras, números y los caracteres especiales: coma (,), punto y coma (;) y punto (.).' 
      };
    }

    return { valido: true };
  } catch (error) {
    return { valido: false, mensaje: 'Error de validación desconocido.' };
  }
};

/**
 * Valida las observaciones para modificación (obligatorio)
 * @param observaciones - Texto de observaciones
 * @returns true si es válido, false si no
 */
export const validarObservacionesModificacion = (observaciones: string): { valido: boolean; mensaje?: string } => {
  try {
    // Es obligatorio
    if (!observaciones || observaciones.length === 0) {
      return { valido: false, mensaje: 'El campo Observaciones es obligatorio.' };
    }

    // Verificar que no sea solo espacios
    if (observaciones.trim().length === 0) {
      return { valido: false, mensaje: 'El campo Observaciones no puede contener solo espacios.' };
    }

    // Verificar longitud máxima
    if (observaciones.length > 300) {
      return { valido: false, mensaje: 'Las observaciones no pueden exceder 300 caracteres.' };
    }

    // Verificar caracteres permitidos
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s,;.]+$/;
    if (!regex.test(observaciones)) {
      return { 
        valido: false, 
        mensaje: 'El campo Observaciones solo puede contener letras, números y los caracteres especiales: coma (,), punto y coma (;) y punto (.).' 
      };
    }

    return { valido: true };
  } catch (error) {
    return { valido: false, mensaje: 'Error de validación desconocido.' };
  }
};

/**
 * Valida el término de búsqueda
 * @param busqueda - Término de búsqueda
 * @returns true si es válido, false si no
 */
export const validarBusqueda = (busqueda: string): { valido: boolean; mensaje?: string } => {
  try {
    if (!busqueda || busqueda.trim().length === 0) {
      return { valido: true }; // Vacío es válido
    }

    if (busqueda.length > 50) {
      return { valido: false, mensaje: 'La búsqueda no puede exceder 50 caracteres.' };
    }

    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
    if (!regex.test(busqueda)) {
      return { 
        valido: false, 
        mensaje: 'El campo de búsqueda permite el ingreso únicamente de letras.' 
      };
    }

    return { valido: true };
  } catch (error) {
    return { valido: false, mensaje: 'Error de validación desconocido.' };
  }
};

/**
 * Valida el formulario completo de calificación
 * @param data - Datos del formulario
 * @returns Resultado de validación con mensajes de error específicos
 */
export const validarFormularioCalificacion = (data: {
  nota: string;
  observaciones?: string;
}): { valido: boolean; errores?: Record<string, string> } => {
  const errores: Record<string, string> = {};

  // Validar nota
  const validacionNota = validarCalificacion(data.nota);
  if (!validacionNota.valido && validacionNota.mensaje) {
    errores.nota = validacionNota.mensaje;
  }

  // Validar observaciones (si tiene contenido)
  if (data.observaciones) {
    const validacionObs = validarObservacionesCalificacion(data.observaciones);
    if (!validacionObs.valido && validacionObs.mensaje) {
      errores.observaciones = validacionObs.mensaje;
    }
  }

  return Object.keys(errores).length === 0 
    ? { valido: true } 
    : { valido: false, errores };
};

/**
 * Valida el formulario completo de modificación
 * @param data - Datos del formulario
 * @returns Resultado de validación con mensajes de error específicos
 */
export const validarFormularioModificacion = (data: {
  nota: string;
  observaciones: string;
}): { valido: boolean; errores?: Record<string, string> } => {
  const errores: Record<string, string> = {};

  // Validar nota
  const validacionNota = validarCalificacion(data.nota);
  if (!validacionNota.valido && validacionNota.mensaje) {
    errores.nota = validacionNota.mensaje;
  }

  // Validar observaciones (obligatorio)
  const validacionObs = validarObservacionesModificacion(data.observaciones);
  if (!validacionObs.valido && validacionObs.mensaje) {
    errores.observaciones = validacionObs.mensaje;
  }

  return Object.keys(errores).length === 0 
    ? { valido: true } 
    : { valido: false, errores };
};

// ==================== UTILIDADES ====================

/**
 * Formatea el nombre completo del competidor
 * @param nombres - Nombres del competidor
 * @param apellidos - Apellidos del competidor
 * @returns Nombre completo formateado
 */
export const formatearNombreCompleto = (nombres: string, apellidos: string): string => {
  return `${nombres.trim()} ${apellidos.trim()}`.trim();
};

/**
 * Valida si una búsqueda es válida (no solo espacios en blanco)
 * @param busqueda - Término de búsqueda
 * @returns true si es válida, false si es solo espacios
 */
export const esBusquedaValida = (busqueda: string): boolean => {
  return busqueda.trim().length > 0;
};