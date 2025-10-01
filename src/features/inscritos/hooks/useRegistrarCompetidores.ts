import { useState, useCallback } from 'react';
import Papa from 'papaparse';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { AxiosError } from 'axios';
import type { ApiErrorResponse, CompetidorCSV, InscripcionPayload, CompetidorIndividualPayload } from '../types/indexInscritos';
import { importarCompetidoresAPI } from '../services/ApiInscripcion';
import type { FileRejection } from 'react-dropzone';
import { separarNombreCompleto } from '../../responsables/utils/responsableUtils';

// --- NUEVO: Definición del estado del modal ---
export type ModalState = {
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'info';
};

const initialModalState: ModalState = { isOpen: false, title: '', message: '', type: 'info' };

// ... (El resto de las constantes y esquemas permanecen igual) ...
const normalizarEncabezado = (header: string): string => header.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
const ENCABEZADOS_REQUERIDOS = ['nombre', 'ci', 'telftutor', 'colegio', 'departamento', 'nivel', 'area', 'tipodeinscripcion'];
const filaSchema = z.object({
    nombre: z.string().min(1, 'El nombre no puede estar vacío.'),
    ci: z.string().min(1, 'El CI no puede estar vacío.'),
    telftutor: z.string().min(1, 'El teléfono del tutor no puede estar vacío.'),
    colegio: z.string().min(1, 'El colegio no puede estar vacío.'),
    departamento: z.string().min(1, 'El departamento no puede estar vacío.'),
    nivel: z.string().min(1, 'El nivel no puede estar vacío.'),
    area: z.string().min(1, 'El área no puede estar vacía.'),
    tipodeinscripcion: z.string().min(1, 'El tipo de inscripción no puede estar vacío.'),
});
const DEFAULT_FECHA_NAC = '2000-01-01';
const DEFAULT_GENERO = null;
const DEFAULT_GRADO_ESCOLAR = 'No especificado';

const procesarYValidarCSV = (textoCsv: string): { datos: CompetidorCSV[], error: string | null } => {
    // ... (La lógica de esta función no cambia)
    if (textoCsv.charCodeAt(0) === 0xFEFF) {
        textoCsv = textoCsv.substring(1);
    }
    
    const lines = textoCsv.trim().split(/\r\n|\n/);
    const headerLine = lines.shift() || '';
    const dataString = lines.join('\n');

    const headersRaw = headerLine.split(';').map(h => h.trim()).filter(Boolean);
    const headersSanitizados = headersRaw.map(normalizarEncabezado);
    
    const encabezadosRequeridosSet = new Set(ENCABEZADOS_REQUERIDOS);
    const encabezadosEncontradosSet = new Set(headersSanitizados);

    const encabezadosFaltantes = ENCABEZADOS_REQUERIDOS.filter(h => !encabezadosEncontradosSet.has(h));
    const encabezadosNoReconocidos = headersRaw.filter(h => !encabezadosRequeridosSet.has(normalizarEncabezado(h)));

    if (encabezadosFaltantes.length > 0) {
        let mensajeError = "Formato de Encabezados Incorrecto.\nRevisa los encabezados de las columnas en la primera fila.\n\n";
        if (encabezadosNoReconocidos.length > 0) {
            mensajeError += `Columnas no reconocidas: ${encabezadosNoReconocidos.join(', ')}\n`;
        }
        mensajeError += `Columnas obligatorias faltantes: ${encabezadosFaltantes.join(', ')}\n\n`;
        mensajeError += `Recordatorio: La primera fila debe contener exactamente estos encabezados:\n${ENCABEZADOS_REQUERIDOS.join(';')}`;
        return { datos: [], error: mensajeError };
    }
    
    if (encabezadosNoReconocidos.length > 0) {
        let mensajeError = "Columnas Adicionales Detectadas.\nEl archivo no se cargó porque contiene columnas no permitidas.\n\n";
        mensajeError += `Por favor, elimine las siguientes columnas y vuelva a intentarlo: ${encabezadosNoReconocidos.join(', ')}\n\n`;
        mensajeError += `Recordatorio: El archivo solo debe contener estas columnas:\n${ENCABEZADOS_REQUERIDOS.join(';')}`;
        return { datos: [], error: mensajeError };
    }

    const parseResult = Papa.parse<string[]>(dataString, { header: false, skipEmptyLines: false, delimiter: ";", transform: (value) => value.trim() });
    const datosComoObjetos = parseResult.data.map((rowArray: string[]) => {
        const rowObject: { [key: string]: string } = {};
        headersSanitizados.forEach((header, index) => { rowObject[header] = rowArray[index] || ''; });
        return rowObject as CompetidorCSV;
    });

    const datosValidados = [];
    const ciSet = new Set<string>();

    for (let i = 0; i < datosComoObjetos.length; i++) {
        const fila = datosComoObjetos[i];
        const numeroDeFila = i + 2; // +1 por el índice base 0, +1 por la fila de encabezado

        // Ignorar filas completamente vacías
        if (Object.values(fila).every(val => val === '')) {
            continue;
        }

        const validationResult = filaSchema.safeParse(fila);
        if (!validationResult.success) {
            const firstError = validationResult.error.issues[0];
            const mensaje = `Error en la fila ${numeroDeFila}: El campo '${firstError.path.join(', ')}' no puede estar vacío.`;
            return { datos: [], error: `Datos Incompletos en el Archivo.\n\n${mensaje}` };
        }

        if (ciSet.has(fila.ci)) {
            return { datos: [], error: `El archivo contiene filas duplicadas. El CI "${fila.ci}" está repetido en la fila ${numeroDeFila}.` };
        }
        ciSet.add(fila.ci);
        datosValidados.push(fila);
    }
    
    if (datosValidados.length === 0) {
        return { datos: [], error: 'El archivo CSV está vacío o no contiene datos válidos.' };
    }

    return { datos: datosValidados, error: null };
};

export function useImportarCompetidores() {
    const [datos, setDatos] = useState<CompetidorCSV[]>([]);
    const [nombreArchivo, setNombreArchivo] = useState<string | null>(null);
    const [esArchivoValido, setEsArchivoValido] = useState(false);
    // --- NUEVO: Estado para el modal ---
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
        // ... (La lógica de esta función no cambia)
        if (!esArchivoValido || datos.length === 0) {
            setModalState({ isOpen: true, type: 'error', title: 'Acción no permitida', message: 'Se debe seleccionar un archivo CSV válido antes de continuar.' });
            return;
        }

        const competidoresIndividuales: CompetidorIndividualPayload[] = datos.map(fila => {
            const { nombre, apellido } = separarNombreCompleto(fila.nombre);
            const esGrupal = fila.tipodeinscripcion.toLowerCase() === 'grupal';
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
    };

    const closeModal = () => setModalState(initialModalState);

    return {
        datos,
        nombreArchivo,
        esArchivoValido,
        isSubmitting: isPending,
        modalState, // <-- Exportamos el estado del modal
        onDrop,
        handleSave,
        handleCancel: reset,
        closeModal, // <-- Exportamos la función para cerrar el modal
    };
}