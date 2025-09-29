import { useState, useCallback } from 'react';
import Papa from 'papaparse';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { AxiosError } from 'axios';
import type { ApiErrorResponse, CompetidorCSV, InscripcionPayload, CompetidorIndividualPayload } from '../types/indexInscritos';
import { importarCompetidoresAPI } from '../services/ApiInscripcion';
import type { FileRejection } from 'react-dropzone';
import { separarNombreCompleto } from '../../responsables/hooks/useAsignarResponsable';

// Tipo para la respuesta exitosa de la API
type ApiResponse = {
    message: string;
};

// --- VALORES POR DEFECTO CONFIGURABLES ---
// Estos valores cumplen con las reglas de validación del backend.
const DEFAULT_FECHA_NAC = '2000-01-01'; // Formato YYYY-MM-DD
const DEFAULT_GENERO = null; // Se envía null ya que 'O' no es válido y es opcional
const DEFAULT_GRADO_ESCOLAR = 'No especificado';

const normalizarEncabezado = (header: string): string => {
    return header.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
};

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

export function useImportarCompetidores({ onSuccess, onError }: { onSuccess: (msg: string) => void; onError: (msg: string) => void; }) {
    const [datos, setDatos] = useState<CompetidorCSV[]>([]);
    const [nombreArchivo, setNombreArchivo] = useState<string | null>(null);
    const [esArchivoValido, setEsArchivoValido] = useState(false);

    const { mutate, isPending } = useMutation({
        mutationFn: (payload: InscripcionPayload) => importarCompetidoresAPI(payload),
        onSuccess: (response: ApiResponse) => {
            onSuccess(response.message || 'Lista de competidores registrada con éxito.');
            reset();
        },
        onError: (error: AxiosError<ApiErrorResponse>) => {
            // Manejo de errores de validación más específico desde el backend.
            if (error.response?.data?.errors) {
                const errors = error.response.data.errors;
                const firstErrorKey = Object.keys(errors)[0];
                const firstErrorMessage = errors[firstErrorKey][0];
                onError(`Error de validación: ${firstErrorMessage}`);
            } else {
                const errorMessage = error.response?.data?.message || 'Error al registrar. Por favor, intente de nuevo.';
                onError(errorMessage);
            }
        },
    });

    const reset = useCallback(() => {
        setDatos([]);
        setNombreArchivo(null);
        setEsArchivoValido(false);
    }, []);

    const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
        reset();
        if (fileRejections.length > 0) { onError('Formato no válido. Solo se permiten archivos .csv.'); return; }
        const file = acceptedFiles[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            let text = e.target?.result as string;
            if (!text) { onError('No se pudo leer el contenido del archivo.'); return; }
            if (text.charCodeAt(0) === 0xFEFF) { text = text.substring(1); }
            
            const lines = text.trim().split(/\r\n|\n/);
            const headerLine = lines.shift() || '';
            const dataString = lines.join('\n');
            const headersRaw = headerLine.split(';');
            const headersSanitizados = headersRaw.map(h => normalizarEncabezado(h)).filter(Boolean);

            const encabezadosFaltantes = ENCABEZADOS_REQUERIDOS.filter(h => !headersSanitizados.includes(h));
            if (encabezadosFaltantes.length > 0) { onError(`El archivo no es válido. Faltan las siguientes columnas: ${encabezadosFaltantes.join(', ')}`); return; }

            const parseResult = Papa.parse<string[]>(dataString, { header: false, skipEmptyLines: true, delimiter: ";", transform: (value) => value.trim() });
            const datosComoObjetos = parseResult.data.map((rowArray: string[]) => { const rowObject: { [key: string]: string } = {}; headersSanitizados.forEach((header, index) => { rowObject[header] = rowArray[index]; }); return rowObject as CompetidorCSV; });
            const datosFiltrados = datosComoObjetos.filter((fila: CompetidorCSV) => fila.nombre && fila.nombre.trim() !== '');

            if (datosFiltrados.length === 0) { onError('El archivo CSV está vacío o no contiene datos válidos.'); return; }
            
            const ciSet = new Set<string>();
            for (const fila of datosFiltrados) {
                const validationResult = filaSchema.safeParse(fila);
                if (!validationResult.success) { const firstError = validationResult.error.issues[0]; onError(`Error en los datos del archivo: ${firstError.message} (Columna: ${firstError.path.join(', ')})`); return; }
                if (ciSet.has(fila.ci)) { onError(`El archivo contiene filas duplicadas. El CI "${fila.ci}" está repetido.`); return; }
                ciSet.add(fila.ci);
            }

            setDatos(datosFiltrados);
            setNombreArchivo(file.name);
            setEsArchivoValido(true);
        };
        reader.onerror = () => { onError('Ocurrió un error crítico al leer el archivo.'); };
        reader.readAsText(file, 'UTF-8');
    }, [reset, onError]);

    const handleSave = () => {
        if (!esArchivoValido || datos.length === 0) {
            onError('Se debe seleccionar un archivo CSV válido antes de continuar.');
            return;
        }

        const competidoresIndividuales: CompetidorIndividualPayload[] = datos.map(fila => {
            const { nombre, apellido } = separarNombreCompleto(fila.nombre);
            const esGrupal = fila.tipodeinscripcion.toLowerCase() === 'grupal';

            return {
                persona: {
                    nombre,
                    apellido,
                    ci: fila.ci,
                    telefono: fila.telftutor,
                    // SOLUCIÓN: Usar valores por defecto que cumplen con las reglas del backend
                    fecha_nac: DEFAULT_FECHA_NAC,
                    genero: DEFAULT_GENERO, 
                    email: `${normalizarEncabezado(nombre)}.${fila.ci}@example.com`
                },
                competidor: {
                    grado_escolar: DEFAULT_GRADO_ESCOLAR,
                    departamento: fila.departamento,
                    contacto_tutor: fila.telftutor,
                    contacto_emergencia: fila.telftutor
                },
                institucion: {
                    nombre: fila.colegio,
                    tipo: 'No especificado',
                    departamento: fila.departamento,
                    direccion: 'No especificada',
                    telefono: null // Se envía null para campos únicos opcionales
                },
                grupo: {
                    nombre: esGrupal ? `Grupo de ${fila.area}` : `Individual ${fila.ci}`,
                    descripcion: 'Inscripción desde archivo CSV',
                    max_integrantes: esGrupal ? 5 : 1
                },
                area: { nombre: fila.area },
                nivel: { nombre: fila.nivel }
            };
        });

        const payload: InscripcionPayload = {
            competidores: competidoresIndividuales
        };
        
        console.log("Payload final a enviar a la API:", payload);
        mutate(payload);
    };

    return {
        datos,
        nombreArchivo,
        esArchivoValido,
        isSubmitting: isPending,
        onDrop,
        handleSave,
        handleCancel: reset,
    };
}