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

/*export function normalizarParaComparar(str: string): string {
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
}*/

export function normalizarParaComparar(str: string): string {
  if (!str) return '';
  
  // 1. Normalizar: trim, lowercase, quitar acentos
  let textoNormalizado = str
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  // 2. Normalizar espacios múltiples a uno solo
  textoNormalizado = textoNormalizado.replace(/\s+/g, ' ');

  // 3. Quitar todos los caracteres no alfanuméricos excepto espacios
  textoNormalizado = textoNormalizado.replace(/[^a-z0-9\s]/g, '');

  // 4. Quitar letras duplicadas consecutivas (ej: "primeeero" → "primero", "classse" → "clase")
  textoNormalizado = textoNormalizado.replace(/(.)\1+/g, '$1');

  // 5. Quitar todas las "s" al final de cada palabra (plurales)
  textoNormalizado = textoNormalizado
    .split(' ')
    .map((word) => word.replace(/s+$/g, ''))
    .join(' ');

  // 6. Trim final por si quedaron espacios
  return textoNormalizado.trim();
}


export const crearNivelEsquema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, { message: 'El campo Nombre del Nivel es obligatorio.' })
    // 1. Valida los caracteres permitidos en general
    .refine((val) => /^[a-zA-Z0-9\s.\-áéíóúÁÉÍÓÚñÑüÜ]+$/.test(val), {
      //message: 'Contiene caracteres no permitidos.',
      message: 'El campo Nombre del Nivel contiene caracteres especiales. Solo se permiten los caracteres especiales "." y "-"',
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
    //no permite registrar solo numero 
    .refine((val) => !/^[0-9\s.\-]+$/.test(val), {
      message: 'No se puede registrar un nivel compuesto solo por números.',
    })
    .transform((val) => normalizarParaGuardar(val))
    .pipe(
      z
        .string()
        //.min(13, 'El campo Nombre del nivel requiere un mínimo de 13 caracteres.')
        //.max(30, 'El Nombre del Nivel no puede tener más de 30 caracteres.')
        .max(40, 'El Nombre del Nivel no puede tener más de 40 caracteres.')
    ),
});

export type CrearNivelFormData = z.infer<typeof crearNivelEsquema>;
