// src/validations/evaluatorValidation.ts
import { z } from "zod";

/**
 * Función para normalizar texto: capitaliza la primera letra de cada palabra
 * y convierte el resto a minúsculas
 */
export const normalizeText = (text: string): string => {
  return text
    .trim()
    .replace(/\s+/g, ' ') // Elimina espacios múltiples
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Schema de validación para el nombre del evaluador
 * Reglas:
 * - Obligatorio (no puede estar vacío ni contener solo espacios)
 * - Mínimo 3 caracteres
 * - Máximo 20 caracteres
 * - Solo letras, espacios y acentos (NO números ni caracteres especiales)
 * - Normalización automática al guardar
 */
export const nombreSchema = z.string()
  .min(1, 'El campo Nombre del evaluador es obligatorio.')
  .transform((val) => val.trim().replace(/\s+/g, ' ')) // Elimina espacios múltiples
  .refine((val) => val.length > 0, {
    message: 'El campo Nombre del evaluador es obligatorio.'
  })
  .pipe(
    z.string()
      .min(3, 'El campo Nombre del evaluador requiere un mínimo de 3 caracteres.')
      .max(20, 'El campo Nombre del evaluador tiene un límite máximo de 20 caracteres.')
      .refine((val) => !/\d/.test(val), {
        message: 'El campo Nombre del evaluador contiene caracteres numéricos. Sólo se aceptan letras.'
      })
      .refine((val) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(val), {
        message: 'El campo Nombre del evaluador contiene caracteres especiales. Solo se aceptan letras.'
      })
      .transform(normalizeText) // Normaliza al guardar
  );

/**
 * Schema de validación para el apellido del evaluador
 * Reglas:
 * - Obligatorio (no puede estar vacío ni contener solo espacios)
 * - Mínimo 3 caracteres
 * - Máximo 20 caracteres
 * - Solo letras, espacios y acentos (NO números ni caracteres especiales)
 * - Normalización automática al guardar
 */
export const apellidoSchema = z.string()
  .min(1, 'El campo Apellido es obligatorio.')
  .transform((val) => val.trim().replace(/\s+/g, ' ')) // Elimina espacios múltiples
  .refine((val) => val.length > 0, {
    message: 'El campo Apellido es obligatorio.'
  })
  .pipe(
    z.string()
      .min(3, 'El campo Apellido del evaluador requiere un mínimo de 3 caracteres.')
      .max(20, 'El campo Apellido del evaluador tiene un límite máximo de 20 caracteres.')
      .refine((val) => !/\d/.test(val), {
        message: 'El campo Apellido del evaluador contiene caracteres numéricos. Sólo se aceptan letras.'
      })
      .refine((val) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(val), {
        message: 'El campo Apellido del evaluador contiene caracteres especiales. Solo se aceptan letras.'
      })
      .transform(normalizeText) // Normaliza al guardar
  );

/**
 * Schema de validación para el correo electrónico
 * Reglas:
 * - Obligatorio (no puede estar vacío ni contener solo espacios)
 * - Mínimo 6 caracteres
 * - Máximo 30 caracteres
 * - Formato de email válido
 * - Solo permite letras, números y punto (.)
 * - Se valida duplicidad en el backend
 */

export const emailSchema = z.string()
  .min(1, 'El campo Correo electrónico es obligatorio.')
  .transform((val) => val.trim().toLowerCase()) // Elimina espacios y convierte a minúsculas
  .refine((val) => val.length > 0, {
    message: 'El campo Correo Electrónico es obligatorio.'
  })
  .pipe(
    z.string()
      .min(16, 'El campo Correo electrónico requiere un mínimo de 16 caracteres.')
      .max(50, 'El campo Correo electrónico tiene un límite máximo de 50 caracteres.')
      .refine((val) => {
        // Primero verifica que tenga la estructura básica @ y .
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
          return true; // Si no tiene estructura básica, pasa a la siguiente validación
        }
        // Si tiene estructura básica, valida caracteres permitidos
        return /^[a-zA-Z0-9.]+@[a-zA-Z0-9.-]+\.[a-zA-Z]+$/.test(val);
      }, {
        message: 'Correo electrónico inválido. Solo se permiten letras, números y el caracter especial @ y .'
      })
      .refine((val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
        message: 'El campo Correo electrónico debe tener un formato válido (ej. usuario@uno.com).'
      })
  );


/**
 * Schema de validación para el carnet de identidad
 * Reglas:
 * - Obligatorio (no puede estar vacío ni contener solo espacios)
 * - Mínimo 5 caracteres
 * - Máximo 15 caracteres
 * - Solo números O números con UNA letra al final (sin espacios ni caracteres especiales)
 * - Se valida duplicidad en el backend
 */
export const ciSchema = z.string()
  .min(1, 'El campo Carnet de identidad es obligatorio.')
  .transform((val) => val.trim().replace(/\s+/g, '').toUpperCase()) // Elimina todos los espacios y convierte a mayúsculas
  .refine((val) => val.length > 0, {
    message: 'El campo Carnet de identidad es obligatorio.'
  })
  .pipe(
    z.string()
      .min(4, 'El campo Carnet de identidad requiere una longitud mínima de 4 caracteres.')
      .max(15, 'El campo Carnet de identidad tiene un límite máximo de 15 caracteres.')
      .refine((val) => {
        // Verifica si tiene más de una letra
        const letras = val.match(/[a-zA-Z]/g);
        if (letras && letras.length > 1) {
          return false;
        }
        return true;
      }, {
        message: 'El campo Carnet de identidad contiene caracteres especiales. Solo se aceptan números y letras '
      })
      .refine((val) => /^[0-9]+[a-zA-Z]?$/.test(val), {
        //message: 'El campo Carnet de identidad debe contener solo números, o números con una letra al final.'
        message: 'El campo Carnet de identidad contiene caracteres especiales. Solo se aceptan números y letras'
      })
  );

/**
 * Schema completo del formulario de evaluador
 */
export const schemaEvaluador = z.object({
  nombre: nombreSchema,
  apellido: apellidoSchema,
  email: emailSchema,
  ci: ciSchema,
});

/**
 * Tipo inferido del schema para usar con React Hook Form
 */
export type EvaluadorFormData = z.infer<typeof schemaEvaluador>;

/**
 * Mensajes de error personalizados para el backend
 */
export const backendErrorMessages = {
  CI_DUPLICADO: {
    title: '¡Ups! Algo salió mal',
    message: 'Ya existe un evaluador registrado con este carnet de identidad'
  },
  EMAIL_DUPLICADO: {
    title: '¡Ups! Algo salió mal',
    message: 'Ya existe un evaluador registrado con este correo electrónico'
  },
  ERROR_GENERICO: {
    title: 'Error al Registrar',
    message: 'Ocurrió un error al registrar el evaluador. Por favor, intente nuevamente.'
  }
};