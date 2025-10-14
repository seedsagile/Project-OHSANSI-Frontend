import Papa from 'papaparse';
import { z } from 'zod';
import type { FilaProcesada, CompetidorCSV } from '../types/indexInscritos';
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
    return header.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
};

const normalizeForComparison = (str: string): string => {
    if (!str) return '';
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

const toTitleCase = (str: string): string => {
    if (!str) return '';
    return str
        .trim()
        .replace(/\s+/g, ' ')
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
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
    'n': 'nro', 'no': 'nro', 'nro': 'nro', 'numero': 'nro',
    'doc': 'ci', 'gen': 'genero', 'dep': 'departamento', 'celular': 'celular_estudiante', 'colegio': 'colegio_institucion', 'email': 'email', 'nombres': 'nombres', 'apellidos': 'apellidos', 'fechadenacimiento': 'fecha_nacimiento', 'gradoescolar': 'grado_escolar', 'nombretutor': 'nombre_tutor', 'celulartutor': 'celular_tutor', 'celularemergencia': 'celular_emergencia', 'tipodecolegio': 'tipo_colegio', 'departamentocolegio': 'departamento_colegio', 'direccioncolegio': 'direccion_colegio', 'telefonocolegio': 'telefono_colegio', 'grupo': 'grupo', 'descripciondelgrupo': 'descripcion_del_grupo', 'capacidaddelgrupo': 'capacidad_del_grupo', 'area': 'area', 'nivel': 'nivel',
};

export const reverseHeaderMapping: { [key: string]: string } = {
    ci: 'DOC.', genero: 'GEN', departamento: 'DEP.', celular_estudiante: 'CELULAR', colegio_institucion: 'COLEGIO', email: 'E-MAIL', nombres: 'NOMBRES', apellidos: 'APELLIDOS', area: 'AREA', nivel: 'NIVEL'
};

const allValidNormalizedHeaders = Object.keys(headerMapping);
const requiredCSVKeys: (keyof CompetidorCSV)[] = ['ci', 'nombres', 'apellidos', 'genero', 'departamento', 'colegio_institucion', 'celular_estudiante', 'email', 'area', 'nivel'];

export const procesarYValidarCSV = (
    textoCsv: string,
    areasValidas: string[],
    nivelesValidos: string[]
): ProcesamientoCSVResult => {

    const filaSchema = z.object({
        nro: z.string().optional(),

        nombres: z.string().transform(val => val.trim())
            .superRefine((val, ctx) => {
                if (val.length === 0) {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Este campo es obligatorio.' });
                    return;
                }
                if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(val)) {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Solo se permiten letras, acentos y espacios.' });
                }
            }).transform(toTitleCase),

        apellidos: z.string().transform(val => val.trim())
            .superRefine((val, ctx) => {
                if (val.length === 0) {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Este campo es obligatorio.' });
                    return;
                }
                if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(val)) {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Solo se permiten letras, acentos y espacios.' });
                }
            }).transform(toTitleCase),

        ci: z.string().transform(val => val.trim().toUpperCase())
            .superRefine((val, ctx) => {
                if (val.length === 0) {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Este campo es obligatorio.' });
                    return;
                }

                if (!/^[0-9]+(-?[A-Z])?$/.test(val)) {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Formato inválido. Ej: 7962927, 7962927A, 7962927-A.' });
                }
            }),

        genero: z.string().transform(val => val.trim().toUpperCase())
            .superRefine((val, ctx) => {
                if (val.length === 0) {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Este campo es obligatorio.' });
                    return;
                }
                if (!/^[FM]$/.test(val)) {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Debe ser una sola letra: "M" o "F".' });
                }
            }),

        departamento: z.string().transform(val => val.trim())
            .superRefine((val, ctx) => {
                if (val.length === 0) {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Este campo es obligatorio.' });
                    return;
                }

                if (!DEPARTAMENTOS_VALIDOS.some(d => normalizeForComparison(d) === normalizeForComparison(val))) {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'El departamento no es válido.' });
                }
            }).transform(toTitleCase),
        
        colegio_institucion: z.string().transform(val => val.trim())
            .superRefine((val, ctx) => {
                if (val.length === 0) {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Este campo es obligatorio.' });
                    return;
                }
                if (!/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+$/.test(val)) {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Solo se permiten letras, números, acentos y espacios.' });
                }
            }),

        celular_estudiante: z.string().transform(val => val.trim()).superRefine((val, ctx) => {
            if (val.length === 0) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Este campo es obligatorio.' });
                return;
            }

            if (!/^[0-9]+$/.test(sanitizePhoneNumber(val))) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Solo se permiten números.' });
            }
        }).transform(sanitizePhoneNumber),

        email: z.string().transform(val => val.trim())
            .superRefine((val, ctx) => {
                if (val.length === 0) {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Este campo es obligatorio.' });
                    return;
                }

                if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(val)) {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'El formato del email no es válido.' });
                }
            }),

        area: z.string().transform(val => val.trim())
            .superRefine((val, ctx) => {
                if (val.length === 0) {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Este campo es obligatorio.' });
                    return;
                }
                if (!areasValidas.some(a => normalizeForComparison(a) === normalizeForComparison(val))) {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, message: `El área no existe. ${getSuggestion(val, areasValidas as string[]) || ''}`.trim() });
                }
            }),

        nivel: z.string().transform(val => val.trim())
            .superRefine((val, ctx) => {
                if (val.length === 0) {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Este campo es obligatorio.' });
                    return;
                }
                if (!nivelesValidos.some(n => normalizeForComparison(n) === normalizeForComparison(val))) {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, message: `El nivel no existe. ${getSuggestion(val, nivelesValidos as string[]) || ''}`.trim() });
                }
            }),
        
        fecha_nacimiento: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), { message: 'Formato de fecha inválido.' }),
        grado_escolar: z.string().optional(),
        nombre_tutor: z.string().optional(),
        celular_tutor: z.string().optional().transform(val => val ? sanitizePhoneNumber(val) : val),
        celular_emergencia: z.string().optional().transform(val => val ? sanitizePhoneNumber(val) : val),
        tipo_colegio: z.string().optional(),
        departamento_colegio: z.string().optional(),
        direccion_colegio: z.string().optional(),
        telefono_colegio: z.string().optional(),
        grupo: z.string().optional(),
        descripcion_del_grupo: z.string().optional(),
        capacidad_del_grupo: z.string().regex(/^[0-9]+$/, { message: 'Capacidad debe ser un número.' }).optional(),
    });

    let cleanText = textoCsv;

    if (cleanText.charCodeAt(0) === 0xFEFF) { cleanText = cleanText.substring(1); }

    if (cleanText.trim() === '') { return { filasProcesadas: [], headers: [], errorGlobal: 'El archivo CSV está vacío.', invalidHeaders: [] }; }
    
    const firstNewLineIndex = cleanText.search(/\r\n|\n|\r/);
    
    const headerLine = firstNewLineIndex === -1 ? cleanText : cleanText.substring(0, firstNewLineIndex);
    
    const dataString = firstNewLineIndex === -1 ? '' : cleanText.substring(firstNewLineIndex + 1);
    
    const detectedDelimiter = [';', ',', '\t'].find(d => headerLine.includes(d)) || ';';
    
    const headersRaw = headerLine.split(detectedDelimiter).map(h => h.trim()).filter(Boolean);
    
    const headersMapeados = headersRaw.map(h => headerMapping[normalizarEncabezado(h)]);
    
    const encabezadosFaltantes = requiredCSVKeys.filter(key => !headersMapeados.includes(key));
    
    const invalidHeaders = headersRaw.filter(h => !allValidNormalizedHeaders.includes(normalizarEncabezado(h)));
    
    if (encabezadosFaltantes.length > 0) { const nombresFaltantes = encabezadosFaltantes.map(key => `"${reverseHeaderMapping[key] || key}"`); const errorMessage = `Faltan las siguientes columnas obligatorias: ${nombresFaltantes.join(', ')}. Por favor, corrija el archivo CSV.`; return { filasProcesadas: [], headers: headersRaw, errorGlobal: errorMessage, invalidHeaders }; }
    
    const parseResult = Papa.parse<string[]>(dataString, { header: false, skipEmptyLines: true, delimiter: detectedDelimiter, transform: (value: string) => value.trim() });
    
    const datosCompletos = parseResult.data.map((rowArray: string[]) => {
        const datosLimpios: Partial<CompetidorCSV> = {};
        const rawData: { [key: string]: string } = {};
        headersRaw.forEach((header, index) => { const valor = rowArray[index] || ''; rawData[header] = valor; const key = headerMapping[normalizarEncabezado(header)]; if (key) { datosLimpios[key] = valor; } });
        return { datosLimpios, rawData };
    });
    
    const filasProcesadas: FilaProcesada[] = [];
    
    const ciSet = new Set<string>();
    
    const rowSignatures = new Set<string>();
    
    datosCompletos.forEach(({ datosLimpios, rawData }, i) => {
        const numeroDeFila = i + 1;
        const rowSignature = JSON.stringify(Object.values(datosLimpios).map(v => String(v).trim().toLowerCase()));
        if (rowSignatures.has(rowSignature)) { filasProcesadas.push({ datos: datosLimpios, rawData, esValida: false, errores: { general: 'Fila duplicada en el archivo.' }, numeroDeFila }); return; }
        rowSignatures.add(rowSignature);
        const validationResult = filaSchema.safeParse(datosLimpios);

        if (!validationResult.success) {
            const errores = validationResult.error.issues.reduce((acc, issue) => { acc[String(issue.path[0])] = issue.message; return acc; }, {} as { [key: string]: string });
            filasProcesadas.push({ datos: datosLimpios, rawData, esValida: false, errores, numeroDeFila });
        } else {
            const dataValidada = validationResult.data;
            if (ciSet.has(dataValidada.ci)) { filasProcesadas.push({ datos: dataValidada, rawData, esValida: false, errores: { ci: 'CI duplicado en el archivo.' }, numeroDeFila }); }
            else { ciSet.add(dataValidada.ci); filasProcesadas.push({ datos: dataValidada, rawData, esValida: true, numeroDeFila }); }
        }
    });
    return { filasProcesadas, headers: headersRaw, errorGlobal: null, invalidHeaders };
};