import { z } from 'zod';

const NOMBRE_MIN_LENGTH = 3;
const NOMBRE_MAX_LENGTH = 50;
const APELLIDO_MIN_LENGTH = 3;
const APELLIDO_MAX_LENGTH = 50;
const CI_MIN_LENGTH = 5;
const CI_MAX_LENGTH = 15;
const CELULAR_LENGTH = 8;

const REGEX_NOMBRES_APELLIDOS = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/;
const REGEX_CI_BOLIVIA = /^\d+([-\dA-Z]{0,3})?$/;
const REGEX_CELULAR_BOLIVIA = /^[67]\d{7}$/;
// TODO: Ajusta el dominio 'uni.edu.bo' si es diferente
const REGEX_CORREO_INSTITUCIONAL = /^[^\s@]+@(?:[a-zA-Z0-9-]+\.)*(?:uni\.edu\.bo)$/i;

const toTitleCase = (str: string): string => {
  if (!str) return '';
  return str
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .replace(/(^\w|\s\w)/g, (c) => c.toUpperCase());
};

export const verificacionCISchema = z.object({
  ci: z
    .string()
    .trim()
    .min(1, 'El Carnet de Identidad es obligatorio.')
    .min(CI_MIN_LENGTH, `Mínimo ${CI_MIN_LENGTH} caracteres.`)
    .max(CI_MAX_LENGTH, `Máximo ${CI_MAX_LENGTH} caracteres.`)
    .transform((val) => val.toUpperCase().replace(/\s+/g, ''))
    .pipe(z.string().regex(REGEX_CI_BOLIVIA, 'Formato inválido (ej: 1234567, 1234567LP, 1234567-1B).')),
});

export type VerificacionCIForm = z.infer<typeof verificacionCISchema>;

export const datosResponsableSchema = z.object({
  nombres: z
      .string()
      .trim()
      .min(1, 'Los nombres son obligatorios.')
      .min(NOMBRE_MIN_LENGTH, `Mínimo ${NOMBRE_MIN_LENGTH} caracteres.`)
      .max(NOMBRE_MAX_LENGTH, `Máximo ${NOMBRE_MAX_LENGTH} caracteres.`)
      .regex(REGEX_NOMBRES_APELLIDOS, 'Nombres inválidos (solo letras, espacios, \', -).')
      .transform(toTitleCase),

  apellidos: z
      .string()
      .trim()
      .min(1, 'Los apellidos son obligatorios.')
      .min(APELLIDO_MIN_LENGTH, `Mínimo ${APELLIDO_MIN_LENGTH} caracteres.`)
      .max(APELLIDO_MAX_LENGTH, `Máximo ${APELLIDO_MAX_LENGTH} caracteres.`)
      .regex(REGEX_NOMBRES_APELLIDOS, 'Apellidos inválidos (solo letras, espacios, \', -).')
      .transform(toTitleCase),

  correo: z
      .string()
      .trim()
      .min(1, 'El Correo Electrónico es obligatorio.')
      .email('Formato de correo no válido.')
      .regex(REGEX_CORREO_INSTITUCIONAL, 'Se requiere un correo institucional válido (ej: usuario@uni.edu.bo).')
      .toLowerCase(),

  ci: z.string().trim().min(1, 'El CI es requerido (debe venir de la verificación).'),

  celular: z
      .string()
      .trim()
      .min(1, 'El número de celular es obligatorio.')
      .length(CELULAR_LENGTH, `El celular debe tener ${CELULAR_LENGTH} dígitos.`)
      .regex(REGEX_CELULAR_BOLIVIA, 'Número inválido (debe empezar con 6 o 7 y tener 8 dígitos).'),

  areas: z.array(z.number()).min(1, { message: 'Debe asignar al menos un área.' }),
});

export type ResponsableFormData = z.infer<typeof datosResponsableSchema>;

export type ResponsableFormInput = ResponsableFormData & {
    gestionPasadaId?: string | number | null;
};