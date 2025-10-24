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
const REGEX_CORREO_INSTITUCIONAL = /^[^\s@]+@(?:[a-zA-Z0-9-]+\.)*(?:uni\.edu\.bo)$/i; // Ajusta 'uni.edu.bo' si es necesario


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
    .string() // CORRECCIÓN: Eliminar { required_error: '...' }
    .trim()
    .min(1, 'El Carnet de Identidad es obligatorio.') // Mensaje de requerido aquí
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
    .string() // CORRECCIÓN: Eliminar { required_error: '...' }
    .trim()
    .min(1, 'Los nombres son obligatorios.') // Mensaje de requerido aquí
    .min(NOMBRE_MIN_LENGTH, `Mínimo ${NOMBRE_MIN_LENGTH} caracteres.`)
    .max(NOMBRE_MAX_LENGTH, `Máximo ${NOMBRE_MAX_LENGTH} caracteres.`)
    .regex(REGEX_NOMBRES_APELLIDOS, 'Contiene caracteres no permitidos.')
    .transform(toTitleCase),

  apellidos: z
    .string() // CORRECCIÓN: Eliminar { required_error: '...' }
    .trim()
    .min(1, 'Los apellidos son obligatorios.') // Mensaje de requerido aquí
    .min(APELLIDO_MIN_LENGTH, `Mínimo ${APELLIDO_MIN_LENGTH} caracteres.`)
    .max(APELLIDO_MAX_LENGTH, `Máximo ${APELLIDO_MAX_LENGTH} caracteres.`)
    .regex(REGEX_NOMBRES_APELLIDOS, 'Contiene caracteres no permitidos.')
    .transform(toTitleCase),

  correo: z
    .string() // CORRECCIÓN: Eliminar { required_error: '...' }
    .trim()
    .min(1, 'El Correo Electrónico es obligatorio.') // Mensaje de requerido aquí
    .email('Formato de correo no válido.')
    .regex(REGEX_CORREO_INSTITUCIONAL, 'Se requiere un correo institucional (ej: usuario@uni.edu.bo).')
    .toLowerCase(),

  ci: z
    .string()
    .trim()
    .min(1, 'El CI es requerido.')
    .regex(REGEX_CI_BOLIVIA, 'Formato de CI inválido.'),

  celular: z
    .string() // CORRECCIÓN: Eliminar { required_error: '...' }
    .trim()
    .min(1, 'El número de celular es obligatorio.') // Mensaje de requerido aquí
    .length(CELULAR_LENGTH, `Debe tener ${CELULAR_LENGTH} dígitos.`)
    .regex(REGEX_CELULAR_BOLIVIA, 'Número inválido (debe empezar con 6 o 7).'),

  gestionPasadaId: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : val),
    z.coerce
      .number({
           // CORRECCIÓN: Usar 'errorMap' o mensajes en refinamientos posteriores
           // O simplemente dejar que Zod use su mensaje por defecto para tipo inválido
           // O puedes añadir el mensaje a los refinamientos .int() o .positive() si aplica
           // Ejemplo de mensaje en .int():
           // .int({ message: 'El ID de gestión debe ser un número entero.' })
           message: 'Selección de gestión inválida.' // Mensaje general si la coerción falla
      })
      .int({ message: 'El ID de gestión debe ser un número entero.' })
      .positive({ message: 'El ID de gestión debe ser positivo.' })
      .optional()
  ),

  areas: z
    .array(z.number())
    .min(1, { message: 'Debe asignar al menos un área.' }),
});

export type ResponsableFormData = z.infer<typeof datosResponsableSchema>;

// Tipo Input (para defaultValues/reset) inferido automáticamente por Zod
export type ResponsableFormInput = z.input<typeof datosResponsableSchema>;