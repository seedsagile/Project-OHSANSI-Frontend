// src/evaluadores/validations/evaluatorValidation.ts

import { z } from 'zod';

export const schemaEvaluador = z.object({
  // Validaciones para Nombre
  nombre: z.string()
    .min(1, 'El campo Nombre es obligatorio.')
    .min(2, 'El campo Nombre requiere un mínimo de 2 caracteres.')
    .max(20, 'El campo Nombre tiene un límite máximo de 20 caracteres.')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El campo Nombre solo permite letras, espacios y acentos.')
    .refine((val) => val.trim().length > 0, {
      message: 'El campo Nombre no puede contener solo espacios en blanco.'
    })
    .refine((val) => !/\s{2,}/.test(val), {
      message: 'El campo Nombre no puede contener espacios consecutivos.'
    })
    .transform((val) => val.trim()),

  // Validaciones para Apellido
  apellido: z.string()
    .min(1, 'El campo Apellido es obligatorio.')
    .min(2, 'El campo Apellido requiere un mínimo de 2 caracteres.')
    .max(20, 'El campo Apellido tiene un límite máximo de 20 caracteres.')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El campo Apellido solo permite letras, espacios y acentos.')
    .refine((val) => val.trim().length > 0, {
      message: 'El campo Apellido no puede contener solo espacios en blanco.'
    })
    .refine((val) => !/\s{2,}/.test(val), {
      message: 'El campo Apellido no puede contener espacios consecutivos.'
    })
    .transform((val) => val.trim()),

  // Validaciones para Email
  email: z.string()
    .min(1, 'El campo Email es obligatorio.')
    .email('El campo Email debe tener un formato válido (ej. usuario@uno.com).')
    .regex(/^[a-zA-Z0-9@._\-+]+$/, 'El campo Email solo permite letras, números, @, punto, guión bajo, guión y más.')
    .refine((val) => val.trim().length > 0, {
      message: 'El campo Email no puede contener solo espacios en blanco.'
    })
    .transform((val) => val.trim()),

  // Validaciones para CI
  ci: z.string()
    .min(1, 'El campo CI es obligatorio.')
    .min(7, 'El campo CI requiere un mínimo de 7 caracteres.')
    .max(15, 'El campo CI tiene un límite máximo de 15 caracteres.')
    .regex(/^[0-9]+$/, 'El campo CI solo permite caracteres numéricos.')
    .refine((val) => val.trim().length > 0, {
      message: 'El campo CI no puede contener solo espacios en blanco.'
    })
    .transform((val) => val.trim()),

  // Validaciones para Contraseña
  password: z.string()
    .min(1, 'El campo Contraseña es obligatorio.')
    .min(8, 'La contraseña debe tener al menos 8 caracteres.')
    .max(32, 'La contraseña tiene un límite máximo de 32 caracteres.')
    .refine((val) => val.trim().length > 0, {
      message: 'El campo Contraseña no puede contener solo espacios en blanco.'
    })
    .refine((val) => !/^\s+|\s+$/.test(val), {
      message: 'La contraseña no puede comenzar ni terminar con espacios.'
    }),

  // Validación para Confirmación de Contraseña
  password_confirmation: z.string()
    .min(1, 'Debe confirmar la contraseña.')
    .refine((val) => val.trim().length > 0, {
      message: 'El campo Confirmar Contraseña no puede contener solo espacios en blanco.'
    }),

  // Validaciones para Código de Evaluador
  codigo_evaluador: z.string()
    .min(1, 'El campo Código de acceso es obligatorio.')
    .max(10, 'El campo Código de acceso tiene un límite máximo de 10 caracteres.')
    .regex(/^[a-zA-Z0-9]+$/, 'El campo Código de acceso permite únicamente números y letras.')
    .refine((val) => val.trim().length > 0, {
      message: 'El campo Código de acceso no puede contener solo espacios en blanco.'
    })
    .transform((val) => val.trim())

}).refine((data) => data.password === data.password_confirmation, {
  message: "Las contraseñas no coinciden.",
  path: ["password_confirmation"],
});