// src/features/niveles/utils/esquemas.ts

import { z } from 'zod';

// Función para convertir a formato título (Primera letra mayúscula)
const toTitleCase = (str: string): string => {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const crearNivelEsquema = z.object({
  nombre: z.string()
      // 1. Validar que no sean solo espacios en blanco antes de cualquier otra cosa.
      .refine(val => val.trim().length > 0, {
        message: 'El campo Nombre del Nivel es obligatorio.',
      })
      // 2. Validar el patrón de caracteres permitidos.
      .refine(val => /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(val), {
        message: 'El campo Nombre del Nivel solo permite letras, espacios y acentos.',
      })
      // 3. Limpiar espacios y convertir a formato Título.
      .transform(val => {
        const cleaned = val.trim().replace(/\s+/g, ' ');
        return toTitleCase(cleaned);
      })
      // 4. Aplicar las validaciones de longitud al valor ya transformado.
      .pipe(z.string()
        .min(2, 'El Nombre del Nivel debe tener al menos 2 caracteres.')
        .max(30, 'El Nombre del Nivel no puede tener más de 30 caracteres.')
      )
});

export type CrearNivelFormData = z.infer<typeof crearNivelEsquema>;