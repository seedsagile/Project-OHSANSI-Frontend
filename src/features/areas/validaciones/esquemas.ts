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

// Función para normalizar texto (quitar acentos, espacios, convertir a minúsculas)
const normalizarTexto = (texto: string): string => {
  return texto
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // Reemplazar múltiples espacios por uno solo
    .replace(/[áàäâ]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/\s/g, ''); // Quitar espacios para comparación final
};

// Función para quitar 's' al final (para detectar plurales/singulares)
const quitarSFinal = (texto: string): string => {
  return texto.endsWith('s') ? texto.slice(0, -1) : texto;
};

// Función para validar nombre único con normalización inteligente
export const validarNombreUnico = (nombre: string, areasExistentes: { nombre: string }[]): boolean => {
  const nombreNormalizado = normalizarTexto(nombre);
  const nombreSinS = quitarSFinal(nombreNormalizado);
  
  return !areasExistentes.some(area => {
    const areaNormalizada = normalizarTexto(area.nombre);
    const areaSinS = quitarSFinal(areaNormalizada);
    
    // Comparar tanto la versión normal como sin 's' final
    return areaNormalizada === nombreNormalizado || 
           areaNormalizada === nombreSinS || 
           areaSinS === nombreNormalizado ||
           areaSinS === nombreSinS;
  });
};

// Función para formatear nombre (Primera letra mayúscula, resto minúsculas)
export const formatearNombre = (nombre: string): string => {
  return nombre
    .trim()
    .replace(/\s+/g, ' ') // Normalizar espacios múltiples
    .toLowerCase()
    .split(' ')
    .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
    .join(' ');
};

// Tipos para manejo de errores
export type ErroresValidacion = {
  nombre?: string;
  general?: string;
};