import { useState, useCallback, useEffect, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import type { ColumnDef } from '@tanstack/react-table';
import type { FileRejection } from 'react-dropzone';

import type {
  ApiErrorResponse,
  CompetidorCSV,
  InscripcionPayload,
  FilaProcesada,
} from '../types/indexInscritos';
import { importarCompetidoresAPI } from '../services/ApiInscripcion';
import { mapCSVRenglonToPayload } from '../utils/apiMapper';
import { areasService } from '../../areas/services/areasService';
import { nivelesService } from '../../niveles/services/nivelesService';
import {
  headerMapping,
  normalizarEncabezado,
  type ProcesamientoCSVResult,
} from '../utils/csvProcessor';

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
  const [invalidHeaders, setInvalidHeaders] = useState<string[]>([]);
  const workerRef = useRef<Worker | null>(null);
  const { data: areas = [], isLoading: isLoadingAreas } = useQuery({
    queryKey: ['areas'],
    queryFn: areasService.obtenerAreas,
  });
  const { data: niveles = [], isLoading: isLoadingNiveles } = useQuery({
    queryKey: ['niveles'],
    queryFn: nivelesService.obtenerNiveles,
  });

  const reset = useCallback(() => {
    setFilas([]);
    setNombreArchivo(null);
    setColumnasDinamicas([]);
    setInvalidHeaders([]);
  }, []);

  const { mutate, isPending } = useMutation<
    { message: string },
    AxiosError<ApiErrorResponse>,
    InscripcionPayload
  >({
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
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Ocurrió un error inesperado.';
      setModalState({
        isOpen: true,
        type: 'error',
        title: '¡Ups! Algo Salió Mal',
        message: errorMessage,
      });
    },
  });

  useEffect(() => {
    workerRef.current = new Worker(new URL('../utils/csv.worker.ts', import.meta.url), {
      type: 'module',
    });

    workerRef.current.onmessage = (
      e: MessageEvent<{ type: string; payload: ProcesamientoCSVResult | string }>
    ) => {
      const { type, payload } = e.data;
      setIsParsing(false);

      if (type === 'SUCCESS' && typeof payload !== 'string') {
        if (payload.errorGlobal) {
          setModalState({
            isOpen: true,
            type: 'error',
            title: 'Error Crítico en Archivo',
            message: payload.errorGlobal,
          });
          setNombreArchivo(null);
          setFilas([]);
          setColumnasDinamicas([]);
          setInvalidHeaders(payload.invalidHeaders || []);
        } else {
          const numeroDeFilaColumn: ColumnDef<FilaProcesada> = {
            header: 'Nº',
            cell: ({ row }) => row.original.datos.nro || row.original.numeroDeFila,
          };

          const columnasDesdeArchivo: ColumnDef<FilaProcesada>[] = payload.headers
            .filter((header) => {
              const normalized = normalizarEncabezado(header);
              return (
                normalized !== 'n' &&
                normalized !== 'no' &&
                normalized !== 'nro' &&
                normalized !== 'numero'
              );
            })
            .map((header) => {
              const key = headerMapping[normalizarEncabezado(header)];
              const accessorKey = key ? `datos.${key}` : `rawData.${header}`;
              return {
                header,
                accessorKey,
              };
            });

          setColumnasDinamicas([numeroDeFilaColumn, ...columnasDesdeArchivo]);
          setFilas(payload.filasProcesadas);
          setInvalidHeaders(payload.invalidHeaders || []);
        }
      } else {
        setModalState({
          isOpen: true,
          type: 'error',
          title: 'Error de Procesamiento',
          message: payload as string,
        });
        reset();
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, [reset]);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      reset();
      if (fileRejections.length > 0) {
        setModalState({
          isOpen: true,
          type: 'error',
          title: 'Archivo no válido',
          message: 'Formato no válido. Solo se permiten archivos .csv.',
        });
        return;
      }
      const file = acceptedFiles[0];
      if (!file) return;

      setIsParsing(true);
      setNombreArchivo(file.name);

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const nombresAreas = areas.map((a) => a.nombre);
        const nombresNiveles = niveles.map((n) => n.nombre);

        workerRef.current?.postMessage({
          csvText: text,
          areas: nombresAreas,
          niveles: nombresNiveles,
        });
      };
      reader.onerror = () => {
        setModalState({
          isOpen: true,
          type: 'error',
          title: 'Error de Lectura',
          message: 'No se pudo leer el archivo.',
        });
        setIsParsing(false);
      };
      reader.readAsText(file, 'UTF-8');
    },
    [reset, areas, niveles]
  );

  const handleSave = () => {
    if (invalidHeaders.length > 0) {
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Cabeceras no válidas',
        message: 'El archivo contiene columnas no reconocidas. Corríjalas antes de guardar.',
      });
      return;
    }

    const filasValidas = filas.filter((f) => f.esValida);
    if (filas.length === 0 || filasValidas.length === 0) {
      setModalState({
        isOpen: true,
        type: 'info',
        title: 'Sin datos',
        message: 'No hay filas válidas para guardar.',
      });
      return;
    }
    if (filasValidas.length !== filas.length) {
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Datos Inválidos',
        message: 'No se puede guardar porque hay filas con errores. Revise los datos marcados.',
      });
      return;
    }

    setModalState({
      isOpen: true,
      type: 'confirmation',
      title: 'Confirmar Registro',
      message: `¿Está seguro de que desea registrar a ${filasValidas.length} competidores?`,
      onConfirm: () => {
        const competidoresIndividuales = filasValidas.map((fila) =>
          mapCSVRenglonToPayload(fila.datos as CompetidorCSV)
        );
        const payload: InscripcionPayload = { competidores: competidoresIndividuales };
        mutate(payload);
      },
    });
  };

  const closeModal = () => setModalState(initialModalState);

  const esArchivoValido =
    filas.length > 0 && invalidHeaders.length === 0 && filas.every((f) => f.esValida);
  const isLoadingData = isLoadingAreas || isLoadingNiveles;

  return {
    datos: filas,
    nombreArchivo,
    esArchivoValido,
    isParsing,
    isLoadingData,
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
