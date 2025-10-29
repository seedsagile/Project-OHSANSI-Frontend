import Papa from 'papaparse';
import { z } from 'zod';
import type { FilaProcesada, CompetidorCSV, AreaConNiveles } from '../types/indexInscritos';
import { DEPARTAMENTOS_VALIDOS } from '../constants';
import levenshtein from 'fast-levenshtein';

// Tipo para el resultado del procesamiento del worker
export type ProcesamientoCSVResult = {
  filasProcesadas: FilaProcesada[];
  headers: string[]; // Cabeceras originales del archivo
  errorGlobal: string | null; // Errores fatales (ej. cabeceras faltantes)
  invalidHeaders: string[]; // Cabeceras que no se pudieron mapear
};

/**
 * Normaliza una cabecera de CSV para mapeo:
 * Quita espacios, convierte a minúsculas y elimina caracteres no alfanuméricos.
 * Ej: "Nro. Documento" -> "nrodocumento" (aunque tu mapping usa "doc")
 * Ej: "Área" -> "area"
 */
export const normalizarEncabezado = (header: string): string => {
  if (!header) return '';
  return header
    .trim()
    .toLowerCase()
    .normalize('NFD') // Descomponer acentos
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^a-z0-9]/g, ''); // Eliminar caracteres no alfanuméricos
};

/**
 * Normaliza un valor para comparación de datos (ej. "Física" vs "Fisica").
 * Quita acentos y convierte a minúsculas.
 */
const normalizeForComparison = (str: string): string => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
};

/**
 * Convierte un string a Formato Título (Capitaliza cada palabra).
 * Ej: "juan perez" -> "Juan Perez"
 */
const toTitleCase = (str: string): string => {
  if (!str) return '';
  return str
    .trim()
    .replace(/\s+/g, ' ') // Normalizar espacios
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Limpia un número de teléfono, dejando solo dígitos.
 * Ej: "+591 (777) 12345" -> "59177712345"
 * También maneja de forma segura valores nulos/undefined/vacíos.
 */
const sanitizePhoneNumber = (phone: string | null | undefined): string => {
  if (!phone) return ''; // Devuelve string vacío para null, undefined o ""
  return phone.replace(/\D/g, ''); // Elimina todo lo que no sea dígito
};

/**
 * Busca la coincidencia más cercana (usando Levenshtein) en una lista de opciones válidas.
 * Devuelve un string de sugerencia o null.
 */
const getSuggestion = (value: string, validOptions: readonly string[]): string | null => {
  let bestMatch: string | null = null;
  let minDistance = 3; // Umbral de distancia (no sugerir si es muy diferente)

  const normalizedValue = normalizeForComparison(value);

  for (const option of validOptions) {
    const distance = levenshtein.get(normalizedValue, normalizeForComparison(option));
    if (distance < minDistance) {
      minDistance = distance;
      bestMatch = option;
    }
  }
  return bestMatch ? `¿Quizás quisiste decir "${bestMatch}"?` : null;
};

// --- Mapeo de Cabeceras CSV ---
// Permite flexibilidad en los nombres de las columnas del CSV.
export const headerMapping: { [key: string]: keyof CompetidorCSV } = {
  // Mapeos flexibles para Nro
  n: 'nro',
  no: 'nro',
  nro: 'nro',
  numero: 'nro',

  // Mapeos para campos requeridos por la API
  nombres: 'nombres',
  apellidos: 'apellidos',
  ci: 'ci',
  doc: 'ci', // Alternativa para CI
  documento: 'ci', // Alternativa para CI
  genero: 'genero',
  gen: 'genero', // Alternativa para Genero
  email: 'email',
  correo: 'email', // Alternativa para Email
  gradoescolar: 'grado_escolar',
  grado: 'grado_escolar', // Alternativa para Grado
  curso: 'grado_escolar', // Alternativa para Grado
  departamento: 'departamento',
  dep: 'departamento', // Alternativa para Departamento
  colegio: 'colegio_institucion',
  institucion: 'colegio_institucion', // Alternativa
  colegioinstitucion: 'colegio_institucion',
  area: 'area',
  nivel: 'nivel',

  // Mapeos para campos opcionales (en API o solo en CSV)
  celular: 'celular_estudiante', // Mapea a persona.telefono
  celularestudiante: 'celular_estudiante',
  celulartutor: 'celular_tutor', // Mapea a competidor.contacto_tutor
  contactotutor: 'celular_tutor',
  fechadenacimiento: 'fecha_nacimiento',
  fechanac: 'fecha_nacimiento',
  nombretutor: 'nombre_tutor',
  celularemergencia: 'celular_emergencia',
  contactoemergencia: 'celular_emergencia',
  tipodecolegio: 'tipo_colegio',
  tipocolegio: 'tipo_colegio',
  departamentocolegio: 'departamento_colegio',
  direccioncolegio: 'direccion_colegio',
  telefonocolegio: 'telefono_colegio',
  grupo: 'grupo',
  descripciondelgrupo: 'descripcion_del_grupo',
  capacidaddelgrupo: 'capacidad_del_grupo',
};

// Mapeo inverso para mensajes de error (usado en `requiredCSVKeys` y `TablaResultados`)
export const reverseHeaderMapping: { [key in keyof CompetidorCSV]?: string } = {
  nombres: 'Nombres',
  apellidos: 'Apellidos',
  ci: 'CI/Doc',
  genero: 'Genero',
  email: 'Email',
  grado_escolar: 'Grado Escolar',
  departamento: 'Departamento',
  colegio_institucion: 'Colegio',
  area: 'Area',
  nivel: 'Nivel',
  celular_estudiante: 'Celular Estudiante',
  celular_tutor: 'Celular Tutor',
};

// Lista de todas las cabeceras normalizadas válidas
const allValidNormalizedHeaders = Object.keys(headerMapping);

// Lista de claves *requeridas* según las validaciones del backend
// (Deben existir en el CSV)
const requiredCSVKeys: (keyof CompetidorCSV)[] = [
  'nombres',          // competidores.*.persona.nombre.required
  'apellidos',        // competidores.*.persona.apellido.required
  'ci',               // competidores.*.persona.ci.required
  'genero',           // competidores.*.persona.genero.required
  'email',            // competidores.*.persona.email.required
  'grado_escolar',    // competidores.*.competidor.grado_escolar.required
  'departamento',     // competidores.*.competidor.departamento.required
  'colegio_institucion', // competidores.*.institucion.nombre.required
  'area',             // competidores.*.area.nombre.required
  'nivel',            // competidores.*.nivel.nombre.required
];

/**
 * Función principal que procesa y valida el texto de un archivo CSV.
 * Se ejecuta en un Web Worker.
 * @param textoCsv - El contenido de texto del archivo CSV.
 * @param areasConNiveles - La lista de áreas y niveles válidos (de la API) para validación cruzada.
 * @returns Un objeto ProcesamientoCSVResult.
 */
export const procesarYValidarCSV = (
  textoCsv: string,
  areasConNiveles: AreaConNiveles[]
): ProcesamientoCSVResult => {
  // --- Esquema de Validación Zod para una fila del CSV ---
  const filaSchema = z
    .object({
      // --- Campos Requeridos (según validación API) ---
      nombres: z
        .string()
        .transform((val) => val.trim().replace(/\s+/g, ' ')) // Sanitizar espacios
        .pipe(z.string().min(1, 'El nombre es obligatorio.')) // Validar requerido
        .refine((val) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(val), { // Validar caracteres
          message: 'Solo se permiten letras, acentos y espacios.',
        })
        .transform(toTitleCase), // Transformar a Título

      apellidos: z
        .string()
        .transform((val) => val.trim().replace(/\s+/g, ' '))
        .pipe(z.string().min(1, 'El apellido es obligatorio.'))
        .refine((val) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(val), {
          message: 'Solo se permiten letras, acentos y espacios.',
        })
        .transform(toTitleCase),

      ci: z
        .string()
        .transform((val) => val.trim().replace(/\s/g, '').toUpperCase()) // Sanitizar (quitar espacios, mayúsc.)
        .pipe(z.string().min(1, 'El documento de identidad es obligatorio.')) // Validar requerido
        .refine((val) => /^[0-9]+(-?[A-Z])?$/.test(val), { // Validar formato
          message: 'Formato inválido. Ej: 7962927, 7962927A.',
        }),

      genero: z
        .string()
        .transform((val) => val.trim().toUpperCase())
        .pipe(z.enum(['M', 'F'], { // Usar z.enum para M/F
          message: 'El género es obligatorio y debe ser "M" o "F".'
        })),

      email: z
        .string()
        .transform((val) => val.trim().replace(/\s/g, '').toLowerCase()) // Sanitizar (quitar espacios, minúsc.)
        .pipe(z.string().min(1, 'El email es obligatorio.')) // Validar requerido
        .pipe(z.string().email('El formato del email no es válido.')), // Validar formato email

      grado_escolar: z
        .string()
        .transform((val) => val.trim().replace(/\s+/g, ' '))
        .pipe(z.string().min(1, 'El grado escolar es obligatorio.')),

      departamento: z
        .string()
        .transform((val) => val.trim().replace(/\s+/g, ' ')) // Sanitizar
        .pipe(z.string().min(1, 'El departamento es obligatorio.')) // Validar requerido
        .refine((val) => // Validar contra lista de departamentos
          DEPARTAMENTOS_VALIDOS.some(
            (d) => normalizeForComparison(d) === normalizeForComparison(val)
          ), { message: 'El departamento no existe.' }
        )
        .transform(toTitleCase), // Transformar a Título

      colegio_institucion: z
        .string()
        .transform((val) => val.trim().replace(/\s+/g, ' '))
        .pipe(z.string().min(1, 'El nombre de la institución es obligatorio.'))
        .refine((val) => /^[a-zA-Z0-9\s.\-áéíóúÁÉÍÓÚñÑüÜ()]+$/.test(val), { // Permitir más caracteres para nombres de colegios
          message: 'Contiene caracteres no permitidos.',
        })
        .transform(toTitleCase),

      area: z
        .string()
        .transform((val) => val.trim().replace(/\s+/g, ' '))
        .pipe(z.string().min(1, 'El área es obligatoria.')),

      nivel: z
        .string()
        .transform((val) => val.trim().replace(/\s+/g, ' '))
        .pipe(z.string().min(1, 'El nivel es obligatorio.')),

      // --- Campos Opcionales (para API o solo CSV) ---
      nro: z
        .string()
        .transform((val) => val.trim())
        .optional(),

      // --- CORRECCIÓN AQUÍ ---
      // Se elimina .nullable() para que el tipo inferido sea string | undefined
      celular_estudiante: z // Mapea a persona.telefono (opcional en API)
        .string()
        .transform((val) => sanitizePhoneNumber(val)) // Sanitizar
        .optional(), // <-- .nullable() REMOVED

      celular_tutor: z // Mapea a competidor.contacto_tutor (opcional en API)
        .string()
        .transform((val) => sanitizePhoneNumber(val)) // Sanitizar
        .optional(), // <-- .nullable() REMOVED

      // --- Campos extra (no enviados a la API, pero parseados si existen) ---
      fecha_nacimiento: z
        .string()
        .transform((val) => val.trim().replace(/\s/g, ''))
        .optional()
        .refine((val) => !val || !isNaN(Date.parse(val)) || /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(val), { // Aceptar ISO o dd/mm/yyyy
          message: 'Formato de fecha inválido. Usar YYYY-MM-DD o DD/MM/YYYY.',
        }),
      
      // --- CORRECCIÓN AQUÍ ---
      nombre_tutor: z.string().transform((val) => val.trim().replace(/\s+/g, ' ')).optional(),
      
      celular_emergencia: z.string().transform((val) => sanitizePhoneNumber(val)).optional(), // <-- .nullable() REMOVED
      
      tipo_colegio: z.string().transform((val) => val.trim().replace(/\s+/g, ' ')).optional(),
      departamento_colegio: z.string().transform((val) => val.trim().replace(/\s+/g, ' ')).optional(),
      direccion_colegio: z.string().transform((val) => val.trim().replace(/\s+/g, ' ')).optional(),
      
      telefono_colegio: z.string().transform((val) => sanitizePhoneNumber(val)).optional(), // <-- .nullable() REMOVED
      
      grupo: z.string().transform((val) => val.trim().replace(/\s+/g, ' ')).optional(),
      descripcion_del_grupo: z.string().transform((val) => val.trim().replace(/\s+/g, ' ')).optional(),
      capacidad_del_grupo: z.string().transform((val) => val.trim().replace(/\s/g, '')).optional(),

    })
    // --- Validación Cruzada (Área/Nivel) ---
    .superRefine((data, ctx) => {
      // data.area y data.nivel ya están validados como string.min(1)
      const areaNormalizada = normalizeForComparison(data.area);
      const areaEncontrada = areasConNiveles.find(
        (a) => normalizeForComparison(a.nombre) === areaNormalizada
      );

      // 1. Validar si el Área existe
      if (!areaEncontrada) {
        const sugerencia = getSuggestion(
          data.area,
          areasConNiveles.map((a) => a.nombre) // Sugerir solo de áreas existentes
        );
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `El área no existe. ${sugerencia || ''}`.trim(),
          path: ['area'], // Asignar error al campo 'area'
        });
        return; // No continuar si el área no existe
      }

      // 2. Validar si el Nivel existe y está activo para esa Área
      const nivelNormalizado = normalizeForComparison(data.nivel);
      const nivelValidoEnArea = areaEncontrada.niveles.some(
        (n) => n.asignado_activo && normalizeForComparison(n.nombre) === nivelNormalizado
      );

      if (!nivelValidoEnArea) {
        const nivelesDisponibles = areaEncontrada.niveles
                .filter(n => n.asignado_activo) // Sugerir solo de niveles activos
                .map(n => n.nombre);

        const sugerencia = getSuggestion(data.nivel, nivelesDisponibles);
        let mensajeError = 'Este nivel no está asignado a esta área.';
        if (sugerencia) {
            mensajeError = `${mensajeError} ${sugerencia}`;
        } else if (nivelesDisponibles.length === 0) {
            mensajeError = `El área "${areaEncontrada.nombre}" no tiene niveles asignados.`
        }

        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: mensajeError,
          path: ['nivel'], // Asignar error al campo 'nivel'
        });
      }
    });

  // --- Inicio del Procesamiento del Archivo ---

  // 1. Limpiar BOM (Byte Order Mark) si existe
  let cleanText = textoCsv;
  if (cleanText.charCodeAt(0) === 0xfeff) {
    cleanText = cleanText.substring(1);
  }
  // 2. Verificar si el archivo está vacío
  if (cleanText.trim() === '') {
    return {
      filasProcesadas: [],
      headers: [],
      errorGlobal: 'El archivo CSV está vacío.',
      invalidHeaders: [],
    };
  }

  // 3. Extraer cabeceras y datos
  const firstNewLineIndex = cleanText.search(/\r\n|\n|\r/); // Buscar primer salto de línea
  const headerLine =
    firstNewLineIndex === -1 ? cleanText : cleanText.substring(0, firstNewLineIndex);
  const dataString = firstNewLineIndex === -1 ? '' : cleanText.substring(firstNewLineIndex + 1);

  // 4. Detectar delimitador (priorizando ';' y ',' sobre '\t')
  const detectedDelimiter = [';', ',', '\t'].find((d) => headerLine.includes(d)) || ';'; // Default a ';'
  const headersRaw = headerLine
    .split(detectedDelimiter)
    .map((h) => h.trim()) // Limpiar espacios
    .filter(Boolean); // Filtrar cabeceras vacías

  // 5. Validar Cabeceras
  const headersMapeados = headersRaw.map((h) => headerMapping[normalizarEncabezado(h)]);
  const encabezadosFaltantes = requiredCSVKeys.filter((key) => !headersMapeados.includes(key));
  const invalidHeaders = headersRaw.filter(
    (h) => !allValidNormalizedHeaders.includes(normalizarEncabezado(h))
  );

  // Error fatal si faltan cabeceras obligatorias
  if (encabezadosFaltantes.length > 0) {
    const nombresFaltantes = encabezadosFaltantes.map(
      (key) => `"${reverseHeaderMapping[key] || key}"`
    );
    const errorMessage = `Faltan las siguientes columnas obligatorias: ${nombresFaltantes.join(', ')}. Por favor, corrija el archivo CSV.`;
    return { filasProcesadas: [], headers: headersRaw, errorGlobal: errorMessage, invalidHeaders };
  }
  // Nota: Continuamos aunque haya cabeceras *inválidas* (invalidHeaders), pero las reportamos.

  // 6. Parsear filas de datos con PapaParse
  const parseResult = Papa.parse<string[]>(dataString, {
    header: false,
    skipEmptyLines: true, // Saltar filas vacías
    delimiter: detectedDelimiter,
    transform: (value: string) => value.trim(), // Limpiar espacios de cada celda
  });

  // 7. Pre-procesamiento: Validar cada fila y detectar duplicados
  const filasPreProcesadas = parseResult.data.map((rowArray, i) => {
    const numeroDeFila = i + 2; // +1 por índice 0, +1 por cabecera
    const rawData: { [key: string]: string } = {}; // Datos crudos (para columnas inválidas)
    const datosLimpios: Partial<CompetidorCSV> = {}; // Datos mapeados

    headersRaw.forEach((header, index) => {
      const valor = rowArray[index] || '';
      rawData[header] = valor;
      const key = headerMapping[normalizarEncabezado(header)]; // Mapear cabecera
      if (key) {
        datosLimpios[key] = valor; // Asignar a clave interna
      }
    });

    // Validar con Zod
    const validationResult = filaSchema.safeParse(datosLimpios);
    // Crear firma para detectar filas idénticas
    const rowSignature = JSON.stringify(
      Object.values(datosLimpios).map((v) => String(v).trim().toLowerCase())
    );

    return { numeroDeFila, rawData, datosOriginales: datosLimpios, validationResult, rowSignature };
  });

  // 8. Mapas para detección de duplicados (CI y filas idénticas)
  const ciMap = new Map<string, number[]>(); // clave: CI, valor: [lista de números de fila]
  const signatureMap = new Map<string, number[]>(); // clave: firma, valor: [lista de números de fila]

  filasPreProcesadas.forEach((fila) => {
    // Registrar firma de fila
    if (!signatureMap.has(fila.rowSignature)) {
      signatureMap.set(fila.rowSignature, []);
    }
    signatureMap.get(fila.rowSignature)!.push(fila.numeroDeFila);

    // Registrar CI si la validación básica fue exitosa
    if (fila.validationResult.success) {
      // Zod 3.21+ infiere 'ci' como 'string' aquí debido al pipe()
      const ci = (fila.validationResult.data as CompetidorCSV).ci; 
      if (ci) { // Asegurarse que CI no sea undefined
        if (!ciMap.has(ci)) {
          ciMap.set(ci, []);
        }
        ciMap.get(ci)!.push(fila.numeroDeFila);
      }
    }
  });

  // 9. Procesamiento Final: Construir el array FilaProcesada
  // CORRECCIÓN: Tipar explícitamente el array resultante como FilaProcesada[]
  const filasProcesadas: FilaProcesada[] = filasPreProcesadas.map((fila): FilaProcesada => { // <-- Tipado explícito aquí
    const { numeroDeFila, rawData, validationResult, rowSignature } = fila;

    // Caso 1: Fila inválida por Zod
    if (!validationResult.success) {
      // Mapear errores de Zod a un objeto simple
      const errores = validationResult.error.issues.reduce(
        (acc, issue) => {
          const pathKey = String(issue.path[0] || 'general'); // Clave 'general' si no hay path
          acc[pathKey] = issue.message;
          return acc;
        },
        {} as { [key: string]: string }
      );
      return { datos: fila.datosOriginales, rawData, esValida: false, errores, numeroDeFila };
    }

    // Caso 2: Fila válida por Zod, verificar duplicados
    // NOTA: dataValidada ahora es (string | undefined) para los campos opcionales, NO (string | null | undefined)
    const dataValidada = validationResult.data;
    const errores: { [key: string]: string } = {};
    let esValida = true;

    // Verificar duplicado de fila idéntica
    const signatureDuplicates = signatureMap.get(rowSignature);
    if (signatureDuplicates && signatureDuplicates.length > 1) {
      const otraFila = signatureDuplicates.find((n) => n !== numeroDeFila) || signatureDuplicates[0];
      errores.general = `Fila idéntica a la fila N° ${otraFila}`;
      esValida = false;
    }

    // Verificar duplicado de CI (solo si no es ya idéntica)
    const ciDuplicates = ciMap.get(dataValidada.ci as string); // dataValidada.ci es string aquí
    if (ciDuplicates && ciDuplicates.length > 1) {
      if (!errores.general) { // No sobreescribir error de fila idéntica
          const otraFila = ciDuplicates.find((n) => n !== numeroDeFila) || ciDuplicates[0];
          errores.ci = `CI duplicado con la fila N° ${otraFila}`;
          esValida = false;
      }
    }

    return {
      datos: dataValidada, // Datos limpios y transformados
      rawData, // Datos crudos
      esValida, // true si Zod pasó Y no hay duplicados
      errores: Object.keys(errores).length > 0 ? errores : undefined, // Errores de duplicados
      numeroDeFila,
    };
  });

  // 10. Retornar resultado completo
  return { filasProcesadas, headers: headersRaw, errorGlobal: null, invalidHeaders };
};