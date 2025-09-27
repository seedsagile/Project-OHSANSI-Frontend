import { useState, useCallback } from 'react';
import Papa, { type ParseResult } from 'papaparse';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { AxiosError } from 'axios';
import type { ApiErrorResponse, CompetidorCSV, InscripcionPayload } from '../types/indexInscritos';
import { importarCompetidoresAPI } from '../services/ApiInscripcion';
import type { FileRejection } from 'react-dropzone';
import { separarNombreCompleto } from '../../responsables/hooks/useAsignarResponsable';


const ENCABEZADOS_REQUERIDOS = ['nombre', 'ci', 'telftutor', 'colegio', 'departamento', 'grado', 'nivel', 'area'];


const filaSchema = z.object({
    nombre: z.string().min(1, 'El nombre no puede estar vacío.'),
    ci: z.string().min(1, 'El CI no puede estar vacío.'),
});

export function useImportarCompetidores({ onSuccess, onError }: { onSuccess: (msg: string) => void; onError: (msg: string) => void; }) {
    const [datos, setDatos] = useState<CompetidorCSV[]>([]);
    const [nombreArchivo, setNombreArchivo] = useState<string | null>(null);
    const [esArchivoValido, setEsArchivoValido] = useState(false);

    const { mutate, isPending } = useMutation({
        mutationFn: importarCompetidoresAPI,
        onSuccess: () => {
            onSuccess('Lista de competidores registrada con éxito.');
            reset();
        },

        onError: (error: AxiosError<ApiErrorResponse>) => {
            const errorMessage = error.response?.data?.error || 'Error al registrar. Por favor, intente de nuevo.';
            onError(errorMessage);
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
            onError('Formato no válido. Solo se permiten archivos .csv.');
            return;
        }

        const file = acceptedFiles[0];
        if (!file) return;

        Papa.parse<CompetidorCSV>(file, {
            header: true,
            skipEmptyLines: true,
            transformHeader: header => header.trim().toLowerCase().replace(/\s+/g, ''),
            complete: (results: ParseResult<CompetidorCSV>) => {
                if (!results.data || results.data.length === 0) {
                    onError('El archivo CSV está vacío o no contiene datos válidos.');
                    return;
                }

                const encabezadosRecibidos = results.meta.fields || [];
                const encabezadosFaltantes = ENCABEZADOS_REQUERIDOS.filter(h => !encabezadosRecibidos.includes(h));
                if (encabezadosFaltantes.length > 0) {
                    onError(`El archivo no es válido. Faltan las siguientes columnas: ${encabezadosFaltantes.join(', ')}`);
                    return;
                }
                
                const ciSet = new Set<string>();
                for (const fila of results.data) {
                    if (!filaSchema.safeParse(fila).success) {
                        onError(`El archivo contiene datos incompletos. Por favor, revise que todas las filas tengan nombre y CI.`);
                        return;
                    }
                    if (ciSet.has(fila.ci)) {
                        onError(`El archivo contiene filas duplicadas. El CI "${fila.ci}" está repetido.`);
                        return;
                    }
                    ciSet.add(fila.ci);
                }

                setDatos(results.data);
                setNombreArchivo(file.name);
                setEsArchivoValido(true);
            },
            error: () => onError('Ocurrió un error crítico al leer el archivo. Verifique su formato.'),
        });
    }, [reset, onError]);

    const handleSave = () => {
        if (!esArchivoValido || datos.length === 0) {
            onError('Se debe seleccionar un archivo CSV válido antes de continuar.');
            return;
        }

        const payloads: InscripcionPayload[] = datos.map(fila => {
            const { nombre, apellido } = separarNombreCompleto(fila.nombre);
            return {
                persona: {
                    nombre, apellido, ci: fila.ci, telefono: fila.telftutor,
                    fecha_nac: '2005-01-01', genero: 'O',
                    email: `${nombre.replace(/\s/g, '.').toLowerCase()}.${apellido.split(' ')[0].toLowerCase()}@example.com`,
                },
                competidor: {
                    grado_escolar: fila.grado, departamento: fila.departamento,
                    contacto_tutor: fila.telftutor, contacto_emergencia: fila.telftutor,
                },
                institucion: {
                    nombre: fila.colegio, departamento: fila.departamento,
                    tipo: 'No especificado', direccion: 'No especificada', telefono: '00000000',
                },
                grupo: { nombre: 'Inscripción Masiva', descripcion: 'Inscripción desde archivo CSV' },
                max_integrantes: 1,
                area: { nombre: fila.area },
                nivel: { nombre: fila.nivel },
            };
        });

        mutate(payloads);
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