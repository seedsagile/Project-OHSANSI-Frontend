// src/features/usuarios/responsables/utils/validations.ts
import { z } from 'zod';

// =======================
// CONSTANTES Y REGEX
// =======================
const NOMBRE_MIN_LENGTH = 3;
const NOMBRE_MAX_LENGTH = 50;
const APELLIDO_MIN_LENGTH = 3;
const APELLIDO_MAX_LENGTH = 50;
const CI_MIN_LENGTH = 5;
const CI_MAX_LENGTH = 15;
const CELULAR_LENGTH = 8;

const REGEX_NOMBRES_APELLIDOS = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/;
const REGEX_CI_BOLIVIA = /^\d+([-\dA-Z]{1,3})?$/;
const REGEX_CELULAR_BOLIVIA = /^[67]\d{7}$/;
const REGEX_CORREO_INSTITUCIONAL = /^[^\s@]+@(?:[a-zA-Z0-9-]+\.)*(?:uni\.edu\.bo)$/i; // Ajusta 'uni.edu.bo'


// =======================
// FUNCIONES HELPER
// =======================
const toTitleCase = (str: string): string => {
  if (!str) return '';
  return str
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .replace(/(^\w|\s\w)/g, (c) => c.toUpperCase());
};

// =======================
// ESQUEMAS ZOD
// =======================

/**
 * Esquema para validar el Carnet de Identidad en el paso de verificación inicial.
 */
export const verificacionCISchema = z.object({
  ci: z
    .string()
    .trim()
    .min(1, 'El Carnet de Identidad es obligatorio.')
    .min(CI_MIN_LENGTH, `Mínimo ${CI_MIN_LENGTH} caracteres.`)
    .max(CI_MAX_LENGTH, `Máximo ${CI_MAX_LENGTH} caracteres.`)
    .regex(REGEX_CI_BOLIVIA, 'Formato de CI inválido (ej: 1234567, 1234567LP, 1234567-1B).'),
});

export type VerificacionCIForm = z.infer<typeof verificacionCISchema>;


/**
 * Esquema principal para validar los datos del formulario de registro del responsable.
 */
export const datosResponsableSchema = z.object({
  nombres: z
    .string()
    .trim()
    .min(1, 'Los nombres son obligatorios.')
    .min(NOMBRE_MIN_LENGTH, `Mínimo ${NOMBRE_MIN_LENGTH} caracteres.`)
    .max(NOMBRE_MAX_LENGTH, `Máximo ${NOMBRE_MAX_LENGTH} caracteres.`)
    .regex(REGEX_NOMBRES_APELLIDOS, 'Contiene caracteres no permitidos.')
    .transform(toTitleCase),

  apellidos: z
    .string()
    .trim()
    .min(1, 'Los apellidos son obligatorios.')
    .min(APELLIDO_MIN_LENGTH, `Mínimo ${APELLIDO_MIN_LENGTH} caracteres.`)
    .max(APELLIDO_MAX_LENGTH, `Máximo ${APELLIDO_MAX_LENGTH} caracteres.`)
    .regex(REGEX_NOMBRES_APELLIDOS, 'Contiene caracteres no permitidos.')
    .transform(toTitleCase),

  correo: z
    .string()
    .trim()
    .min(1, 'El Correo Electrónico es obligatorio.')
    .email('Formato de correo no válido.')
    .regex(REGEX_CORREO_INSTITUCIONAL, 'Se requiere un correo institucional (ej: usuario@uni.edu.bo).')
    .toLowerCase(),

  ci: z
    .string()
    .trim()
    .min(1, 'El CI es requerido.')
    .regex(REGEX_CI_BOLIVIA, 'Formato de CI inválido.'),

  celular: z
    .string()
    .trim()
    .min(1, 'El número de celular es obligatorio.')
    .length(CELULAR_LENGTH, `Debe tener ${CELULAR_LENGTH} dígitos.`)
    .regex(REGEX_CELULAR_BOLIVIA, 'Número inválido (debe empezar con 6 o 7).'),

  // *** CORRECCIÓN: Esta es la forma robusta de manejar strings vacíos de <select> ***
  gestionPasadaId: z.preprocess(
  (v) => (v === '' || v == null ? undefined : v),
  z.number({ invalid_type_error: 'Selección de gestión inválida.' })
    .int({ message: 'El ID de gestión debe ser un número entero.' })
    .positive({ message: 'El ID de gestión debe ser positivo.' })
    .optional()
),
  areas: z
    .array(z.number())
    .min(1, { message: 'Debe asignar al menos un área.' }),
});

// Tipo Output (después de Zod): gestionPasadaId es number | undefined
export type ResponsableFormData = z.infer<typeof datosResponsableSchema>;

// Tipo Input (antes de Zod): gestionPasadaId es string | undefined
export type ResponsableFormInput = z.input<typeof datosResponsableSchema>;