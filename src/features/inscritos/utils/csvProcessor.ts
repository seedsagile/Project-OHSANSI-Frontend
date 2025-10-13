import Papa from 'papaparse';
import { z } from 'zod';
import type { CompetidorCSV, FilaProcesada } from '../types/indexInscritos';
import { DEPARTAMENTOS_VALIDOS } from '../constants';
import levenshtein from 'fast-levenshtein';

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

const getSuggestion = (value: string, validOptions: string[]): string | null => {
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
    'doc': 'ci', 'gen': 'genero', 'dep': 'departamento', 'celular': 'celular_estudiante', 'colegio': 'colegio_institucion', 'email': 'email', 'nombres': 'nombres', 'apellidos': 'apellidos', 'fechadenacimiento': 'fecha_nacimiento', 'gradoescolar': 'grado_escolar', 'nombretutor': 'nombre_tutor', 'celulartutor': 'celular_tutor', 'celularemergencia': 'celular_emergencia', 'tipodecolegio': 'tipo_colegio', 'departamentocolegio': 'departamento_colegio', 'direccioncolegio': 'direccion_colegio', 'telefonocolegio': 'telefono_colegio', 'grupo': 'grupo', 'descripciondelgrupo': 'descripcion_del_grupo', 'capacidaddelgrupo': 'capacidad_del_grupo', 'area': 'area', 'nivel': 'nivel',
};

const reverseHeaderMapping: { [key: string]: string } = {
    ci: 'DOC.',
    genero: 'GEN',
    departamento: 'DEP.',
    celular_estudiante: 'CELULAR',
    colegio_institucion: 'COLEGIO',
    email: 'E-MAIL',
    nombres: 'NOMBRES',
    apellidos: 'APELLIDOS',
    area: 'AREA',
    nivel: 'NIVEL'
};

const allValidNormalizedHeaders = Object.keys(headerMapping);
const requiredCSVKeys: (keyof CompetidorCSV)[] = ['ci', 'nombres', 'apellidos', 'genero', 'departamento', 'colegio_institucion', 'celular_estudiante', 'email', 'area', 'nivel'];

export const procesarYValidarCSV = (
    textoCsv: string,
    areasValidas: string[],
    nivelesValidos: string[]
): { filasProcesadas: FilaProcesada[], headers: string[], errorGlobal: string | null, invalidHeaders?: string[] } => {

    const filaSchema = z.object({
        nombres: z.string().trim().min(1, 'Nombres es obligatorio.')
            .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Nombres solo permite letras y espacios.')
            .transform(toTitleCase),
        apellidos: z.string().trim().min(1, 'Apellidos es obligatorio.')
            .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Apellidos solo permite letras y espacios.')
            .transform(toTitleCase),
        ci: z.string().trim().min(1, 'CI (DOC.) es obligatorio.').regex(/^[0-9]+(-[A-Za-z0-9]{1,2})?$/, 'Formato de CI inválido.'),
        genero: z.string().trim().min(1, 'Género (GEN) es obligatorio.').refine(val => ['M', 'F'].includes(val.toUpperCase()), { message: 'Género debe ser "M" o "F".' }).transform(val => val.toUpperCase()),
        departamento: z.string().trim().min(1, 'Departamento (DEP.) es obligatorio.')
            .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Departamento solo permite letras y espacios.')
            .refine(val => DEPARTAMENTOS_VALIDOS.some(d => d.toLowerCase() === val.toLowerCase()), { message: 'Departamento no válido.' })
            .transform(toTitleCase),
        colegio_institucion: z.string().trim().min(1, 'Colegio/Institución es obligatorio.'),
        celular_estudiante: z.string().transform(sanitizePhoneNumber).pipe(z.string().min(1, 'Celular del Estudiante es obligatorio.')),
        email: z.string().trim().min(1, 'Email es obligatorio.').email('Formato de email inválido.'),
        
        area: z.string().trim().min(1, 'Área es obligatoria.').superRefine((val, ctx) => {
            const normalizedVal = normalizeForComparison(val);
            if (!areasValidas.some(a => normalizeForComparison(a) === normalizedVal)) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: `El Área "${val}" no es válida. ${getSuggestion(val, areasValidas) || ''}`.trim() });
            }
        }),
        nivel: z.string().trim().min(1, 'Nivel es obligatorio.').superRefine((val, ctx) => {
            const normalizedVal = normalizeForComparison(val);
            if (!nivelesValidos.some(n => normalizeForComparison(n) === normalizedVal)) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: `El Nivel "${val}" no es válido. ${getSuggestion(val, nivelesValidos) || ''}`.trim() });
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

    if (cleanText.trim() === '') {
        return { filasProcesadas: [], headers: [], errorGlobal: 'El archivo CSV está vacío.' };
    }
    
    const firstNewLineIndex = cleanText.search(/\r\n|\n|\r/);
    const headerLine = firstNewLineIndex === -1 ? cleanText : cleanText.substring(0, firstNewLineIndex);
    const dataString = firstNewLineIndex === -1 ? '' : cleanText.substring(firstNewLineIndex + 1);

    const detectedDelimiter = [';', ',', '\t'].find(d => headerLine.includes(d)) || ';';
    
    const headersRaw = headerLine.split(detectedDelimiter).map(h => h.trim()).filter(Boolean);
    const headersMapeados = headersRaw.map(h => headerMapping[normalizarEncabezado(h)]);
    
    const encabezadosFaltantes = requiredCSVKeys.filter(key => !headersMapeados.includes(key));
    const invalidHeaders = headersRaw.filter(h => !allValidNormalizedHeaders.includes(normalizarEncabezado(h)));

    if (encabezadosFaltantes.length > 0) {
        const nombresFaltantes = encabezadosFaltantes.map(key => `"${reverseHeaderMapping[key] || key}"`);
        const errorMessage = `Faltan las siguientes columnas obligatorias: ${nombresFaltantes.join(', ')}. Por favor, corrija el archivo CSV.`;
        return { filasProcesadas: [], headers: headersRaw, errorGlobal: errorMessage, invalidHeaders };
    }
    if (invalidHeaders.length > 0) {
        const nombresInvalidos = invalidHeaders.map(h => `"${h}"`);
        const errorMessage = `Las siguientes columnas no son reconocidas: ${nombresInvalidos.join(', ')}. No se pueden procesar los datos.`;
        return { filasProcesadas: [], headers: headersRaw, errorGlobal: errorMessage, invalidHeaders };
    }

    const parseResult = Papa.parse<string[]>(dataString, { header: false, skipEmptyLines: true, delimiter: detectedDelimiter, transform: (value: string) => value.trim() });
    
    const datosComoObjetos = parseResult.data.map((rowArray: string[]) => {
        const rowObject: { [key: string]: string } = {};
        headersMapeados.forEach((headerKey, index) => { if (headerKey) rowObject[headerKey] = rowArray[index] || ''; });
        return rowObject as Partial<CompetidorCSV>;
    });

    const filasProcesadas: FilaProcesada[] = [];
    const ciSet = new Set<string>();
    const rowSignatures = new Set<string>();

    datosComoObjetos.forEach((fila, i) => {
        const numeroDeFila = i + 2;
        const rowSignature = JSON.stringify(Object.values(fila).map(v => String(v).trim().toLowerCase()));

        if (rowSignatures.has(rowSignature)) {
            filasProcesadas.push({ datos: fila, esValida: false, errores: { general: 'Fila duplicada en el archivo.' }, numeroDeFila });
            return;
        }
        rowSignatures.add(rowSignature);

        const validationResult = filaSchema.safeParse(fila);

        if (!validationResult.success) {
            const errores = validationResult.error.issues.reduce((acc, issue) => { 
                acc[String(issue.path[0])] = issue.message; 
                return acc; 
            }, {} as { [key: string]: string });
            filasProcesadas.push({ datos: fila, esValida: false, errores, numeroDeFila });
        } else {
            const dataValidada = validationResult.data;
            if (ciSet.has(dataValidada.ci)) {
                filasProcesadas.push({ datos: dataValidada, esValida: false, errores: { ci: 'CI duplicado en el archivo.' }, numeroDeFila });
            } else {
                ciSet.add(dataValidada.ci);
                filasProcesadas.push({ datos: dataValidada, esValida: true, numeroDeFila });
            }
        }
    });

    return { filasProcesadas, headers: headersRaw, errorGlobal: null, invalidHeaders: [] };
};