import React, { useState, useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import type { ColumnDef } from '@tanstack/react-table';
import type { ApiErrorResponse, CompetidorCSV, InscripcionPayload, FilaProcesada } from '../types/indexInscritos';
import { importarCompetidoresAPI } from '../services/ApiInscripcion';
import type { FileRejection } from 'react-dropzone';
import { mapCSVRenglonToPayload } from '../utils/apiMapper';
import { procesarYValidarCSV, headerMapping, normalizarEncabezado, requiredCSVKeys } from '../utils/csvProcessor';
import { areasService } from '../../areas/services/areasService';
import { nivelesService } from '../../niveles/services/nivelesService';

export type ModalState = {
    isOpen: boolean;
    title: string;
    message: React.ReactNode;
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
    const [invalidHeaders, setInvalidHeaders] = useState<string[]>([]);

    const { data: areasValidas = [], isLoading: isLoadingAreas } = useQuery({
        queryKey: ['areas'],
        queryFn: areasService.obtenerAreas,
    });
    const { data: nivelesValidos = [], isLoading: isLoadingNiveles } = useQuery({
        queryKey: ['niveles'],
        queryFn: nivelesService.obtenerNiveles,
    });

    const { mutate, isPending } = useMutation<{ message: string }, AxiosError<ApiErrorResponse>, InscripcionPayload>({
        mutationFn: importarCompetidoresAPI,
        onSuccess: (data) => {
            setModalState({ isOpen: true, type: 'success', title: '¡Registro Exitoso!', message: data.message || 'Los competidores se registraron correctamente.' });
            reset();
        },
        onError: (error) => {
            const errorMessage = error.response?.data?.message || error.response?.data?.error || "Ocurrió un error inesperado en el servidor.";
            setModalState({ isOpen: true, type: 'error', title: 'Error en el Servidor', message: errorMessage });
        },
    });

    const reset = useCallback(() => {
        setFilas([]);
        setNombreArchivo(null);
        setColumnasDinamicas([]);
        setInvalidHeaders([]);
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
            const { filasProcesadas, headers, errorGlobal, invalidHeaders: detectedInvalidHeaders } = procesarYValidarCSV(
                text,
                areasValidas.map(a => a.nombre),
                nivelesValidos.map(n => n.nombre)
            );

            if (errorGlobal) {
                setModalState({ isOpen: true, type: 'error', title: 'Error en el Archivo', message: errorGlobal });
                setIsParsing(false);
                return;
            }

            setInvalidHeaders(detectedInvalidHeaders);

            const nuevasColumnas: ColumnDef<FilaProcesada>[] = headers.map(header => {
                const key = headerMapping[normalizarEncabezado(header)];
                return {
                    id: key || header,
                    header: header,
                    accessorFn: (row) => key ? row.datos[key] : 'Columna Inválida',
                };
            });
            
            setColumnasDinamicas(nuevasColumnas);
            setFilas(filasProcesadas);
            setNombreArchivo(file.name);
            setIsParsing(false);
        };
        reader.readAsText(file, 'UTF-8');
    }, [reset, areasValidas, nivelesValidos]);
    
    const esArchivoValido = filas.length > 0 && filas.every(f => f.esValida) && invalidHeaders.length === 0;

    const handleSave = () => {
        if (invalidHeaders.length > 0) {
            const usedKeys = columnasDinamicas.map(c => c.id).filter(Boolean);
            const optionalHeaderKeys = Object.keys(headerMapping).map(k => headerMapping[k]).filter(v => !requiredCSVKeys.includes(v as keyof CompetidorCSV));
            const unusedOptionalKeys = [...new Set(optionalHeaderKeys)].filter(key => !usedKeys.includes(key));
            
            const suggestedColumns = unusedOptionalKeys.map(key => {
                const entry = Object.entries(headerMapping).find(([, val]) => val === key);
                const readable = entry ? entry[0].replace(/([A-Z])/g, ' $1') : key;
                return readable.charAt(0).toUpperCase() + readable.slice(1);
            });

            const message = (
                <div>
                    <p>El archivo contiene columnas no reconocidas: <strong className="font-semibold text-acento-700">"{invalidHeaders.join('", "')}"</strong>.</p>
                    <p className="mt-2">Corrija los nombres o elimine estas columnas.</p>
                    {suggestedColumns.length > 0 && (
                        <div className="mt-4 text-left bg-neutro-100 p-2 rounded">
                            <p className="font-semibold">Columnas opcionales que podría agregar:</p>
                            <ul className="list-disc list-inside text-sm">
                                {suggestedColumns.slice(0, 7).map(s => <li key={s}>{s}</li>)}
                                {suggestedColumns.length > 7 && <li>... y más.</li>}
                            </ul>
                        </div>
                    )}
                </div>
            );

            setModalState({ isOpen: true, type: 'error', title: 'Columnas no Válidas', message });
            return;
        }

        const filasValidas = filas.filter(f => f.esValida);
        if (filas.length === 0 || filasValidas.length === 0) {
            setModalState({ isOpen: true, type: 'info', title: 'Sin Datos Válidos', message: 'No hay filas válidas para guardar.' });
            return;
        }
        if (filasValidas.length !== filas.length) {
            setModalState({ isOpen: true, type: 'error', title: 'Datos Inválidos', message: 'Revise las filas marcadas en rojo.' });
            return;
        }

        setModalState({
            isOpen: true,
            type: 'confirmation',
            title: 'Confirmar Registro',
            message: `¿Está seguro de que desea registrar a ${filasValidas.length} competidores?`,
            onConfirm: () => {
                const competidoresIndividuales = filasValidas.map(fila => mapCSVRenglonToPayload(fila.datos as CompetidorCSV));
                mutate({ competidores: competidoresIndividuales });
            }
        });
    };

    const closeModal = () => {
        if (modalState.type === 'success' && modalState.onConfirm) {
            modalState.onConfirm();
        }
        setModalState(initialModalState);
    };

    return {
        datos: filas,
        nombreArchivo,
        esArchivoValido,
        isParsing: isParsing || isLoadingAreas || isLoadingNiveles,
        isSubmitting: isPending,
        modalState,
        onDrop,
        handleSave,
        handleCancel: reset,
        closeModal,
        columnasDinamicas,
        invalidHeaders,
    };
}