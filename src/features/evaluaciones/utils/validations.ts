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
  .refine((val) => !isNaN(parseFloat(val)), {
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
 * - Solo letras, números, comas, punto y coma, puntos
 */
export const observacionesCalificacionSchema = z
  .string()
  .optional()
  .refine(
    (val) => {
      if (!val) return true; // Vacío es válido
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
      message: 'Las observaciones solo pueden contener letras, números, comas (,), punto y coma (;) y punto (.).',
    }
  );

/**
 * Schema para validar observaciones en el formulario de modificación
 * - Es OBLIGATORIO (no puede estar vacío)
 * - No puede contener solo espacios en blanco
 * - Máximo 300 caracteres
 * - Solo letras, números, comas, punto y coma, puntos
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
    message: 'Las observaciones solo pueden contener letras, números, comas (,), punto y coma (;) y punto (.).',
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
      message: 'La búsqueda solo puede contener letras.',
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
    // Crear schema dinámico con rango personalizado
    const notaDinamica = z
      .string()
      .min(1, 'El campo Nota del competidor es obligatorio.')
      .refine((val) => !isNaN(parseFloat(val)), {
        message: 'La nota debe ser un número válido.',
      })
      .refine((val) => {
        const num = parseFloat(val);
        return num >= rangoMin && num <= rangoMax;
      }, {
        message: `Rango de nota no permitido. Solo se puede calificar entre ${rangoMin}-${rangoMax}.`,
      });

    notaDinamica.parse(calificacion);
    return { valido: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valido: false, mensaje: error.errors[0].message };
    }
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
    observacionesCalificacionSchema.parse(observaciones);
    return { valido: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valido: false, mensaje: error.errors[0].message };
    }
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
    observacionesModificacionSchema.parse(observaciones);
    return { valido: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valido: false, mensaje: error.errors[0].message };
    }
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
    busquedaSchema.parse(busqueda);
    return { valido: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valido: false, mensaje: error.errors[0].message };
    }
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
  try {
    formularioCalificacionSchema.parse(data);
    return { valido: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errores: Record<string, string> = {};
      error.errors.forEach((err) => {
        const campo = err.path[0] as string;
        errores[campo] = err.message;
      });
      return { valido: false, errores };
    }
    return { valido: false, errores: { general: 'Error de validación desconocido.' } };
  }
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
  try {
    formularioModificacionSchema.parse(data);
    return { valido: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errores: Record<string, string> = {};
      error.errors.forEach((err) => {
        const campo = err.path[0] as string;
        errores[campo] = err.message;
      });
      return { valido: false, errores };
    }
    return { valido: false, errores: { general: 'Error de validación desconocido.' } };
  }
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