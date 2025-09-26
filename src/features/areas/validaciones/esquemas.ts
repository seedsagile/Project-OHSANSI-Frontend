// src/features/areas/validaciones/esquemas.ts
import { z } from 'zod';

export const crearAreaEsquema = z.object({
  nombre: z
    .string()
    .min(1, 'El nombre del área es obligatorio')
    .max(30, 'El nombre no puede exceder 30 caracteres')
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/,
      'Solo se permiten letras, espacios y acentos'
    )
    .transform(val => val.trim())
});

export type CrearAreaFormData = z.infer<typeof crearAreaEsquema>;

// Función para validar nombre único
export const validarNombreUnico = (nombre: string, areasExistentes: { nombre: string }[]): boolean => {
  return !areasExistentes.some(
    area => area.nombre.toLowerCase().trim() === nombre.toLowerCase().trim()
  );
};

// Tipos para manejo de errores
export type ErroresValidacion = {
  nombre?: string;
  general?: string;
};