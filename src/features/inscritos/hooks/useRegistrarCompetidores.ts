import { useState, useCallback } from 'react';
import Papa, { type ParseResult } from 'papaparse';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { AxiosError } from 'axios';
import type { ApiErrorResponse, CompetidorCSV, InscripcionPayload } from '../types/indexInscritos';
import { importarCompetidoresAPI } from '../services/ApiInscripcion';
import type { FileRejection } from 'react-dropzone';
import { separarNombreCompleto } from '../../responsables/hooks/useAsignarResponsable';

const normalizarEncabezado = (header: string): string => {
    return header.trim().toLowerCase().replace(/[\s.,;:]+/g, '');
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
            delimiter: ";",
            transformHeader: normalizarEncabezado,
            complete: (results: ParseResult<CompetidorCSV>) => {
                
                // MEJORA CLAVE: Filtrar filas donde todas las propiedades estén vacías o solo contengan espacios.
                const datosFiltrados = results.data.filter(fila => 
                    Object.values(fila).some(valor => typeof valor === 'string' && valor.trim() !== '')
                );

                if (datosFiltrados.length === 0) {
                    onError('El archivo CSV está vacío o no contiene datos válidos.');
                    return;
                }

                const encabezadosRecibidos = (results.meta.fields || []).filter(h => h.trim() !== '');
                const encabezadosFaltantes = ENCABEZADOS_REQUERIDOS.filter(h => !encabezadosRecibidos.includes(h));
                if (encabezadosFaltantes.length > 0) {
                    onError(`El archivo no es válido. Faltan las siguientes columnas: ${encabezadosFaltantes.join(', ')}`);
                    return;
                }
                
                const ciSet = new Set<string>();
                for (const fila of results.data) {
                    const validationResult = filaSchema.safeParse(fila);
                    if (!validationResult.success) {
                        const firstError = validationResult.error.issues[0];
                        onError(`Error en los datos del archivo: ${firstError.message} (Columna: ${firstError.path.join(', ')})`);
                        return;
                    }
                    if (ciSet.has(fila.ci)) {
                        onError(`El archivo contiene filas duplicadas. El CI "${fila.ci}" está repetido.`);
                        return;
                    }
                    ciSet.add(fila.ci);
                }

                setDatos(datosFiltrados);
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
            const esGrupal = fila.tipodeinscripcion.toLowerCase() === 'grupal';

            return {
                persona: {
                    nombre,
                    apellido,
                    ci: fila.ci,
                    telefono: fila.telftutor,
                    fecha_nac: '', 
                    genero: 'O', 
                    email: ''
                },
                competidor: {
                    grado_escolar: 'No especificado', 
                    departamento: fila.departamento,
                    contacto_tutor: fila.telftutor,
                    contacto_emergencia: '' 
                },
                institucion: {
                    nombre: fila.colegio,
                    departamento: fila.departamento,
                    tipo: '', 
                    direccion: '',
                    telefono: '' 
                },
                grupo: {
                    nombre: esGrupal ? `Grupo de ${fila.area}` : `Individual ${fila.ci}`,
                    descripcion: 'Inscripción desde archivo CSV'
                },
                max_integrantes: esGrupal ? 5 : 1, 
                area: { nombre: fila.area },
                nivel: { nombre: fila.nivel }
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