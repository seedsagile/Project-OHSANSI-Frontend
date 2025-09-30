import { z } from 'zod';

export const crearAreaEsquema = z.object({
  nombre: z.string()
      .refine(val => val.trim().replace(/\s+/g, ' ') === val, {
        message: 'El nombre no debe tener espacios innecesarios al inicio, al final o entre palabras.',
      })
      .transform(val => val.trim().replace(/\s+/g, ' '))
      .pipe(z.string()
        .min(1, 'El campo Nombre del Area es obligatorio.')
        .min(2, `El Nombre del Area debe tener al menos 2 caracteres.`)
        .max(30, `El Nombre del Area no puede tener más de 30 caracteres.`)
        .regex(/^[a-zA-Z\s\u00C0-\u017F]+$/, 'El campo Nombre del Area solo permite letras, espacios y acentos.')
      )
});

export type CrearAreaFormData = z.infer<typeof crearAreaEsquema>;