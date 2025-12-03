import Papa from 'papaparse';
import { z } from 'zod';
import type { FilaProcesada, CompetidorCSV, AreaConNiveles } from '../types/indexInscritos';
import { DEPARTAMENTOS_VALIDOS } from '../constants';
import levenshtein from 'fast-levenshtein';

const NOMBRE_MIN_LENGTH = 2;
const NOMBRE_MAX_LENGTH = 50;
const APELLIDO_MIN_LENGTH = 2;
const APELLIDO_MAX_LENGTH = 50;
const CI_MIN_LENGTH = 5;
const CI_MAX_LENGTH = 15;
const EMAIL_MAX_LENGTH = 100;
const GRADO_MAX_LENGTH = 50;
const COLEGIO_MAX_LENGTH = 100;
const AREA_NIVEL_MAX_LENGTH = 100;
const CELULAR_LENGTH = 8;

const REGEX_SOLO_LETRAS_ESPACIOS_ACENTOS = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
const REGEX_CI_BOLIVIA_FORMATO = /^[0-9]+(-?[A-Z0-9]{1,2})?$/;
const REGEX_CELULAR_BOLIVIA = /^[67]\d{7}$/;
const REGEX_CARACTERES_GENERALES_PERMITIDOS = /^[a-zA-Z0-9\s.\-áéíóúÁÉÍÓÚñÑüÜ()#]+$/;

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
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
};

const normalizeForComparison = (str: string): string => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
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

const sanitizePhoneNumber = (phone: string | null | undefined): string => {
  if (!phone) return '';
  let sanitized = phone.replace(/\D/g, '');
  if (sanitized.startsWith('591')) {
    sanitized = sanitized.substring(3);
  }
  return sanitized;
};

const getSuggestion = (value: string, validOptions: readonly string[]): string | null => {
  let bestMatch: string | null = null;
  let minDistance = 3;

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

export const headerMapping: { [key: string]: keyof CompetidorCSV } = {
  n: 'nro', no: 'nro', nro: 'nro', numero: 'nro',
  nombres: 'nombres', apellidos: 'apellidos', ci: 'ci', doc: 'ci', documento: 'ci',
  genero: 'genero', gen: 'genero', email: 'email', correo: 'email',
  gradoescolar: 'grado_escolar', grado: 'grado_escolar', curso: 'grado_escolar',
  departamento: 'departamento', dep: 'departamento',
  colegio: 'colegio_institucion', institucion: 'colegio_institucion', colegioinstitucion: 'colegio_institucion',
  area: 'area', nivel: 'nivel', celular: 'celular_estudiante', celularestudiante: 'celular_estudiante',
  celulartutor: 'celular_tutor', contactotutor: 'celular_tutor', fechadenacimiento: 'fecha_nacimiento',
  fechanac: 'fecha_nacimiento', nombretutor: 'nombre_tutor', celularemergencia: 'celular_emergencia',
  contactoemergencia: 'celular_emergencia', tipodecolegio: 'tipo_colegio', tipocolegio: 'tipo_colegio',
  departamentocolegio: 'departamento_colegio', direccioncolegio: 'direccion_colegio',
  telefonocolegio: 'telefono_colegio', grupo: 'grupo', descripciondelgrupo: 'descripcion_del_grupo',
  capacidaddelgrupo: 'capacidad_del_grupo',
};

export const reverseHeaderMapping: { [key in keyof CompetidorCSV]?: string } = {
  nombres: 'Nombres', apellidos: 'Apellidos', ci: 'CI/Doc', genero: 'Genero', email: 'Email',
  grado_escolar: 'Grado Escolar', departamento: 'Departamento', colegio_institucion: 'Colegio',
  area: 'Area', nivel: 'Nivel', celular_estudiante: 'Celular', celular_tutor: 'Celular Tutor',
};

const allValidNormalizedHeaders = Object.keys(headerMapping);
const requiredCSVKeys: (keyof CompetidorCSV)[] = [
  'nombres', 'apellidos', 'ci', 'genero', 'email', 'grado_escolar',
  'departamento', 'colegio_institucion', 'area', 'nivel', 'celular_estudiante',
];

export const procesarYValidarCSV = (
  textoCsv: string,
  areasConNiveles: AreaConNiveles[]
): ProcesamientoCSVResult => {

  let cleanText = textoCsv;
  if (cleanText.charCodeAt(0) === 0xfeff) { cleanText = cleanText.substring(1); }
  
  if (cleanText.trim() === '') {
    return { 
      filasProcesadas: [], 
      headers: [], 
      errorGlobal: 'Error en el archivo – El archivo CSV está vacío.', // Mensaje actualizado
      invalidHeaders: [] 
    };
  }

  const firstNewLineIndex = cleanText.search(/\r\n|\n|\r/);
  const headerLine = firstNewLineIndex === -1 ? cleanText : cleanText.substring(0, firstNewLineIndex);

  if (!headerLine.includes(';')) {
    return {
      filasProcesadas: [],
      headers: [],
      errorGlobal: 'No se pudieron detectar correctamente las columnas. El archivo no utiliza el punto y coma (;) como delimitador.', // Mensaje ajustado
      invalidHeaders: []
    };
  }
  const detectedDelimiter = ';';

  const headersRaw = headerLine.split(detectedDelimiter).map((h) => h.trim()).filter(Boolean);
  const headersMapeados = headersRaw.map((h) => headerMapping[normalizarEncabezado(h)]);
  const encabezadosFaltantes = requiredCSVKeys.filter((key) => !headersMapeados.includes(key));
  const invalidHeaders = headersRaw.filter((h) => !allValidNormalizedHeaders.includes(normalizarEncabezado(h)));

  if (encabezadosFaltantes.length > 0) {
    const nombresFaltantes = encabezadosFaltantes.map((key) => `"${reverseHeaderMapping[key] || key}"`);
    const errorMessage = `Faltan las siguientes columnas obligatorias: ${nombresFaltantes.join(', ')}. Por favor, corrija el archivo CSV.`;
    return { filasProcesadas: [], headers: headersRaw, errorGlobal: errorMessage, invalidHeaders };
  }

  const filaSchema = z
    .object({
      nombres: z.string({ message: 'El nombre es obligatorio.' }).transform((val) => val.trim().replace(/\s+/g, ' ')).pipe(z.string().min(NOMBRE_MIN_LENGTH, `Mínimo ${NOMBRE_MIN_LENGTH} caracteres.`)).pipe(z.string().max(NOMBRE_MAX_LENGTH, `Máximo ${NOMBRE_MAX_LENGTH} caracteres.`)).pipe(z.string().regex(REGEX_SOLO_LETRAS_ESPACIOS_ACENTOS, 'Solo se permiten letras, acentos y espacios.')).transform(toTitleCase),
      apellidos: z.string({ message: 'El apellido es obligatorio.' }).transform((val) => val.trim().replace(/\s+/g, ' ')).pipe(z.string().min(APELLIDO_MIN_LENGTH, `Mínimo ${APELLIDO_MIN_LENGTH} caracteres.`)).pipe(z.string().max(APELLIDO_MAX_LENGTH, `Máximo ${APELLIDO_MAX_LENGTH} caracteres.`)).pipe(z.string().regex(REGEX_SOLO_LETRAS_ESPACIOS_ACENTOS, 'Solo se permiten letras, acentos y espacios.')).transform(toTitleCase),
      ci: z.string({ message: 'El documento de identidad es obligatorio.' }).transform((val) => val.trim().replace(/\s/g, '').toUpperCase()).pipe(z.string().min(CI_MIN_LENGTH, `Mínimo ${CI_MIN_LENGTH} caracteres.`)).pipe(z.string().max(CI_MAX_LENGTH, `Máximo ${CI_MAX_LENGTH} caracteres.`)).pipe(z.string().regex(REGEX_CI_BOLIVIA_FORMATO, 'Formato inválido. Ej: 7962927, 7962927LP, 7962927-1A.')),
      genero: z.string({ message: 'El género es obligatorio.' }).transform((val) => val.trim().toUpperCase()).pipe(z.enum(['M', 'F'], { message: 'Debe ser "M" o "F".' })),
      email: z.string({ message: 'El email es obligatorio.' }).transform((val) => val.trim().replace(/\s/g, '').toLowerCase()).pipe(z.string().max(EMAIL_MAX_LENGTH, `Máximo ${EMAIL_MAX_LENGTH} caracteres.`)).pipe(z.string().email('El formato del email no es válido.')),
      grado_escolar: z.string({ message: 'El grado escolar es obligatorio.' }).transform((val) => val.trim().replace(/\s+/g, ' ')).pipe(z.string().min(1, 'El grado escolar es obligatorio.')).pipe(z.string().max(GRADO_MAX_LENGTH, `Máximo ${GRADO_MAX_LENGTH} caracteres.`)).pipe(z.string().regex(REGEX_CARACTERES_GENERALES_PERMITIDOS, 'Contiene caracteres no permitidos.')),
      
      departamento: z
        .string({ message: 'El departamento es obligatorio.' })
        .transform((val) => val.trim().replace(/\s+/g, ' '))
        .pipe(z.string().min(1, 'El departamento es obligatorio.'))
        .superRefine((val, ctx) => {
          const esValido = DEPARTAMENTOS_VALIDOS.some(
            (d) => normalizeForComparison(d) === normalizeForComparison(val)
          );
          if (!esValido) {
            const sugerencia = getSuggestion(val, DEPARTAMENTOS_VALIDOS);
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `El departamento "${val}" no es válido. ${sugerencia || ''}`.trim(),
            });
          }
        })
        .transform(toTitleCase),

      colegio_institucion: z.string({ message: 'El nombre de la institución es obligatorio.' }).transform((val) => val.trim().replace(/\s+/g, ' ')).pipe(z.string().min(1, 'El nombre de la institución es obligatorio.')).pipe(z.string().max(COLEGIO_MAX_LENGTH, `Máximo ${COLEGIO_MAX_LENGTH} caracteres.`)).pipe(z.string().regex(REGEX_CARACTERES_GENERALES_PERMITIDOS, 'Contiene caracteres no permitidos.')),
      area: z.string({ message: 'El área es obligatoria.' }).transform((val) => val.trim().replace(/\s+/g, ' ')).pipe(z.string().min(1, 'El área es obligatoria.')).pipe(z.string().max(AREA_NIVEL_MAX_LENGTH, `Máximo ${AREA_NIVEL_MAX_LENGTH} caracteres.`)).pipe(z.string().regex(REGEX_CARACTERES_GENERALES_PERMITIDOS, 'Contiene caracteres no permitidos.')),
      nivel: z.string({ message: 'El nivel es obligatorio.' }).transform((val) => val.trim().replace(/\s+/g, ' ')).pipe(z.string().min(1, 'El nivel es obligatorio.')).pipe(z.string().max(AREA_NIVEL_MAX_LENGTH, `Máximo ${AREA_NIVEL_MAX_LENGTH} caracteres.`)).pipe(z.string().regex(REGEX_CARACTERES_GENERALES_PERMITIDOS, 'Contiene caracteres no permitidos.')),
      celular_estudiante: z.string({ message: 'El Celular es obligatorio.' }).transform(sanitizePhoneNumber).pipe(z.string().min(1, 'El Celular es obligatorio.')).pipe(z.string().length(CELULAR_LENGTH, `Debe tener ${CELULAR_LENGTH} dígitos y solo se aceptan números.`)).pipe(z.string().regex(REGEX_CELULAR_BOLIVIA, 'Formato inválido (debe empezar con 6 o 7).')),
      
      nro: z.string().transform((val) => val.trim()).optional(),
      celular_tutor: z.string().transform(sanitizePhoneNumber).optional().refine((val) => !val || (val.length === CELULAR_LENGTH && REGEX_CELULAR_BOLIVIA.test(val)), { message: `Celular inválido (debe tener ${CELULAR_LENGTH} dígitos y empezar con 6 o 7).` }),
      fecha_nacimiento: z.string().transform((val) => val.trim().replace(/\s/g, '')).optional().refine((val) => !val || !isNaN(Date.parse(val)) || /^\d{1,2}[\/-]\d{1,2}[\/-]\d{4}$/.test(val), { message: 'Formato de fecha inválido. Usar YYYY-MM-DD, DD/MM/YYYY o DD-MM-YYYY.' }),
      nombre_tutor: z.string().transform((val) => val.trim().replace(/\s+/g, ' ')).optional().refine((val) => !val || REGEX_SOLO_LETRAS_ESPACIOS_ACENTOS.test(val || ''), { message: 'Solo se permiten letras, acentos y espacios.' }).transform(val => val ? toTitleCase(val) : val),
      celular_emergencia: z.string().transform(sanitizePhoneNumber).optional().refine((val) => !val || (val.length === CELULAR_LENGTH && REGEX_CELULAR_BOLIVIA.test(val)), { message: `Celular inválido (debe tener ${CELULAR_LENGTH} dígitos y empezar con 6 o 7).` }),
      tipo_colegio: z.string().transform((val) => val.trim().replace(/\s+/g, ' ')).optional(),
      departamento_colegio: z.string().transform((val) => val.trim().replace(/\s+/g, ' ')).optional().refine((val) => !val || DEPARTAMENTOS_VALIDOS.some(d => normalizeForComparison(d) === normalizeForComparison(val || '')), { message: 'Departamento de colegio inválido.' }).transform(val => val ? toTitleCase(val) : val),
      direccion_colegio: z.string().transform((val) => val.trim().replace(/\s+/g, ' ')).optional(),
      telefono_colegio: z.string().transform(sanitizePhoneNumber).optional().refine((val) => !val || /^\d{7,8}$/.test(val || ''), { message: 'Teléfono de colegio inválido (solo números, 7-8 dígitos).' }),
      grupo: z.string().transform((val) => val.trim().replace(/\s+/g, ' ')).optional(),
      descripcion_del_grupo: z.string().transform((val) => val.trim().replace(/\s+/g, ' ')).optional(),
      capacidad_del_grupo: z.string().transform((val) => val.trim().replace(/\s/g, '')).optional().refine((val) => !val || /^[1-9]\d*$/.test(val || ''), { message: 'Capacidad inválida (solo números enteros mayores a 0).' }),
    })
    .superRefine((data, ctx) => {
      if (!data.area || !data.nivel) return;

      const areaNormalizada = normalizeForComparison(data.area);
      const areaEncontrada = areasConNiveles.find((a) => normalizeForComparison(a.nombre) === areaNormalizada);

      if (!areaEncontrada) {
        const sugerencia = getSuggestion(data.area, areasConNiveles.map((a) => a.nombre));
        ctx.addIssue({ 
          code: z.ZodIssueCode.custom, 
          message: `El área "${data.area}" no existe en la olimpiada. ${sugerencia || ''}`.trim(), 
          path: ['area'] 
        });
        return;
      }

      const nivelNormalizado = normalizeForComparison(data.nivel);
      const nivelEncontrado = areaEncontrada.niveles.find((n) => 
        normalizeForComparison(n.nombre_nivel) === nivelNormalizado
      );

      if (!nivelEncontrado) {
        ctx.addIssue({ 
          code: z.ZodIssueCode.custom, 
          message: 'El nivel ingresado no está habilitado para el área indicada en la Olimpiada.',
          path: ['nivel'] 
        });
        return;
      }

      if (data.grado_escolar) {
        const gradoNormalizado = normalizeForComparison(data.grado_escolar);
        const gradosValidos = nivelEncontrado.grados.map(g => g.nombre_grado);
        
        const gradoEsValido = gradosValidos.some(
          (nombreGrado) => normalizeForComparison(nombreGrado) === gradoNormalizado
        );

        if (!gradoEsValido && gradosValidos.length > 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'El grado ingresado no está habilitado para el nivel indicado en la Olimpiada.',
            path: ['grado_escolar']
          });
        }
      }
    });

  const dataString = firstNewLineIndex === -1 ? '' : cleanText.substring(firstNewLineIndex + 1);
  const parseResult = Papa.parse<string[]>(dataString, { 
    header: false, 
    skipEmptyLines: true, 
    delimiter: detectedDelimiter, 
    transform: (value: string) => value.trim(), 
  });

  const filasPreProcesadas = parseResult.data.map((rowArray, i) => { const numeroDeFila = i + 1; const rawData: { [key: string]: string } = {}; const datosLimpios: Partial<CompetidorCSV> = {}; headersRaw.forEach((header, index) => { const valor = rowArray[index] || ''; rawData[header] = valor; const key = headerMapping[normalizarEncabezado(header)]; if (key) { datosLimpios[key] = valor; } }); const validationResult = filaSchema.safeParse(datosLimpios); const rowSignature = JSON.stringify(Object.values(datosLimpios).map(v => String(v).trim().toLowerCase())); return { numeroDeFila, rawData, datosOriginales: datosLimpios, validationResult, rowSignature }; });
  
  const ciMap = new Map<string, number[]>(); const signatureMap = new Map<string, number[]>();
  filasPreProcesadas.forEach((fila) => { if (!signatureMap.has(fila.rowSignature)) { signatureMap.set(fila.rowSignature, []); } signatureMap.get(fila.rowSignature)!.push(fila.numeroDeFila); if (fila.validationResult.success) { const ci = fila.validationResult.data.ci; if (ci) { if (!ciMap.has(ci)) { ciMap.set(ci, []); } ciMap.get(ci)!.push(fila.numeroDeFila); } } });
  
  const filasProcesadas: FilaProcesada[] = filasPreProcesadas.map((fila): FilaProcesada => { const { numeroDeFila, rawData, validationResult, rowSignature } = fila; if (!validationResult.success) { const errores = validationResult.error.issues.reduce((acc, issue) => { acc[String(issue.path[0] || 'general')] = issue.message; return acc; }, {} as { [key: string]: string }); return { datos: fila.datosOriginales, rawData, esValida: false, errores, numeroDeFila }; } const dataValidada = validationResult.data; const errores: { [key: string]: string } = {}; let esValida = true; const signatureDuplicates = signatureMap.get(rowSignature); if (signatureDuplicates && signatureDuplicates.length > 1) { const otraFila = signatureDuplicates.find(n => n !== numeroDeFila) || signatureDuplicates[0]; errores.general = `Fila idéntica a la fila N° ${otraFila}`; esValida = false; } const ciDuplicates = ciMap.get(dataValidada.ci); if (ciDuplicates && ciDuplicates.length > 1) { if (!errores.general) { const otraFila = ciDuplicates.find(n => n !== numeroDeFila) || ciDuplicates[0]; errores.ci = `CI duplicado con la fila N° ${otraFila}`; esValida = false; } } return { datos: dataValidada, rawData, esValida, errores: Object.keys(errores).length > 0 ? errores : undefined, numeroDeFila }; });

  return { filasProcesadas, headers: headersRaw, errorGlobal: null, invalidHeaders };
};