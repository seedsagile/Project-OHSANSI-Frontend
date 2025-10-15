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
    .refine((val) => /^[a-zA-Z0-9\s.\-áéíóúÁÉÍÓÚñÑüÜ]+$/.test(val), {
      message:
        'El campo contiene caracteres no permitidos. Solo se aceptan letras, números, espacios, acentos, puntos y guiones.',
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
