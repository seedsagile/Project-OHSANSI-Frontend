// ------------------------- NOTA MÍNIMA -------------------------
export const NOTA_MIN_MIN_LENGTH = 2; // mínimo 2 caracteres numéricos
export const NOTA_MIN_MAX_LENGTH = 3; // máximo 3 caracteres numéricos
export const NOTA_MIN_REGEX_NUMERIC = /^[0-9]+(\.[0-9]+)?$/;
// permite números enteros o decimales positivos, ej: 5, 9.5

export const MENSAJE_NOTA_MIN_CORTA = `El campo Nota Mínima requiere un mínimo de ${NOTA_MIN_MIN_LENGTH} caracteres numéricos`;
export const MENSAJE_NOTA_MIN_CARACTERES_ESPECIALES =
  "El campo Nota Mínima contiene caracteres especiales. Solo se permiten números";
export const MENSAJE_NOTA_MIN_CARACTERES_LITERALS =
  "El campo Nota Mínima contiene caracteres literales. Solo se permiten números";
export const MENSAJE_NOTA_MIN_REGISTRO_EXITOSO = (valor: string) =>
  `¡Registro Exitoso! - La nota mínima "${valor}" ha sido registrada correctamente.`;

// ----------------- CANTIDAD MÁXIMA DE COMPETIDORES -----------------
export const CANT_COMPET_MAX_MIN_LENGTH = 2; // mínimo 2 caracteres
export const CANT_COMPET_MAX_MAX_LENGTH = 4; // máximo 4 caracteres
export const CANT_COMPET_MAX_REGEX_NUMERIC = /^[0-9]+$/;
// solo enteros positivos

export const MENSAJE_CANT_COMPET_CORTA = `El campo Cantidad máxima de competidores requiere un mínimo de ${CANT_COMPET_MAX_MIN_LENGTH} caracteres numéricos`;
export const MENSAJE_CANT_COMPET_CARACTERES_ESPECIALES =
  "El campo Cantidad máxima de competidores contiene caracteres especiales. Solo se permiten números enteros";
export const MENSAJE_CANT_COMPET_CARACTERES_LITERALS =
  "El campo Cantidad máxima de competidores contiene caracteres literales. Solo se permiten números enteros";
export const MENSAJE_CANT_COMPET_REGISTRO_EXITOSO = (valor: string) =>
  `¡Registro Exitoso! - La Cantidad máxima de competidores "${valor}" ha sido registrada correctamente.`;

// ----------------- CAMPOS OPCIONALES Y LIMPIEZA DE ESPACIOS -----------------
export const NOTA_MIN_DEFAULT = ""; // campo no obligatorio
export const CANT_COMPET_MAX_DEFAULT = ""; // campo no obligatorio

export const LIMPIAR_ESPACIOS = (valor: string) =>
  valor.trim().replace(/\s+/g, "");
