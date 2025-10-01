import { useState, useCallback } from 'react';
import Papa from 'papaparse';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { AxiosError } from 'axios';
import type { ApiErrorResponse, CompetidorCSV, InscripcionPayload, CompetidorIndividualPayload } from '../types/indexInscritos';
import { importarCompetidoresAPI } from '../services/ApiInscripcion';
import type { FileRejection } from 'react-dropzone';
import { separarNombreCompleto } from '../../responsables/utils/responsableUtils';

export type ModalState = {
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'confirmation';
    onConfirm?: () => void;
};

const initialModalState: ModalState = { isOpen: false, title: '', message: '', type: 'info' };

const toTitleCase = (str: string) => 
    str.toLowerCase().replace(/\s+/g, ' ').trim().split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');

const normalizarEncabezado = (header: string): string => header.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

const ENCABEZADOS_REQUERIDOS = ['nombre', 'ci', 'telftutor', 'colegio', 'departamento', 'nivel', 'area', 'tipodeinscripcion'];
const DEPARTAMENTOS_VALIDOS = [
    'COCHABAMBA', 'LA PAZ', 'SANTA CRUZ', 'ORURO', 'POTOSI', 
    'TARIJA', 'CHUQUISACA', 'BENI', 'PANDO'
] as const;

const filaSchema = z.object({
    nombre: z.string()
        .min(1, 'El nombre no puede estar vacío.')
        .regex(/^[a-zA-Z\s\u00C0-\u017F]+$/, 'El nombre solo debe contener letras y espacios.')
        .transform(toTitleCase),
    
    ci: z.string()
        .min(1, 'El CI no puede estar vacío.')
        .regex(/^[0-9]+[a-zA-Z-]*$/, 'El formato del CI no es válido (solo números y un guion o letra al final).'),
    
    telftutor: z.string()
        .min(1, 'El teléfono del tutor no puede estar vacío.')
        .regex(/^[0-9+\s()-]+$/, 'El formato del teléfono no es válido.'),

    colegio: z.string().min(1, 'El colegio no puede estar vacío.').transform(toTitleCase),
    
    departamento: z.string().transform(val => val.trim().toUpperCase().replace('Í', 'I')).pipe(
        z.enum(DEPARTAMENTOS_VALIDOS, {
            message: 'El departamento no es válido.'
        })
    ),

    nivel: z.string().min(1, 'El nivel no puede estar vacío.').transform(toTitleCase),
    area: z.string().min(1, 'El área no puede estar vacía.').transform(toTitleCase),
    
    tipodeinscripcion: z.string().transform(val => val.trim().toUpperCase()).pipe(
        z.enum(['INDIVIDUAL', 'GRUPAL'], {
            message: "El tipo de inscripción solo puede ser 'Individual' o 'Grupal'."
        })
    ),
});

const DEFAULT_FECHA_NAC = '2000-01-01';
const DEFAULT_GENERO = null;
const DEFAULT_GRADO_ESCOLAR = 'No especificado';

const procesarYValidarCSV = (textoCsv: string): { datos: CompetidorCSV[], error: string | null } => {
    if (textoCsv.charCodeAt(0) === 0xFEFF) {
        textoCsv = textoCsv.substring(1);
    }
    
    const lines = textoCsv.trim().split(/\r\n|\n/);
    if (lines.length <= 1 && lines[0].trim() === '') {
        return { datos: [], error: 'El archivo CSV está vacío.' };
    }

    const headerLine = lines.shift() || '';
    const dataString = lines.join('\n');

    const headersRaw = headerLine.split(';').map(h => h.trim()).filter(Boolean);
    const headersSanitizados = headersRaw.map(normalizarEncabezado);
    
    const cabecerasUnicas = new Set(headersSanitizados);
    if (cabecerasUnicas.size !== headersSanitizados.length) {
        return { datos: [], error: 'El archivo contiene columnas con nombres duplicados. Por favor, revise las cabeceras.' };
    }
    
    const encabezadosRequeridosSet = new Set(ENCABEZADOS_REQUERIDOS);
    const encabezadosEncontradosSet = new Set(headersSanitizados);

    const encabezadosFaltantes = ENCABEZADOS_REQUERIDOS.filter(h => !encabezadosEncontradosSet.has(h));
    const encabezadosNoReconocidos = headersRaw.filter(h => !encabezadosRequeridosSet.has(normalizarEncabezado(h)));

    if (encabezadosFaltantes.length > 0) {
        const mensajeError = `El archivo no es válido.\n\nFaltan las siguientes columnas obligatorias:\n- ${encabezadosFaltantes.join('\n- ')}`;
        return { datos: [], error: mensajeError };
    }
    
    if (encabezadosNoReconocidos.length > 0) {
        const mensajeError = `El archivo contiene columnas no permitidas.\n\nPor favor, elimine las siguientes columnas e intente de nuevo:\n- ${encabezadosNoReconocidos.join('\n- ')}`;
        return { datos: [], error: mensajeError };
    }

    const parseResult = Papa.parse<string[]>(dataString, { 
        header: false, 
        skipEmptyLines: false, 
        delimiter: ";", 
        transform: (value) => value.trim() 
    });

    const datosComoObjetos = parseResult.data.map((rowArray) => {
        const rowObject: { [key: string]: string } = {};
        headersSanitizados.forEach((header, index) => { rowObject[header] = rowArray[index] || ''; });
        return rowObject;
    });

    const datosValidados = [];
    const ciSet = new Set<string>();

    for (let i = 0; i < datosComoObjetos.length; i++) {
        const fila = datosComoObjetos[i];
        const numeroDeFila = i + 2;

        if (Object.values(fila).every(val => val === '')) {
            continue;
        }

        const validationResult = filaSchema.safeParse(fila);
        if (!validationResult.success) {
            const firstError = validationResult.error.issues[0];
            const mensaje = `Error en la fila ${numeroDeFila}: ${firstError.message} (Campo: '${firstError.path.join(', ')}').`;
            return { datos: [], error: `Datos inválidos en el archivo.\n\n${mensaje}` };
        }

        if (ciSet.has(validationResult.data.ci)) {
            return { datos: [], error: `El archivo contiene CIs duplicados. El CI "${validationResult.data.ci}" está repetido.` };
        }
        ciSet.add(validationResult.data.ci);
        datosValidados.push(validationResult.data as CompetidorCSV);
    }
    
    if (datosValidados.length === 0) {
        return { datos: [], error: 'El archivo CSV no contiene filas con datos válidos.' };
    }

    return { datos: datosValidados, error: null };
};


export function useImportarCompetidores() {
    const [datos, setDatos] = useState<CompetidorCSV[]>([]);
    const [nombreArchivo, setNombreArchivo] = useState<string | null>(null);
    const [esArchivoValido, setEsArchivoValido] = useState(false);
    const [modalState, setModalState] = useState<ModalState>(initialModalState);

    const { mutate, isPending } = useMutation({
        mutationFn: (payload: InscripcionPayload) => importarCompetidoresAPI(payload),
        onSuccess: (response: { message: string }) => {
            setModalState({
                isOpen: true,
                type: 'success',
                title: '¡Éxito!',
                message: response.message || 'Lista de competidores registrada correctamente.',
            });
            reset();
        },
        onError: (error: AxiosError<ApiErrorResponse>) => {
            let message = 'Error al registrar. Por favor, intente de nuevo.';
            if (error.response?.data?.errors) {
                const errors = error.response.data.errors;
                const firstErrorKey = Object.keys(errors)[0];
                const firstErrorMessage = errors[firstErrorKey][0];
                message = `Error de validación: ${firstErrorMessage}`;
            } else if (error.response?.data?.message) {
                message = error.response.data.message;
            }
            setModalState({ isOpen: true, type: 'error', title: 'Error de Registro', message });
        },
    });

    const reset = useCallback(() => {
        setDatos([]);
        setNombreArchivo(null);
        setEsArchivoValido(false);
    }, []);

    const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
        reset();
        if (fileRejections.length > 0) {
            setModalState({ isOpen: true, type: 'error', title: 'Archivo no válido', message: 'Formato no válido. Solo se permiten archivos .csv.' });
            return;
        }
        const file = acceptedFiles[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const { datos: datosValidados, error } = procesarYValidarCSV(text);

            if (error) {
                setModalState({ isOpen: true, type: 'error', title: 'Error en el Archivo', message: error });
                return;
            }

            setDatos(datosValidados);
            setNombreArchivo(file.name);
            setEsArchivoValido(true);
        };
        reader.onerror = () => {
            setModalState({ isOpen: true, type: 'error', title: 'Error de Lectura', message: 'Ocurrió un error crítico al leer el archivo.' });
        };
        reader.readAsText(file, 'UTF-8');
    }, [reset]);

    const handleSave = () => {
        if (!esArchivoValido || datos.length === 0) {
            setModalState({ isOpen: true, type: 'error', title: 'Acción no permitida', message: 'Se debe seleccionar un archivo CSV válido antes de continuar.' });
            return;
        }

        setModalState({
            isOpen: true,
            type: 'confirmation',
            title: 'Confirmar Registro',
            message: `¿Está seguro de que desea registrar a ${datos.length} competidores? Esta acción no se puede deshacer.`,
            onConfirm: () => {
                const competidoresIndividuales: CompetidorIndividualPayload[] = datos.map(fila => {
                    const { nombre, apellido } = separarNombreCompleto(fila.nombre);
                    const esGrupal = fila.tipodeinscripcion.toUpperCase() === 'GRUPAL';
                    return {
                        persona: {
                            nombre, apellido, ci: fila.ci, telefono: fila.telftutor,
                            fecha_nac: DEFAULT_FECHA_NAC, genero: DEFAULT_GENERO,
                            email: `${normalizarEncabezado(nombre)}.${fila.ci}@example.com`
                        },
                        competidor: {
                            grado_escolar: DEFAULT_GRADO_ESCOLAR, departamento: fila.departamento,
                            contacto_tutor: fila.telftutor, contacto_emergencia: fila.telftutor
                        },
                        institucion: {
                            nombre: fila.colegio, tipo: 'No especificado', departamento: fila.departamento,
                            direccion: 'No especificada', telefono: null
                        },
                        grupo: {
                            nombre: esGrupal ? `Grupo de ${fila.area}` : `Individual ${fila.ci}`,
                            descripcion: 'Inscripción desde archivo CSV', max_integrantes: esGrupal ? 5 : 1
                        },
                        area: { nombre: fila.area },
                        nivel: { nombre: fila.nivel }
                    };
                });

                const payload: InscripcionPayload = { competidores: competidoresIndividuales };
                mutate(payload);
            }
        });
    };

    const closeModal = () => setModalState(initialModalState);

    return {
        datos,
        nombreArchivo,
        esArchivoValido,
        isSubmitting: isPending,
        modalState,
        onDrop,
        handleSave,
        handleCancel: reset,
        closeModal,
    };
}