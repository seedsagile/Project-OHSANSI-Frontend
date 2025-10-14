/*import { z } from 'zod';

export const crearAreaEsquema = z.object({
  nombre: z.string()
      .transform(val => val.trim().replace(/\s+/g, ' '))
      .pipe(z.string()
        .min(1, 'El campo Nombre del Área es obligatorio.')
        .min(2, 'El Nombre del Área debe tener al menos 2 caracteres.')
        .max(30, 'El Nombre del Área no puede tener más de 30 caracteres.')
        .regex(/^[a-zA-Z\s\u00C0-\u017F]+$/, 'El campo Nombre del Área solo permite letras, espacios y acentos.')
      )
});

export type CrearAreaFormData = z.infer<typeof crearAreaEsquema>;*/

import { z } from 'zod';

// Función para convertir a formato título (Primera letra mayúscula)
const toTitleCase = (str: string): string => {
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const crearAreaEsquema = z.object({
  nombre: z
    .string()
    .transform((val) => {
      // Si el valor solo contiene espacios, devolver string vacío para forzar limpieza
      if (val.trim().length === 0) {
        return '';
      }
      return val;
    })
    .refine((val) => val.length > 0, {
      message: 'El campo Nombre del Área es obligatorio.',
    })
    .refine((val) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(val), {
      message: 'El campo Nombre del Área solo permite letras, espacios y acentos.',
    })
    .transform((val) => {
      // Limpia espacios extras y convierte a formato título
      const cleaned = val.trim().replace(/\s+/g, ' ');
      return toTitleCase(cleaned);
    })
    .pipe(
      z
        .string()
        .min(2, 'El Nombre del Área debe tener al menos 2 caracteres.')
        .max(30, 'El Nombre del Área no puede tener más de 30 caracteres.')
    ),
});

export type CrearAreaFormData = z.infer<typeof crearAreaEsquema>;
