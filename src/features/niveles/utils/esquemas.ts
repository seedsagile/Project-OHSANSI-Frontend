import { z } from 'zod';

const toTitleCase = (str: string): string => {
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

export const crearNivelEsquema = z.object({
    nombre: z.string()
        .transform(val => val.trim().replace(/\s+/g, ' ')) // Limpia espacios
        .pipe(z.string()
            .min(1, 'El campo Nombre del Nivel es obligatorio.')
            .min(2, `El Nombre del Nivel debe tener al menos 2 caracteres.`)
            .max(30, `El Nombre del Nivel no puede tener más de 30 caracteres.`)
            .regex(/^[a-zA-Z\s\u00C0-\u017F]+$/, 'El campo Nombre del Nivel solo permite letras, espacios y acentos.')
        )
        .transform(toTitleCase)
});

export type CrearNivelFormData = z.infer<typeof crearNivelEsquema>;