import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import type { ColumnDef } from '@tanstack/react-table';
import type { ApiErrorResponse, CompetidorCSV, InscripcionPayload, FilaProcesada } from '../types/indexInscritos';
import { importarCompetidoresAPI } from '../services/ApiInscripcion';
import type { FileRejection } from 'react-dropzone';
import { procesarYValidarCSV } from '../utils/csvProcessor';
import { mapCSVRenglonToPayload } from '../utils/apiMapper';

// Importamos las utilidades directamente para usarlas en el hook
import { headerMapping, normalizarEncabezado } from '../utils/csvProcessor';

export type ModalState = {
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'confirmation';
    onConfirm?: () => void;
};

const initialModalState: ModalState = { isOpen: false, title: '', message: '', type: 'info' };

export function useImportarCompetidores() {
    const [filas, setFilas] = useState<FilaProcesada[]>([]);
    const [isParsing, setIsParsing] = useState(false);
    const [nombreArchivo, setNombreArchivo] = useState<string | null>(null);
    const [modalState, setModalState] = useState<ModalState>(initialModalState);
    const [columnasDinamicas, setColumnasDinamicas] = useState<ColumnDef<FilaProcesada>[]>([]);

    const { mutate, isPending } = useMutation<{ message: string }, AxiosError<ApiErrorResponse>, InscripcionPayload>({
        mutationFn: importarCompetidoresAPI,
        onSuccess: (data) => {
            setModalState({
                isOpen: true,
                type: 'success',
                title: '¡Registro Exitoso!',
                message: data.message || 'Los competidores han sido registrados correctamente.',
            });
            reset();
        },
        onError: (error) => {
            const errorMessage = error.response?.data?.message || error.response?.data?.error || "Ocurrió un error inesperado.";
            setModalState({
                isOpen: true,
                type: 'error',
                title: '¡Ups! Algo Salió Mal',
                message: errorMessage,
            });
        },
    });

    const reset = useCallback(() => {
        setFilas([]);
        setNombreArchivo(null);
        setColumnasDinamicas([]);
    }, []);

    const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
        reset();
        if (fileRejections.length > 0) {
            setModalState({ isOpen: true, type: 'error', title: 'Archivo no válido', message: 'Formato no válido. Solo se permiten archivos .csv.' });
            return;
        }
        const file = acceptedFiles[0];
        if (!file) return;

        setIsParsing(true);
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const { filasProcesadas, headers: cabecerasDetectadas, errorGlobal } = procesarYValidarCSV(text);

            if (errorGlobal) {
                setModalState({ isOpen: true, type: 'error', title: 'Error en el Archivo', message: errorGlobal });
                setIsParsing(false);
                return;
            }

            // --- LÓGICA DE CREACIÓN DE COLUMNAS CORREGIDA Y SIMPLIFICADA ---
            const nuevasColumnas: ColumnDef<FilaProcesada>[] = cabecerasDetectadas.map(header => {
                const normalizedHeader = normalizarEncabezado(header);
                const key = headerMapping[normalizedHeader]; // Búsqueda directa y correcta

                return {
                    // La propiedad `header` es lo que se mostrará en la cabecera.
                    header: header,
                    // `accessorKey` le dice a la tabla cómo obtener el dato de la fila.
                    accessorKey: `datos.${key}`,
                };
            }).filter(col => col.accessorKey && !col.accessorKey.endsWith('undefined'));
            
            setColumnasDinamicas(nuevasColumnas);
            setFilas(filasProcesadas);
            setNombreArchivo(file.name);
            setIsParsing(false);
        };
        reader.onerror = () => {
            setModalState({ isOpen: true, type: 'error', title: 'Error de Lectura', message: 'Ocurrió un error al leer el archivo.' });
            setIsParsing(false);
        };
        reader.readAsText(file, 'UTF-8');
    }, [reset]);
    
    const esArchivoValido = filas.length > 0 && filas.every(f => f.esValida);

    const handleSave = () => {
        const filasValidas = filas.filter(f => f.esValida);
        if (filas.length === 0 || filasValidas.length === 0) {
             setModalState({ isOpen: true, type: 'info', title: 'Sin datos', message: 'No hay filas válidas para guardar.' });
            return;
        }
        if (filasValidas.length !== filas.length) {
            setModalState({ isOpen: true, type: 'error', title: 'Datos Inválidos', message: 'No se puede guardar porque hay filas con errores.' });
            return;
        }

        setModalState({
            isOpen: true,
            type: 'confirmation',
            title: 'Confirmar Registro',
            message: `¿Está seguro de que desea registrar a ${filasValidas.length} competidores?`,
            onConfirm: () => {
                const competidoresIndividuales = filasValidas.map(fila => mapCSVRenglonToPayload(fila.datos as CompetidorCSV));
                const payload: InscripcionPayload = { competidores: competidoresIndividuales };
                mutate(payload);
            }
        });
    };

    const closeModal = () => setModalState(initialModalState);

    return {
        datos: filas,
        nombreArchivo,
        esArchivoValido,
        isParsing,
        isSubmitting: isPending,
        modalState,
        onDrop,
        handleSave,
        handleCancel: reset,
        closeModal,
        columnasDinamicas,
    };
}