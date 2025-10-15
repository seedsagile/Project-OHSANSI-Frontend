import Papa from 'papaparse';
import { z } from 'zod';
import type { FilaProcesada, CompetidorCSV, AreaConNiveles } from '../types/indexInscritos';
import { DEPARTAMENTOS_VALIDOS } from '../constants';
import levenshtein from 'fast-levenshtein';

export type ProcesamientoCSVResult = {
  filasProcesadas: FilaProcesada[];
  headers: string[];
  errorGlobal: string | null;
  invalidHeaders: string[];
};

export const normalizarEncabezado = (header: string): string => {
  if (!header) return '';
  return header
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
};

const normalizeForComparison = (str: string): string => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
};

const toTitleCase = (str: string): string => {
  if (!str) return '';
  return str
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const sanitizePhoneNumber = (phone: string): string => {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
};

const getSuggestion = (value: string, validOptions: readonly string[]): string | null => {
  let bestMatch: string | null = null;
  let minDistance = 3;
  for (const option of validOptions) {
    const distance = levenshtein.get(value.toLowerCase(), option.toLowerCase());
    if (distance < minDistance) {
      minDistance = distance;
      bestMatch = option;
    }
  }
  return bestMatch ? `¿Quizás quisiste decir "${bestMatch}"?` : null;
};

export const headerMapping: { [key: string]: keyof CompetidorCSV } = {
  n: 'nro', no: 'nro', nro: 'nro', numero: 'nro', doc: 'ci', gen: 'genero',
  dep: 'departamento', celular: 'celular_estudiante', colegio: 'colegio_institucion',
  email: 'email', nombres: 'nombres', apellidos: 'apellidos',
  fechadenacimiento: 'fecha_nacimiento', gradoescolar: 'grado_escolar',
  nombretutor: 'nombre_tutor', celulartutor: 'celular_tutor',
  celularemergencia: 'celular_emergencia', tipodecolegio: 'tipo_colegio',
  departamentocolegio: 'departamento_colegio', direccioncolegio: 'direccion_colegio',
  telefonocolegio: 'telefono_colegio', grupo: 'grupo',
  descripciondelgrupo: 'descripcion_del_grupo', capacidaddelgrupo: 'capacidad_del_grupo',
  area: 'area', nivel: 'nivel',
};

export const reverseHeaderMapping: { [key: string]: string } = {
  ci: 'DOC.', genero: 'GEN', departamento: 'DEP.', celular_estudiante: 'CELULAR',
  colegio_institucion: 'COLEGIO', email: 'E-MAIL', nombres: 'NOMBRES',
  apellidos: 'APELLIDOS', area: 'AREA', nivel: 'NIVEL',
};

const allValidNormalizedHeaders = Object.keys(headerMapping);
const requiredCSVKeys: (keyof CompetidorCSV)[] = [
  'ci', 'nombres', 'apellidos', 'genero', 'departamento',
  'colegio_institucion', 'celular_estudiante', 'email', 'area', 'nivel',
];

export const procesarYValidarCSV = (
  textoCsv: string,
  areasConNiveles: AreaConNiveles[]
): ProcesamientoCSVResult => {
  const filaSchema = z.object({
    nro: z.string().transform(val => val.trim().replace(/\s+/g, ' ')).optional(),
    nombres: z.string().transform((val) => val.trim().replace(/\s+/g, ' ')).superRefine((val, ctx) => {
      if (val.length === 0) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Este campo es obligatorio.' });
      else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(val)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Solo se permiten letras, acentos y espacios.' });
    }).transform(toTitleCase),
    apellidos: z.string().transform((val) => val.trim().replace(/\s+/g, ' ')).superRefine((val, ctx) => {
      if (val.length === 0) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Este campo es obligatorio.' });
      else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(val)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Solo se permiten letras, acentos y espacios.' });
    }).transform(toTitleCase),
    ci: z.string().transform((val) => val.trim().replace(/\s/g, '').toUpperCase()).superRefine((val, ctx) => {
      if (val.length === 0) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Este campo es obligatorio.' });
      else if (!/^[0-9]+(-?[A-Z])?$/.test(val)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Formato inválido. Ej: 7962927, 7962927A, 7962927-A.' });
    }),
    genero: z.string().transform((val) => val.trim().toUpperCase()).superRefine((val, ctx) => {
      if (val.length === 0) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Este campo es obligatorio.' });
      else if (!/^[FM]$/.test(val)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Debe ser una sola letra: "M" o "F".' });
    }),
    departamento: z.string().transform((val) => val.trim().replace(/\s+/g, ' ')).superRefine((val, ctx) => {
      if (val.length === 0) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Este campo es obligatorio.' });
      else if (!DEPARTAMENTOS_VALIDOS.some((d) => normalizeForComparison(d) === normalizeForComparison(val))) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'El departamento no existe.' });
    }).transform(toTitleCase),
    colegio_institucion: z.string().transform((val) => val.trim().replace(/\s+/g, ' ')).superRefine((val, ctx) => {
      if (val.length === 0) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Este campo es obligatorio.' });
      else if (!/^[a-zA-Z0-9\s.\-áéíóúÁÉÍÓÚñÑüÜ]+$/.test(val)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Contiene caracteres no permitidos.' });
    }).transform(toTitleCase),
    celular_estudiante: z.string().transform((val) => val.trim().replace(/\s/g, '')).superRefine((val, ctx) => {
      if (val.length === 0) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Este campo es obligatorio.' });
      else if (!/^[0-9]+$/.test(val)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Solo se permiten números.' });
    }),
    email: z.string().transform((val) => val.trim().replace(/\s/g, '')).superRefine((val, ctx) => {
      if (val.length === 0) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Este campo es obligatorio.' });
      else if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(val)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'El formato del email no es válido.' });
    }),
    area: z.string().transform((val) => val.trim().replace(/\s+/g, ' ')),
    nivel: z.string().transform((val) => val.trim().replace(/\s+/g, ' ')),
    fecha_nacimiento: z.string().transform(val => val.trim().replace(/\s/g, '')).optional().refine((val) => !val || !isNaN(Date.parse(val)), { message: 'Formato de fecha inválido.' }),
    grado_escolar: z.string().transform(val => val.trim().replace(/\s+/g, ' ')).optional(),
    nombre_tutor: z.string().transform(val => val.trim().replace(/\s+/g, ' ')).optional(),
    celular_tutor: z.string().optional().transform((val) => (val ? sanitizePhoneNumber(val.replace(/\s/g, '')) : val)),
    celular_emergencia: z.string().optional().transform((val) => (val ? sanitizePhoneNumber(val.replace(/\s/g, '')) : val)),
    tipo_colegio: z.string().transform(val => val.trim().replace(/\s+/g, ' ')).optional(),
    departamento_colegio: z.string().transform(val => val.trim().replace(/\s+/g, ' ')).optional(),
    direccion_colegio: z.string().transform(val => val.trim().replace(/\s+/g, ' ')).optional(),
    telefono_colegio: z.string().optional().transform(val => val ? sanitizePhoneNumber(val.replace(/\s/g, '')) : val),
    grupo: z.string().transform(val => val.trim().replace(/\s+/g, ' ')).optional(),
    descripcion_del_grupo: z.string().transform(val => val.trim().replace(/\s+/g, ' ')).optional(),
    capacidad_del_grupo: z.string().transform(val => val.trim().replace(/\s/g, '')).optional(),
  }).superRefine((data, ctx) => {
    const areaNormalizada = normalizeForComparison(data.area);
    const areaEncontrada = areasConNiveles.find(a => normalizeForComparison(a.nombre) === areaNormalizada);

    if (!data.area) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'El campo Área es obligatorio.', path: ['area'] });
      return;
    }
    
    if (!areaEncontrada) {
      const sugerencia = getSuggestion(data.area, areasConNiveles.map(a => a.nombre));
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `El área no existe. ${sugerencia || ''}`.trim(), path: ['area'] });
      return;
    }

    const nivelNormalizado = normalizeForComparison(data.nivel);
    const nivelValidoEnArea = areaEncontrada.niveles.some(n => n.asignado_activo && normalizeForComparison(n.nombre) === nivelNormalizado);

    if (!data.nivel) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'El campo Nivel es obligatorio.', path: ['nivel'] });
      return;
    }

    if (!nivelValidoEnArea) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Este nivel no está asignado a esta área.', path: ['nivel'] });
    }
  });

  let cleanText = textoCsv;
  if (cleanText.charCodeAt(0) === 0xfeff) cleanText = cleanText.substring(1);
  if (cleanText.trim() === '') return { filasProcesadas: [], headers: [], errorGlobal: 'El archivo CSV está vacío.', invalidHeaders: [] };

  const firstNewLineIndex = cleanText.search(/\r\n|\n|\r/);
  const headerLine = firstNewLineIndex === -1 ? cleanText : cleanText.substring(0, firstNewLineIndex);
  const dataString = firstNewLineIndex === -1 ? '' : cleanText.substring(firstNewLineIndex + 1);
  const detectedDelimiter = [';', ',', '\t'].find((d) => headerLine.includes(d)) || ';';
  const headersRaw = headerLine.split(detectedDelimiter).map((h) => h.trim()).filter(Boolean);
  const headersMapeados = headersRaw.map((h) => headerMapping[normalizarEncabezado(h)]);
  const encabezadosFaltantes = requiredCSVKeys.filter((key) => !headersMapeados.includes(key));
  const invalidHeaders = headersRaw.filter((h) => !allValidNormalizedHeaders.includes(normalizarEncabezado(h)));

  if (encabezadosFaltantes.length > 0) {
    const nombresFaltantes = encabezadosFaltantes.map((key) => `"${reverseHeaderMapping[key] || key}"`);
    const errorMessage = `Faltan las siguientes columnas obligatorias: ${nombresFaltantes.join(', ')}. Por favor, corrija el archivo CSV.`;
    return { filasProcesadas: [], headers: headersRaw, errorGlobal: errorMessage, invalidHeaders };
  }

  const parseResult = Papa.parse<string[]>(dataString, { header: false, skipEmptyLines: true, delimiter: detectedDelimiter, transform: (value: string) => value.trim() });

  const filasPreProcesadas = parseResult.data.map((rowArray, i) => {
    const numeroDeFila = i + 1;
    const rawData: { [key: string]: string } = {};
    const datosLimpios: Partial<CompetidorCSV> = {};
    headersRaw.forEach((header, index) => {
      const valor = rowArray[index] || '';
      rawData[header] = valor;
      const key = headerMapping[normalizarEncabezado(header)];
      if (key) datosLimpios[key] = valor;
    });

    const validationResult = filaSchema.safeParse(datosLimpios);
    const rowSignature = JSON.stringify(Object.values(datosLimpios).map(v => String(v).trim().toLowerCase()));

    return { numeroDeFila, rawData, datosOriginales: datosLimpios, validationResult, rowSignature };
  });

  const ciMap = new Map<string, number[]>();
  const signatureMap = new Map<string, number[]>();

  filasPreProcesadas.forEach(fila => {
    if (!signatureMap.has(fila.rowSignature)) signatureMap.set(fila.rowSignature, []);
    signatureMap.get(fila.rowSignature)!.push(fila.numeroDeFila);

    if (fila.validationResult.success) {
      const ci = fila.validationResult.data.ci;
      if (ci) {
        if (!ciMap.has(ci)) ciMap.set(ci, []);
        ciMap.get(ci)!.push(fila.numeroDeFila);
      }
    }
  });

  const filasProcesadas: FilaProcesada[] = filasPreProcesadas.map(fila => {
    const { numeroDeFila, rawData, validationResult, rowSignature } = fila;

    if (!validationResult.success) {
      const errores = validationResult.error.issues.reduce((acc, issue) => {
        acc[String(issue.path[0])] = issue.message;
        return acc;
      }, {} as { [key: string]: string });
      return { datos: fila.datosOriginales, rawData, esValida: false, errores, numeroDeFila };
    }

    const dataValidada = validationResult.data;
    const errores: { [key: string]: string } = {};
    let esValida = true;

    const signatureDuplicates = signatureMap.get(rowSignature);
    if (signatureDuplicates && signatureDuplicates.length > 1) {
      const otraFila = signatureDuplicates.find(n => n !== numeroDeFila) || signatureDuplicates[0];
      errores.general = `Fila idéntica a la fila N° ${otraFila}`;
      esValida = false;
    }

    const ciDuplicates = ciMap.get(dataValidada.ci);
    if (ciDuplicates && ciDuplicates.length > 1) {
      if (!errores.general) {
        const otraFila = ciDuplicates.find(n => n !== numeroDeFila) || ciDuplicates[0];
        errores.ci = `CI duplicado con la fila N° ${otraFila}`;
        esValida = false;
      }
    }

    return { datos: dataValidada, rawData, esValida, errores: Object.keys(errores).length > 0 ? errores : undefined, numeroDeFila };
  });

  return { filasProcesadas, headers: headersRaw, errorGlobal: null, invalidHeaders };
};