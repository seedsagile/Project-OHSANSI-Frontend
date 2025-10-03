// src/features/inscritos/utils/csvProcessor.ts

import Papa from 'papaparse';
import { z } from 'zod';
import type { CompetidorCSV, FilaProcesada } from '../types/indexInscritos';
import { DEPARTAMENTOS_VALIDOS } from '../constants';

export const headerMapping: { [key: string]: keyof CompetidorCSV } = {
    'nombres': 'nombres',
    'apellidos': 'apellidos',
    'ci': 'ci',
    'fechadenacimiento': 'fecha_nacimiento',
    'genero': 'genero',
    'celularestudiante': 'celular_estudiante',
    'email': 'email',
    'gradoescolar': 'grado_escolar',
    'departamentoresidencia': 'departamento',
    'departamento': 'departamento',
    'celulartutor': 'celular_tutor',
    'celularemergencia': 'celular_emergencia',
    'colegioinstitucion': 'colegio_institucion',
    'tipodecolegio': 'tipo_colegio',
    'departamentocolegio': 'departamento_colegio',
    'direccioncolegio': 'direccion_colegio',
    'telefonocolegio': 'telefono_colegio',
    'grupo': 'grupo',
    'descripciondelgrupo': 'descripcion_del_grupo',
    'capacidaddelgrupo': 'capacidad_del_grupo',
    'area': 'area',
    'nivel': 'nivel',
};

export const normalizarEncabezado = (header: string): string => header.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

const ENCABEZADOS_REQUERIDOS: (keyof CompetidorCSV)[] = [
    'nombres', 'apellidos', 'ci', 'email', 'departamento',
    'celular_tutor', 'colegio_institucion', 'area', 'nivel'
];

const filaSchema = z.object({
    nombres: z.string().min(1, 'Nombres es obligatorio.'),
    apellidos: z.string().min(1, 'Apellidos es obligatorio.'),
    ci: z.string().min(1, 'CI es obligatorio.'),
    email: z.string().email('Email inválido.'),
    departamento: z.string().transform(val => val.trim().toUpperCase()).pipe(z.enum(DEPARTAMENTOS_VALIDOS, { message: 'Departamento no es válido.' })),
    celular_tutor: z.string().min(1, 'Celular del Tutor es obligatorio.'),
    colegio_institucion: z.string().min(1, 'Colegio es obligatorio.'),
    area: z.string().min(1, 'Área es obligatoria.'),
    nivel: z.string().min(1, 'Nivel es obligatorio.'),
    fecha_nacimiento: z.string().optional(),
    genero: z.string().optional(),
    celular_estudiante: z.string().optional(),
    grado_escolar: z.string().optional(),
    celular_emergencia: z.string().optional(),
    tipo_colegio: z.string().optional(),
    departamento_colegio: z.string().optional(),
    direccion_colegio: z.string().optional(),
    telefono_colegio: z.string().optional(),
    grupo: z.string().optional(),
    descripcion_del_grupo: z.string().optional(),
    capacidad_del_grupo: z.string().regex(/^[0-9]+$/, { message: 'La capacidad debe ser un número.' }).optional(),
});

export const procesarYValidarCSV = (textoCsv: string): { filasProcesadas: FilaProcesada[], headers: string[], errorGlobal: string | null } => {
    if (textoCsv.charCodeAt(0) === 0xFEFF) { textoCsv = textoCsv.substring(1); }
    const lines = textoCsv.trim().split(/\r\n|\n/);
    if (lines.length <= 1 && lines[0].trim() === '') {
        return { filasProcesadas: [], headers: [], errorGlobal: 'El archivo CSV está vacío.' };
    }
    
    // --- LÓGICA DE DETECCIÓN DE DELIMITADOR EN LA CABECERA ---
    const headerLine = lines.shift() || '';
    const potentialDelimiters = [';', ',', '\t'];
    let detectedDelimiter = ';'; // Valor por defecto

    for (const delimiter of potentialDelimiters) {
        if (headerLine.includes(delimiter)) {
            detectedDelimiter = delimiter;
            break; // Usar el primer delimitador encontrado
        }
    }
    
    const headersRaw = headerLine.split(detectedDelimiter).map(h => h.trim()).filter(Boolean);
    const headersMapeados = headersRaw.map(h => headerMapping[normalizarEncabezado(h)]);

    const encabezadosFaltantes = ENCABEZADOS_REQUERIDOS.filter(h => !headersMapeados.includes(h));
    if (encabezadosFaltantes.length > 0) {
        return { filasProcesadas: [], headers: [], errorGlobal: `Faltan las siguientes columnas obligatorias: ${encabezadosFaltantes.join(', ')}` };
    }

    const dataString = lines.join('\n');
    
    // --- CAMBIO PRINCIPAL ---
    // Al pasar el delimitador detectado, PapaParse lo usará para todo el archivo.
    const parseResult = Papa.parse<string[]>(dataString, {
        header: false,
        skipEmptyLines: true,
        delimiter: detectedDelimiter, // Usamos el delimitador detectado
        transform: (value: string) => value.trim()
    });
    
    const datosComoObjetos = parseResult.data.map((rowArray: string[]) => {
        const rowObject: { [key: string]: string } = {};
        headersMapeados.forEach((headerKey, index) => {
            if (headerKey) {
                rowObject[headerKey] = rowArray[index] || '';
            }
        });
        return rowObject as Partial<CompetidorCSV>;
    });

    const filasProcesadas: FilaProcesada[] = [];
    const ciSet = new Set<string>();

    datosComoObjetos.forEach((fila: Partial<CompetidorCSV>, i: number) => {
        const numeroDeFila = i + 2;
        const validationResult = filaSchema.safeParse(fila);

        if (!validationResult.success) {
            const errores = validationResult.error.issues.reduce((acc, issue) => {
                acc[issue.path.join('.')] = issue.message;
                return acc;
            }, {} as { [key: string]: string });
            filasProcesadas.push({ datos: fila, esValida: false, errores, numeroDeFila });
        } else {
            const dataValidada = validationResult.data;
            if (ciSet.has(dataValidada.ci)) {
                filasProcesadas.push({ datos: dataValidada, esValida: false, errores: { ci: 'Este CI está duplicado en el archivo.' }, numeroDeFila });
            } else {
                ciSet.add(dataValidada.ci);
                filasProcesadas.push({ datos: dataValidada, esValida: true, numeroDeFila });
            }
        }
    });

    return { filasProcesadas, headers: headersRaw, errorGlobal: null };
};