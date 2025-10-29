import { z } from 'zod';

const NOMBRE_MIN_LENGTH = 2;
export const NOMBRE_MAX_LENGTH = 30;

const APELLIDO_MIN_LENGTH = 2;
export const APELLIDO_MAX_LENGTH = 30;

const CI_MIN_LENGTH = 5;
export const CI_MAX_LENGTH = 10;

const CELULAR_MIN_LENGTH = 8;
export const CELULAR_MAX_LENGTH = 8;

const CORREO_MIN_LENGTH = 6;
export const CORREO_MAX_LENGTH = 60;

const REGEX_TIENE_NUMEROS = /\d/;
const REGEX_TIENE_CARACTERES_INVALIDOS = /[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/;

const REGEX_CI_BOLIVIA_ESTRUCTURA = /^\d+[A-Z]?$/;
const REGEX_CI_CARACTERES_INVALIDOS = /[^0-9A-Z]/;
const REGEX_CELULAR_BOLIVIA = /^[67]\d{7}$/;
const REGEX_CORREO = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const REGEX_CORREO_INVALID_CHARS = /[^a-zA-Z0-9._\-@]/;

/**
 * Sanitiza nombres y apellidos:
 * 1. Elimina espacios al inicio y final.
 * 2. Reduce espacios múltiples internos a uno solo.
 */
const sanitizeSpaces = (str: string): string => {
    if (!str) return '';
    return str.trim().replace(/\s+/g, ' ');
};

/**
 * Convierte a formato Título (Capitaliza primera letra de cada palabra).
 * Asume que los espacios ya están sanitizados.
 */
const toTitleCase = (str: string): string => {
    if (!str) return '';
    // No se convierte a minúsculas primero para respetar mayúsculas intencionales si las hubiera,
    // aunque la validación de Nombres/Apellidos podría restringir esto.
    // Se capitaliza después de sanitizar espacios.
    return str.split(' ').map(word =>
        word.length > 0 ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''
    ).join(' ');
};

/**
 * Sanitiza CI: Elimina todos los espacios y convierte a mayúsculas.
 */
const sanitizeCI = (str: string): string => {
    if (!str) return '';
    return str.replace(/\s+/g, '').toUpperCase();
}

/**
 * Sanitiza Correo: Elimina todos los espacios y convierte a minúsculas.
 */
const sanitizeEmail = (str: string): string => {
    if (!str) return '';
    return str.replace(/\s+/g, '').toLowerCase();
}

/**
 * Sanitiza Celular: Elimina espacios y prefijos (+591 o 591) para validar solo los 8 dígitos.
 * NOTA: Esta sanitización es para VALIDACIÓN. Al guardar, podrías querer mantener el prefijo si existe.
 */
const sanitizeCelularForValidation = (str: string): string => {
    if (!str) return '';
    let sanitized = str.replace(/\s+/g, '');
    if (sanitized.startsWith('+591')) {
        sanitized = sanitized.substring(4);
    } else if (sanitized.startsWith('591')) {
        sanitized = sanitized.substring(3);
    }
    return sanitized.replace(/\D/g, '');
}


// --- Esquemas de Validación Zod de CI ---
export const verificacionCISchema = z.object({
    ci: z
        .string({ message: 'El campo Verificar carnet de identidad es obligatorio.' })
        .transform(sanitizeCI)
        .pipe(z.string()
            .min(1, 'El campo Verificar carnet de identidad es obligatorio.')
            .min(CI_MIN_LENGTH, { message: `Mínimo ${CI_MIN_LENGTH} caracteres.` })
            .max(CI_MAX_LENGTH, { message: `Máximo ${CI_MAX_LENGTH} caracteres.` })
            .superRefine((val, ctx) => {
                if (REGEX_CI_CARACTERES_INVALIDOS.test(val)) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "El campo Verificar carnet de identidad contiene caracteres especiales.",
                    });
                }
                if (!REGEX_CI_BOLIVIA_ESTRUCTURA.test(val)) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Formato no válido",
                    });
                }
            })
        ),
});

export type VerificacionCIForm = z.infer<typeof verificacionCISchema>;

export const datosResponsableSchema = z.object({
    nombres: z
        .string({ message: 'El campo Nombres es obligatorio.' })
        .transform(sanitizeSpaces)
        .pipe(z.string()
            .min(1, 'El campo Nombres es obligatorio.')
            .min(NOMBRE_MIN_LENGTH, `Mínimo ${NOMBRE_MIN_LENGTH} caracteres.`)
            .max(NOMBRE_MAX_LENGTH, `Máximo ${NOMBRE_MAX_LENGTH} caracteres.`)
            .superRefine((val, ctx) => {
                let hasError = false;
                if (REGEX_TIENE_NUMEROS.test(val)) {
                    ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "El campo Nombres contiene caracteres numéricos. Sólo se aceptan letras",
                    });
                    hasError = true;
                }
                if (!hasError && REGEX_TIENE_CARACTERES_INVALIDOS.test(val)) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "El campo Nombres contiene caracteres especiales. Solo se aceptan letras",
                    });
                }
            })
        )
        .transform(toTitleCase),

    apellidos: z
        .string({ message: 'El campo Apellidos es obligatorio.' })
        .transform(sanitizeSpaces)
        .pipe(z.string()
            .min(1, 'El campo Apellidos es obligatorio.')
            .min(APELLIDO_MIN_LENGTH, `Mínimo ${APELLIDO_MIN_LENGTH} caracteres.`)
            .max(APELLIDO_MAX_LENGTH, `Máximo ${APELLIDO_MAX_LENGTH} caracteres.`)
            .superRefine((val, ctx) => {
                let hasError = false;
                if (REGEX_TIENE_NUMEROS.test(val)) {
                    ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "El campo Apellidos contiene caracteres numéricos. Sólo se aceptan letras",
                    });
                    hasError = true;
                }
                if (!hasError && REGEX_TIENE_CARACTERES_INVALIDOS.test(val)) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "El campo Apellidos contiene caracteres especiales. Solo se aceptan letras",
                    });
                }
            })
        )
        .transform(toTitleCase),

    correo: z
        .string({ message: 'El campo Correo electrónico es obligatorio.' })
        .transform(sanitizeEmail)
        .pipe(z.string()
            .min(1, 'El campo Correo electrónico es obligatorio.')
            .min(CORREO_MIN_LENGTH, `Mínimo ${CORREO_MIN_LENGTH} caracteres.`)
            .max(CORREO_MAX_LENGTH, `Máximo ${CORREO_MAX_LENGTH} caracteres.`)
            .regex(REGEX_CORREO, 'El campo Correo electrónico debe tener un formato válido (ej. usuario@uno.com).')
            .refine(val => !REGEX_CORREO_INVALID_CHARS.test(val), {
                message: "El correo contiene caracteres no permitidos."
            })
        ),

    ci: z.string().trim().min(1, 'El CI es requerido (debe venir de la verificación).'),

    celular: z
        .string({ message: 'El número de celular es obligatorio.' })
        .transform(sanitizeCelularForValidation)
        .pipe(z.string()
            .min(1, 'El número de celular es obligatorio.')
            .length(CELULAR_MIN_LENGTH, `El celular debe tener ${CELULAR_MIN_LENGTH} dígitos.`)
            .regex(REGEX_CELULAR_BOLIVIA, 'Número inválido (debe empezar con 6 o 7 y tener 8 dígitos).')
        ),

    areas: z
        .array(z.number())
        .min(1, { message: 'Debe asignar al menos un área.' }),
});

export type ResponsableFormData = z.infer<typeof datosResponsableSchema>;

export type ResponsableFormInput = ResponsableFormData & {
    gestionPasadaId?: string | number | null;
};