// src/evaluadores/validations/evaluatorValidation.ts

import { z } from 'zod';

export const schemaEvaluador = z.object({
  // Validaciones para Nombre (criterios 1-4)
  nombre: z.string()
    .min(1, 'El campo Nombre es obligatorio.')
    .min(2, 'El campo Nombre requiere un mínimo de 2 caracteres.')
    .max(20, 'El campo Nombre tiene un límite máximo de 20 caracteres.')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El campo Nombre solo permite letras, espacios y acentos.'),

  // Validaciones para Apellido (mismas reglas que nombre)
  apellido: z.string()
    .min(1, 'El campo Apellido es obligatorio.')
    .min(2, 'El campo Apellido requiere un mínimo de 2 caracteres.')
    .max(20, 'El campo Apellido tiene un límite máximo de 20 caracteres.')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El campo Apellido solo permite letras, espacios y acentos.'),

  // Validaciones para Email (criterios 5-8)
  email: z.string()
    .min(1, 'El campo Email es obligatorio.')
    .email('El campo Email debe tener un formato válido (ej. usuario@uno.com).')
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'El campo Email no permite caracteres especiales.'),

  // Validaciones para CI (criterios 9-14)
  ci: z.string()
    .min(1, 'El campo CI es obligatorio.')
    .min(7, 'El campo CI requiere un mínimo de 7 caracteres.')
    .max(15, 'El campo CI tiene un límite máximo de 15 caracteres.')
    .regex(/^[0-9]+$/, 'El campo CI solo permite caracteres numéricos.'),

  // Validaciones para Contraseña
  password: z.string()
    .min(1, 'El campo Contraseña es obligatorio.')
    .min(8, 'La contraseña debe tener al menos 8 caracteres.')
    .max(50, 'La contraseña tiene un límite máximo de 50 caracteres.'),

  // Validación para Confirmación de Contraseña
  password_confirmation: z.string()
    .min(1, 'Debe confirmar la contraseña.'),

  // Validaciones para Código de Evaluador (criterios 15-19)
  codigo_evaluador: z.string()
    .min(1, 'El campo Código de acceso es obligatorio.')
    .max(10, 'El campo Código de acceso tiene un límite máximo de 10 caracteres.')
    .regex(/^[a-zA-Z0-9]+$/, 'El campo Código de acceso permite únicamente números y letras.')

}).refine((data) => data.password === data.password_confirmation, {
  message: "Las contraseñas no coinciden.",
  path: ["password_confirmation"],
});