import { z } from 'zod';

export function normalizarParaGuardar(str: string): string {
  if (!str) return '';
  const textoLimpio = str.trim().replace(/\s+/g, ' ');

  return textoLimpio
    .split(' ')
    .map((word) => {
      if (word.length > 0 && /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]/.test(word)) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
      return word;
    })
    .join(' ');
}

export function normalizarParaComparar(str: string): string {
  if (!str) return '';
  const textoNormalizado = str
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  return textoNormalizado
    .split(' ')
    .map((word) => (word.endsWith('s') ? word.slice(0, -1) : word))
    .join(' ');
}

export const crearNivelEsquema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, { message: 'El campo Nombre del nivel es obligatorio.' })
    // 1. Valida los caracteres permitidos en general
    .refine((val) => /^[a-zA-Z0-9\s.\-áéíóúÁÉÍÓÚñÑüÜ]+$/.test(val), {
      message:
        'Contiene caracteres no permitidos.',
    })
    // 2. Valida que el primer carácter sea una letra o número
    .refine((val) => /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ]/.test(val), {
      message: 'El primer carácter debe ser una letra o un número.',
    })
    // 3. Valida que no haya guiones o puntos consecutivos
    .refine((val) => !/(--|\.\.)/.test(val), {
      message: 'No se permiten puntos o guiones consecutivos.',
    })
    // 4. Valida que el string no contenga solo símbolos
    .refine((val) => /[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ]/.test(val), {
        message: 'El nombre debe contener al menos una letra o número.',
    })
    .transform((val) => normalizarParaGuardar(val))
    .pipe(
      z
        .string()
        .min(13, 'El campo Nombre del nivel requiere un mínimo de 13 caracteres.')
        .max(30, 'El Nombre del Nivel no puede tener más de 30 caracteres.')
    ),
});

export type CrearNivelFormData = z.infer<typeof crearNivelEsquema>;