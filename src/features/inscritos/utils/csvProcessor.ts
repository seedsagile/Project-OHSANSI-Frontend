import Papa from 'papaparse';
import { z } from 'zod'; // Asegúrate de importar z
import type { CompetidorCSV, FilaProcesada } from '../types/indexInscritos';
import { DEPARTAMENTOS_VALIDOS } from '../constants';
import levenshtein from 'fast-levenshtein';


const toTitleCase = (str: string): string =>
    str.trim().toLowerCase().replace(/\b\w/g, char => char.toUpperCase());

const sanitizePhoneNumber = (phone: string): string => phone.replace(/\D/g, '');

const getSuggestion = (value: string, validOptions: string[]): string | null => {
    if (validOptions.length === 0) return null;
    let bestMatch = '';
    let minDistance = Infinity;

    validOptions.forEach(option => {
        const distance = levenshtein.get(value.toLowerCase(), option.toLowerCase());
        if (distance < minDistance && distance <= 3) {
            minDistance = distance;
            bestMatch = option;
        }
    });
    return bestMatch ? `¿Quizás quisiste decir "${bestMatch}"?` : null;
};

export const headerMapping: { [key: string]: keyof CompetidorCSV } = {
    'nombres': 'nombres', 'apellidos': 'apellidos', 'ci': 'ci',
    'fechadenacimiento': 'fecha_nacimiento', 'genero': 'genero',
    'celularestudiante': 'celular_estudiante', 'email': 'email', 'gradoescolar': 'grado_escolar',
    'departamentoresidencia': 'departamento', 'departamento': 'departamento',
    'celulartutor': 'celular_tutor', 'celularemergencia': 'celular_emergencia',
    'colegioinstitucion': 'colegio_institucion', 'tipodecolegio': 'tipo_colegio',
    'departamentocolegio': 'departamento_colegio', 'direccioncolegio': 'direccion_colegio',
    'telefonocolegio': 'telefono_colegio', 'grupo': 'grupo',
    'descripciondelgrupo': 'descripcion_del_grupo', 'capacidaddelgrupo': 'capacidad_del_grupo',
    'area': 'area', 'nivel': 'nivel',
};
export const allValidNormalizedHeaders = Object.keys(headerMapping);
export const requiredCSVKeys: (keyof CompetidorCSV)[] = [
    'nombres', 'apellidos', 'ci', 'email', 'departamento',
    'celular_tutor', 'colegio_institucion', 'area', 'nivel'
];
export const normalizarEncabezado = (header: string): string => header.trim().toLowerCase().replace(/[^a-z0-9]/g, '');


export const procesarYValidarCSV = (
    textoCsv: string,
    areasValidas: string[],
    nivelesValidos: string[]
): {
    filasProcesadas: FilaProcesada[],
    headers: string[],
    errorGlobal: string | null,
    invalidHeaders: string[]
} => {

    const filaSchema = z.object({
        nombres: z.string().trim().min(1, 'Nombres es obligatorio.').transform(toTitleCase),
        apellidos: z.string().trim().min(1, 'Apellidos es obligatorio.').transform(toTitleCase),
        celular_tutor: z.string().transform(sanitizePhoneNumber).pipe(z.string().min(1, 'Celular del Tutor es obligatorio.')),
        celular_estudiante: z.string().optional().transform(val => val ? sanitizePhoneNumber(val) : val),
        celular_emergencia: z.string().optional().transform(val => val ? sanitizePhoneNumber(val) : val),
        
        ci: z.string().trim().min(1, 'CI es obligatorio.')
            .regex(/^[0-9]+(-[A-Za-z0-9]{1,2})?$/, 'El formato del CI no es válido. Ej: 1234567 o 1234567-1A'),
        email: z.string().trim().min(1, 'Email es obligatorio.').email('Formato de email inválido.'),
        departamento: z.string().transform(val => val.trim().toUpperCase()).pipe(z.enum(DEPARTAMENTOS_VALIDOS, { message: 'Departamento no es válido.' })),
        
        area: z.string().trim().min(1, 'Área es obligatoria.')
            .superRefine((val, ctx) => {
                if (!areasValidas.includes(val)) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: `El Área "${val}" no es válida. ${getSuggestion(val, areasValidas) || ''}`.trim()
                    });
                }
            }),

        nivel: z.string().trim().min(1, 'Nivel es obligatorio.')
            .superRefine((val, ctx) => {
                if (!nivelesValidos.includes(val)) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: `El Nivel "${val}" no es válido. ${getSuggestion(val, nivelesValidos) || ''}`.trim()
                    });
                }
            }),


        fecha_nacimiento: z.string().optional().refine(val => {
            if (!val || val.trim() === '') return true;
            const date = new Date(val);
            const year = date.getFullYear();
            return !isNaN(date.getTime()) && year > 1950 && date < new Date();
        }, { message: 'Fecha de nacimiento inválida. Debe ser posterior a 1950 y anterior a hoy.' }),

        colegio_institucion: z.string().min(1, 'Colegio es obligatorio.'),
        genero: z.string().optional(),
        grado_escolar: z.string().optional(),
        tipo_colegio: z.string().optional(),
        departamento_colegio: z.string().optional(),
        direccion_colegio: z.string().optional(),
        telefono_colegio: z.string().optional(),
        grupo: z.string().optional(),
        descripcion_del_grupo: z.string().optional(),
        capacidad_del_grupo: z.string().regex(/^[0-9]+$/, { message: 'La capacidad debe ser un número.' }).optional(),
    
    }).superRefine((data, ctx) => {
        const hasGroupInfo = data.grupo || data.descripcion_del_grupo;
        const capacity = data.capacidad_del_grupo ? parseInt(data.capacidad_del_grupo, 10) : 0;
        if (hasGroupInfo && (!capacity || capacity <= 1)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['capacidad_del_grupo'], message: 'Si se especifica un grupo, la capacidad debe ser mayor a 1.' });
        }
        if (!hasGroupInfo && capacity > 1) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['grupo'], message: 'No se puede definir una capacidad > 1 si no hay grupo.' });
        }
    });

    const lines = textoCsv.trim().split(/\r\n|\n/);
    if (lines.length === 0 || (lines.length === 1 && lines[0].trim() === '')) {
        return { filasProcesadas: [], headers: [], errorGlobal: 'El archivo CSV está vacío.', invalidHeaders: [] };
    }
    const headerLine = lines.shift() || '';
    const detectedDelimiter = [';', ',', '\t'].find(d => headerLine.includes(d)) || ';';
    const headersRaw = headerLine.split(detectedDelimiter).map(h => h.trim()).filter(Boolean);
    const invalidHeaders: string[] = [];
    const headersMapeados = headersRaw.map(h => {
        const normalized = normalizarEncabezado(h);
        const mappedKey = headerMapping[normalized];
        if (!mappedKey) invalidHeaders.push(h);
        return mappedKey;
    });
    const encabezadosFaltantes = requiredCSVKeys.filter(key => !headersMapeados.includes(key));
    if (encabezadosFaltantes.length > 0) {
        return { filasProcesadas: [], headers: headersRaw, errorGlobal: `Faltan las siguientes columnas obligatorias: ${encabezadosFaltantes.join(', ')}`, invalidHeaders };
    }
    const dataString = lines.join('\n');
    const parseResult = Papa.parse<(string | null)[]>(dataString, {
        header: false, skipEmptyLines: true, delimiter: detectedDelimiter, transform: (value: string) => value.trim()
    });
    const datosComoObjetos = parseResult.data.map((rowArray) => {
        const rowObject: { [key: string]: string | null } = {};
        headersRaw.forEach((header, index) => {
            const mappedKey = headerMapping[normalizarEncabezado(header)];
            if (mappedKey) rowObject[mappedKey] = rowArray[index] || '';
        });
        return rowObject as Partial<CompetidorCSV>;
    });
    const filasProcesadas: FilaProcesada[] = [];
    const rowSignatureSet = new Set<string>();
    datosComoObjetos.forEach((fila, i) => {
        const numeroDeFila = i + 2;
        const rowSignature = JSON.stringify(Object.values(fila).sort()).toLowerCase().replace(/\s+/g, '');
        const validationResult = filaSchema.safeParse(fila);
        if (!validationResult.success) {
            const errores = validationResult.error.issues.reduce((acc, issue) => {
                acc[issue.path.join('.')] = issue.message;
                return acc;
            }, {} as { [key: string]: string });
            filasProcesadas.push({ datos: fila, esValida: false, errores, numeroDeFila });
        } else {
            const dataValidada = validationResult.data;
            if (rowSignatureSet.has(rowSignature)) {
                filasProcesadas.push({
                    datos: dataValidada, esValida: false,
                    errores: { Fila: `Esta fila es un duplicado exacto de otra en el archivo.` },
                    numeroDeFila
                });
            } else {
                rowSignatureSet.add(rowSignature);
                filasProcesadas.push({ datos: dataValidada, esValida: true, numeroDeFila });
            }
        }
    });
    return { filasProcesadas, headers: headersRaw, errorGlobal: null, invalidHeaders };
};