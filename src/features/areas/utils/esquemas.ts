//src/features/utils/esquemas.ts
import { z } from 'zod';

// Función para eliminar caracteres duplicados (excepto casos legítimos en español)
const eliminarCaracteresDuplicados = (str: string): string => {
  return str
    .split('')
    .filter((char, index, arr) => {
      if (index === 0) return true;

      const anterior = arr[index - 1];

      // Si es un espacio, permitir solo si el anterior no es espacio
      if (char === ' ') {
        return anterior !== ' ';
      }

      // Casos especiales: permitir letras dobles legítimas en español
      const letrasDoblesPermitidas = ['l', 'r', 'o', 'c', 'n'];
      if (letrasDoblesPermitidas.includes(char.toLowerCase()) && char === anterior) {
        // Verificar que no sea triple (ej: "lll" no es válido)
        if (index >= 2 && arr[index - 2] === char) {
          return false; // Bloquear el tercero
        }
        return true; // Permitir el doble
      }

      // Para otros caracteres, permitir solo si el anterior es diferente
      return anterior !== char;
    })
    .join('');
};

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
    // Validación 1 y 2: Campo obligatorio
    .min(1, 'El campo Nombre del Área es obligatorio.')
    .refine((val) => val.trim().length > 0, {
      message: 'El campo Nombre del Área es obligatorio.',
    })
    // Validación 6 y 7: Solo letras y espacios (con acentos españoles)
    .refine((val) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(val.trim()), {
      message:
        'El campo Nombre del Área contiene caracteres no permitidos. Solo se permiten letras y espacios.',
    })
    // Validación 3 y 4: Mínimo 4 caracteres
    // .refine((val) => val.trim().length >= 4, {
    //   message: 'El Nombre del Área requiere un mínimo de 4 caracteres.',
    // })
    // Validación 5: Máximo 30 caracteres
    .refine((val) => val.trim().length <= 30, {
      message: 'El Nombre del Área no puede tener más de 30 caracteres.',
    })
    // Transformación para normalizar el dato
    .transform((val) => {
      // Validación 11: Eliminar espacios al inicio, final y múltiples entre palabras
      let limpio = val.trim().replace(/\s+/g, ' ');

      // Validación 10: Eliminar caracteres duplicados
      limpio = eliminarCaracteresDuplicados(limpio);

      // Validación 8: Convertir a formato título (Primera letra mayúscula)
      // MANTENEMOS LOS TILDES - No eliminamos acentos
      return toTitleCase(limpio);
    }),
});

export type CrearAreaFormData = z.infer<typeof crearAreaEsquema>;
