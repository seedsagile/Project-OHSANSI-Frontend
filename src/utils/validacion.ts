import { z } from 'zod';

// Helper para limpiar espacios y reemplazar comas por puntos si es necesario
const limpiarEspacios = (value: string) => value.trim().replace(/\s+/g, '');

export const esquemaNotas = z.object({
  notaMinima: z
    .string()
    .refine((val) => limpiarEspacios(val) !== '', {
      message: 'El campo Nota mínima es obligatorio.',
    })
    .refine((val) => /^(\d+([.,]\d+)?)+$/.test(limpiarEspacios(val)), {
      message: 'Solo se permiten números y coma en Nota mínima.',
    })
    .transform((val) => limpiarEspacios(val).replace(',', '.')), // opcional: convertir coma a punto

  notaMaxima: z
    .string()
    .refine((val) => limpiarEspacios(val) !== '', {
      message: 'El campo Nota máxima es obligatorio.',
    })
    .refine((val) => /^(\d+([.,]\d+)?)+$/.test(limpiarEspacios(val)), {
      message: 'Solo se permiten números y coma en Nota máxima.',
    })
    .transform((val) => limpiarEspacios(val).replace(',', '.')),

  cantidadMaxCompetidores: z
    .string()
    .refine((val) => limpiarEspacios(val) !== '', {
      message: 'El campo Cantidad máxima de competidores es obligatorio.',
    })
    .refine((val) => /^[0-9]+$/.test(limpiarEspacios(val)), {
      message: 'Solo se permiten números enteros en Cantidad máxima de competidores.',
    })
    .transform((val) => parseInt(limpiarEspacios(val), 10)),
});
