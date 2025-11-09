// src/features/evaluaciones/utils/validations.ts

export const validarCalificacion = (calificacion: string): { valido: boolean; mensaje?: string } => {
  if (!calificacion || calificacion.trim() === '') {
    return { valido: false, mensaje: 'La calificación es requerida' };
  }

  const nota = parseFloat(calificacion);

  if (isNaN(nota)) {
    return { valido: false, mensaje: 'La calificación debe ser un número válido' };
  }

  if (nota < 0 || nota > 100) {
    return { valido: false, mensaje: 'La calificación debe estar entre 0 y 100' };
  }

  return { valido: true };
};

export const validarObservaciones = (observaciones: string): boolean => {
  return observaciones.length <= 500; // Máximo 500 caracteres
};

export const formatearNombreCompleto = (nombres: string, apellidos: string): string => {
  return `${nombres} ${apellidos}`.trim();
};