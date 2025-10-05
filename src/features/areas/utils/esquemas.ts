import { z } from 'zod';

// Función para eliminar acentos innecesarios (mantiene los correctos)
const eliminarAcentosInnecesarios = (str: string): string => {
  // Diccionario de palabras con sus acentuaciones correctas
  const palabrasConAcentoCorrecto: { [key: string]: string } = {
    // Palabras que SÍ llevan acento
    'biologia': 'Biología',
    'matematica': 'Matemática',
    'matematicas': 'Matemáticas',
    'quimica': 'Química',
    'fisica': 'Física',
    'musica': 'Música',
    'etica': 'Ética',
    'informatica': 'Informática',
    'robotica': 'Robótica',
    'logica': 'Lógica',
    'plastica': 'Plástica',
    'gramatica': 'Gramática',
    'botanica': 'Botánica',
    'electronica': 'Electrónica',
    'mecanica': 'Mecánica',
    'optica': 'Óptica',
    'acustica': 'Acústica',
    'estetica': 'Estética',
    'retorica': 'Retórica',
    'aritmetica': 'Aritmética',
    
    // Palabras que NO llevan acento
    'historia': 'Historia',
    'geografia': 'Geografia',
    'lengua': 'Lengua',
    'literatura': 'Literatura',
    'ciencias': 'Ciencias',
    'sociales': 'Sociales',
    'naturales': 'Naturales',
    'tecnologia': 'Tecnologia',
    'filosofia': 'Filosofia',
    'economia': 'Economia',
    'psicologia': 'Psicologia',
    'sociologia': 'Sociologia',
    'astronomia': 'Astronomia',
    'geologia': 'Geologia',
    'ecologia': 'Ecologia',
    'zoologia': 'Zoologia',
    'anatomia': 'Anatomia',
    'fisiologia': 'Fisiologia',
  };
  
  return str.split(' ').map(palabra => {
    // Normalizar la palabra quitando todos los acentos para buscar en el diccionario
    const palabraSinAcentos = palabra.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    // Si la palabra existe en el diccionario, usar la forma correcta
    if (palabrasConAcentoCorrecto[palabraSinAcentos]) {
      return palabrasConAcentoCorrecto[palabraSinAcentos];
    }
    
    // Si no está en el diccionario, quitar todos los acentos por seguridad
    return palabra.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }).join(' ');
};

// Función para eliminar caracteres duplicados
const eliminarCaracteresDuplicados = (str: string): string => {
  return str.split('').filter((char, index, arr) => {
    // Si es un espacio, permitir solo si el anterior no es espacio
    if (char === ' ') {
      return index === 0 || arr[index - 1] !== ' ';
    }
    // Para otros caracteres, permitir solo si el anterior es diferente
    return index === 0 || arr[index - 1] !== char;
  }).join('');
};

// Función para convertir a formato título (Primera letra mayúscula)
const toTitleCase = (str: string): string => {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const crearAreaEsquema = z.object({
  nombre: z.string()
      // Validación 1 y 2: Campo obligatorio
      .min(1, 'El campo Nombre del Área es obligatorio.')
      .refine(val => val.trim().length > 0, {
        message: 'El campo Nombre del Área es obligatorio.',
      })
      // Validación 6 y 7: Solo letras y espacios (con acentos españoles)
      .refine(val => /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(val.trim()), {
        message: 'El campo Nombre del Área contiene caracteres no permitidos. Solo se permiten letras y espacios.',
      })
      // Validación 3 y 4: Mínimo 4 caracteres
      .refine(val => val.trim().length >= 4, {
        message: 'El Nombre del Área requiere un mínimo de 4 caracteres.',
      })
      // Validación 5: Máximo 30 caracteres
      .refine(val => val.trim().length <= 30, {
        message: 'El Nombre del Área no puede tener más de 30 caracteres.',
      })
      // Transformación para normalizar el dato
      .transform(val => {
        // Validación 11: Eliminar espacios al inicio, final y múltiples entre palabras
        let limpio = val.trim().replace(/\s+/g, ' ');
        
        // Validación 10: Eliminar caracteres duplicados
        limpio = eliminarCaracteresDuplicados(limpio);
        
        // Validación 9: Eliminar acentos innecesarios
        limpio = eliminarAcentosInnecesarios(limpio);
        
        // Validación 8: Convertir a formato título (Primera letra mayúscula)
        return toTitleCase(limpio);
      })
});

export type CrearAreaFormData = z.infer<typeof crearAreaEsquema>;