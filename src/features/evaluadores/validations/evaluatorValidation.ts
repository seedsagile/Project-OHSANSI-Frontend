// src/evaluadores/validations/evaluatorValidation.ts

import { z } from 'zod';

export const schemaEvaluador = z.object({
  // Validaciones para Nombre
  nombre: z.string()
    .min(1, 'El campo Nombre es obligatorio.')
    .transform((val) => val.trim().replace(/\s+/g, ' ')) // LIMPIA: espacios inicio/fin y múltiples espacios
    .pipe(
      z.string()
        .min(2, 'El campo Nombre requiere un mínimo de 2 caracteres.')
        .max(20, 'El campo Nombre tiene un límite máximo de 20 caracteres.')
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El campo Nombre solo permite letras, espacios y acentos.')
    ),

  // Validaciones para Apellido
  apellido: z.string()
    .min(1, 'El campo Apellido es obligatorio.')
    .transform((val) => val.trim().replace(/\s+/g, ' ')) // LIMPIA: espacios inicio/fin y múltiples espacios
    .pipe(
      z.string()
        .min(2, 'El campo Apellido requiere un mínimo de 2 caracteres.')
        .max(20, 'El campo Apellido tiene un límite máximo de 20 caracteres.')
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El campo Apellido solo permite letras, espacios y acentos.')
    ),

  // Validaciones para Email
  email: z.string()
    .min(1, 'El campo Email es obligatorio.')
    .transform((val) => val.trim()) // LIMPIA: espacios inicio/fin
    .pipe(
      z.string()
        .email('El campo Email debe tener un formato válido (ej. usuario@uno.com).')
        .regex(/^[a-zA-Z0-9@._\-+]+$/, 'El campo Email solo permite letras, números, @, punto, guión bajo, guión y más.')
    ),

  // Validaciones para CI
  ci: z.string()
    .min(1, 'El campo CI es obligatorio.')
    .transform((val) => val.trim()) // LIMPIA: espacios inicio/fin
    .pipe(
      z.string()
        .min(7, 'El campo CI requiere un mínimo de 7 caracteres.')
        .max(15, 'El campo CI tiene un límite máximo de 15 caracteres.')
        .regex(/^[0-9]+$/, 'El campo CI solo permite caracteres numéricos.')
    ),

  // Validaciones para Contraseña
  password: z.string()
    .min(1, 'El campo Contraseña es obligatorio.')
    .transform((val) => val.trim()) // LIMPIA: espacios inicio/fin
    .pipe(
      z.string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres.')
        .max(32, 'La contraseña tiene un límite máximo de 32 caracteres.')
    ),

  // Validación para Confirmación de Contraseña
  password_confirmation: z.string()
    .min(1, 'Debe confirmar la contraseña.')
    .transform((val) => val.trim()), // LIMPIA: espacios inicio/fin

  // Validaciones para Código de Evaluador
  codigo_evaluador: z.string()
    .min(1, 'El campo Código de acceso es obligatorio.')
    .transform((val) => val.trim()) // LIMPIA: espacios inicio/fin
    .pipe(
      z.string()
        .max(10, 'El campo Código de acceso tiene un límite máximo de 10 caracteres.')
        .regex(/^[a-zA-Z0-9]+$/, 'El campo Código de acceso permite únicamente números y letras.')
    )

}).refine((data) => data.password === data.password_confirmation, {
  message: "Las contraseñas no coinciden.",
  path: ["password_confirmation"]
});