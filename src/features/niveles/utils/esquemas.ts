import { z } from 'zod';

export function normalizarTexto(str: string): string {
  if (!str) return '';
  
  let texto = str
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  texto = texto.replace(/([aeiou])\1+/gi, '$1');
  texto = texto.replace(/([^lrcn\s])\1+/gi, '$1');
  texto = texto.replace(/([lrcn])\1{2,}/gi, '$1$1');
  
  return texto.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export const crearNivelEsquema = z.object({
  nombre: z.string()
      .trim()
      .min(1, { message: 'El campo Nombre del nivel es obligatorio.' })
      .refine(val => /^[a-zA-Z0-9\s.]+$/.test(val), { 
          message: 'El campo Nombre del nivel contiene caracteres no permitidos.' 
      })
      .transform(val => normalizarTexto(val)) 
      .pipe(z.string()
        .min(3, 'El campo Nombre del nivel requiere un mínimo de 3 caracteres.')
        .max(30, 'El Nombre del Nivel no puede tener más de 30 caracteres.')
      )
});

export type CrearNivelFormData = z.infer<typeof crearNivelEsquema>;