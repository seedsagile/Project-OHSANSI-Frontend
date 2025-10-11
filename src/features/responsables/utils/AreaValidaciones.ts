import { z } from "zod";

// =======================
// CONSTANTES
// =======================
export const NOMBRE_MIN_LENGTH = 3;
export const NOMBRE_MAX_LENGTH = 20;
export const APELLIDO_MIN_LENGTH = 3;
export const APELLIDO_MAX_LENGTH = 20;
export const CI_MIN_LENGTH = 4;
export const CI_MAX_LENGTH = 15;
export const CONTRASENA_MIN_LENGTH = 8;
export const CONTRASENA_MAX_LENGTH = 16;

export const REGEX_SOLO_LETRAS = /^[a-zA-Z\s\u00C0-\u017F]+$/;
export const REGEX_CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const REGEX_CI = /^\d+(?:[A-Za-z]|-[A-Za-z])?$/;
export const REGEX_CONTRASENA =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]+$/;

// =======================
// SCHEMAS
// =======================

// Nombre
export const NombreSchema = z
  .string()
  .trim()
  .min(1, {
    message: "El campo Nombre del responsable de área es obligatorio.",
  })
  .min(NOMBRE_MIN_LENGTH, {
    message: `El campo Nombre del responsablede área requiere un mínimo de ${NOMBRE_MIN_LENGTH} caracteres.`,
  })
  .max(NOMBRE_MAX_LENGTH, {
    message: `El campo Nombre acepta un máximo de ${NOMBRE_MAX_LENGTH} caracteres.`,
  })
  .regex(REGEX_SOLO_LETRAS, {
    message:
      "El campo Nombre del responsable de área contiene caracteres especiales. Solo se aceptan letras",
  })
  .transform((val) =>
    val
      .trim()
      .replace(/\s+/g, " ")
      .toLocaleLowerCase("es-ES")
      .replace(/(^\p{L})|(?<=\s)\p{L}/gu, (c) => c.toLocaleUpperCase("es-ES"))
  );

// Apellido
export const ApellidoSchema = z
  .string()
  .trim()
  .min(1, {
    message: "El campo Apellido del responsable de área es obligatorio.",
  })
  .min(APELLIDO_MIN_LENGTH, {
    message: `El campo Apellido del responsable de área requiere un mínimo de ${APELLIDO_MIN_LENGTH} caracteres.`,
  })
  .max(APELLIDO_MAX_LENGTH, {
    message: `El campo Apellido acepta un máximo de ${APELLIDO_MAX_LENGTH} caracteres.`,
  })
  .regex(REGEX_SOLO_LETRAS, {
    message:
      "El campo Nombre del responsable de área contiene caracteres especiales. Solo se aceptan letras",
  })
  .transform((val) =>
    val
      .trim()
      .replace(/\s+/g, " ")
      .toLocaleLowerCase("es-ES")
      .replace(/(^\p{L})|(?<=\s)\p{L}/gu, (c) => c.toLocaleUpperCase("es-ES"))
  );

// Correo
export const CorreoSchema = z
  .string()
  .trim()
  .min(6, {
    message: "El campo Correo electronico requiere un mínimo de 6 caracteres.",
  })
  .regex(REGEX_CORREO_VALIDO, {
    message:
      "El campo Correo electrónico institucional debe tener un formato válido (ej. usuario@uno.com).",
  })
  .transform((val) => val.toLowerCase());

// Carnet (CI)
export const CISchema = z
  .string()
  .trim()
  .min(1, {
    message: `El campo Carnet de identidad es obligatorio.`,
  })
  .min(4, {
    message: `El campo Carnet de identidad requiere un mínimo de 4 caracteres.`,
  })
  .max(CI_MAX_LENGTH, {
    message: `El campo CI acepta un máximo de ${CI_MAX_LENGTH} caracteres.`,
  })
  .regex(REGEX_CI, {
    message:
      "El campo Carnet de identidad contiene caracteres especiales. Solo se aceptan números y una letra",
  })
  .transform((val) => val.trim());

// Contraseña
export const ContrasenaSchema = z
  .string()
  .min(CONTRASENA_MIN_LENGTH, {
    message: `La contraseña debe tener al menos ${CONTRASENA_MIN_LENGTH} caracteres.`,
  })
  .max(CONTRASENA_MAX_LENGTH, {
    message: `La contraseña no puede superar los ${CONTRASENA_MAX_LENGTH} caracteres.`,
  })
  .regex(REGEX_CONTRASENA, {
    message:
      "La contraseña debe incluir al menos una mayúscula, un número y un carácter especial.",
  });

// Áreas
export const AreasSchema = z.array(z.number()).nonempty({
  message: "Debe seleccionar al menos un área para el responsable.",
});

// =======================
// SCHEMA GLOBAL
// =======================
export const ResponsableAreaSchema = z.object({
  nombre: NombreSchema,
  apellido: ApellidoSchema,
  correo: CorreoSchema,
  carnet: CISchema,
  contrasena: ContrasenaSchema,
  areas: AreasSchema,
});

export type ResponsableForm = z.infer<typeof ResponsableAreaSchema>;
