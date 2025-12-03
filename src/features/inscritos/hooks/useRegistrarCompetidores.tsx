import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import type { ColumnDef } from '@tanstack/react-table';
import type { FileRejection } from 'react-dropzone';
import type {
  ApiErrorResponse,
  CompetidorCSV,
  InscripcionPayload,
  FilaProcesada,
  ApiResponseAreas,
  CompetidorIndividualPayloadAPI,
  ImportacionResponse
} from '../types/indexInscritos';
import { importarCompetidoresAPI, obtenerAreasConNivelesAPI } from '../services/ApiInscripcion';
import { mapCSVRenglonToPayload } from '../utils/apiMapper';
import {
  headerMapping,
  normalizarEncabezado,
  type ProcesamientoCSVResult,
  reverseHeaderMapping
} from '../utils/csvProcessor';

export { reverseHeaderMapping };

export type ModalState = {
  isOpen: boolean;
  title: string;
  message: string | React.ReactNode;
  type: 'success' | 'error' | 'info' | 'confirmation' | 'warning'; 
  onConfirm?: () => void;
};

const initialModalState: ModalState = { isOpen: false, title: '', message: '', type: 'info' };
const GESTION_ACTUAL_FALLBACK = "2025";

export function useImportarCompetidores() {
  const [filas, setFilas] = useState<FilaProcesada[]>([]);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [nombreArchivo, setNombreArchivo] = useState<string | null>(null);
  const [modalState, setModalState] = useState<ModalState>(initialModalState);
  const [columnasDinamicas, setColumnasDinamicas] = useState<ColumnDef<FilaProcesada>[]>([]);
  const [invalidHeaders, setInvalidHeaders] = useState<string[]>([]);
  const [gestionActual, setGestionActual] = useState<string | null>(null);

  const workerRef = useRef<Worker | null>(null);
  const modalTimerRef = useRef<number | undefined>(undefined);

  const { data: apiResponseAreas, isLoading: isLoadingData } = useQuery({
    queryKey: ['areasConNiveles'],
    queryFn: obtenerAreasConNivelesAPI,
    select: (data: ApiResponseAreas) => ({
        areasConNiveles: data.data || [],
        gestion: data.olimpiada_actual || GESTION_ACTUAL_FALLBACK
    })
  });

  const areasConNiveles = useMemo(() => apiResponseAreas?.areasConNiveles || [], [apiResponseAreas]);

  useEffect(() => {
    if (apiResponseAreas?.gestion) {
        setGestionActual(apiResponseAreas.gestion);
    } else if (!isLoadingData) {
        setGestionActual(GESTION_ACTUAL_FALLBACK);
    }
  }, [apiResponseAreas, isLoadingData]);

  const reset = useCallback(() => {
    setFilas([]);
    setNombreArchivo(null);
    setColumnasDinamicas([]);
    setInvalidHeaders([]);
  }, []);

  const closeModal = useCallback(() => {
    setModalState(initialModalState);
    clearTimeout(modalTimerRef.current);
  }, []);

  const { mutate, isPending: isSubmitting } = useMutation<
    ImportacionResponse,
    AxiosError<ApiErrorResponse>,
    { gestion: string; payload: InscripcionPayload }
  >({
    mutationFn: ({ gestion, payload }) => importarCompetidoresAPI(gestion, payload),
    onSuccess: (data) => {
      const { resumen } = data.data;
      const duplicados = data.detalles_duplicados || [];
      
      let tipoModal: ModalState['type'] = 'success';
      let tituloModal = '¡Proceso Finalizado!';
      
      if (resumen.total_registrados === 0 && resumen.total_duplicados > 0) {
        tipoModal = 'warning';
        tituloModal = 'Atención: No se registraron nuevos competidores';
      } else if (resumen.total_errores > 0) {
        tipoModal = 'info';
      }

      const mensajeResumen = (
        <div className="text-left space-y-3">
          <p className="font-medium text-center mb-2 text-lg">{data.message}</p>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm space-y-2 shadow-sm">
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-600">Total Procesados:</span>
              <span className="font-bold text-gray-900">{resumen.total_procesados}</span>
            </div>
            <div className="flex justify-between text-green-700 font-medium">
              <span>✅ Registrados Exitosamente:</span>
              <span className="font-bold">{resumen.total_registrados}</span>
            </div>
            {resumen.total_duplicados > 0 && (
              <div className="flex justify-between text-amber-600 font-medium">
                <span>⚠️ Duplicados (Omitidos):</span>
                <span className="font-bold">{resumen.total_duplicados}</span>
              </div>
            )}
            {resumen.total_errores > 0 && (
              <div className="flex justify-between text-red-600 font-medium">
                <span>❌ Errores de Servidor:</span>
                <span className="font-bold">{resumen.total_errores}</span>
              </div>
            )}
          </div>

          {duplicados.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-bold text-gray-500 uppercase mb-2 tracking-wide">
                Detalle de Duplicados ({duplicados.length}):
              </p>
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md bg-white scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-50">
                <ul className="divide-y divide-gray-100">
                  {duplicados.map((d, idx) => (
                    <li key={idx} className="px-3 py-2 text-xs hover:bg-gray-50">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:gap-2">
                        <span className="font-bold text-gray-700">{d.ci}</span>
                        <span className="text-gray-600 truncate">{d.nombre_completo}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 italic block mt-0.5">
                        {d.motivo}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      );

      setModalState({
        isOpen: true,
        type: tipoModal,
        title: tituloModal,
        message: mensajeResumen,
      });

      if (resumen.total_registrados > 0 && resumen.total_errores === 0 && resumen.total_duplicados === 0) {
        modalTimerRef.current = window.setTimeout(closeModal, 3000);
      }
      
      reset();
    },
    onError: (error) => {
        let errorMessage = 'Ocurrió un error inesperado al guardar.';
        const errorData = error.response?.data;

        if (errorData) {
            if (errorData.errors && typeof errorData.errors === 'object') {
                const formattedErrors = Object.entries(errorData.errors)
                    .map(([key, messages]) => {
                        const match = key.match(/competidores\.(\d+)\.(.+)/);
                        if (match && filas.length > 0) {
                            const index = parseInt(match[1], 10);
                            const fieldPath = match[2].replace(/\./g, ' -> ');
                            const filaAfectada = filas[index];
                            const ci = filaAfectada?.datos?.ci || `Fila ${filaAfectada?.numeroDeFila || index + 1}`;
                            return `• Competidor (${ci}), Campo '${fieldPath}': ${(messages as string[]).join(', ')}`;
                        }
                        return `• ${key}: ${(messages as string[]).join(', ')}`;
                    })
                    .join('\n');
                
                if (formattedErrors) {
                  errorMessage = "Se encontraron errores de validación en el servidor:\n" + formattedErrors;
                } else if (errorData.message) {
                  errorMessage = errorData.message;
                }

            } else if (errorData.message) {
                errorMessage = errorData.message;
            }
        } else if (error.request) {
            errorMessage = 'No se recibió respuesta del servidor. Verifique la conexión.';
        } else {
            errorMessage = error.message;
        }

        setModalState({
            isOpen: true,
            type: 'error',
            title: 'Error en el Registro',
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
            isOpen: true, type: 'error', title: 'Error Crítico en Archivo', message: payload.errorGlobal,
          });
          setNombreArchivo(null); setFilas([]); setColumnasDinamicas([]);
          setInvalidHeaders(payload.invalidHeaders || []);
        } else {
          const numeroDeFilaColumn: ColumnDef<FilaProcesada> = {
            id: 'numeroDeFila',
            header: 'Nº',
            cell: ({ row }) => row.original.datos.nro || row.original.numeroDeFila,
            size: 60,
          };

          const columnasDesdeArchivo: ColumnDef<FilaProcesada>[] = payload.headers
            .filter((header) => {
              const normalized = normalizarEncabezado(header);
              return normalized !== 'n' && normalized !== 'no' && normalized !== 'nro' && normalized !== 'numero';
            })
            .map((header) => {
              const normalizedHeader = normalizarEncabezado(header);
              const key = headerMapping[normalizedHeader];
              const accessorKey = key ? `datos.${key}` : `rawData.${header}`;
              return {
                id: header,
                header,
                accessorKey,
              };
            });

          setColumnasDinamicas([numeroDeFilaColumn, ...columnasDesdeArchivo]);
          setFilas(payload.filasProcesadas);
          setInvalidHeaders(payload.invalidHeaders || []);
        }
      } else if (type === 'ERROR') {
        setModalState({ isOpen: true, type: 'error', title: 'Error de Procesamiento', message: payload as string });
        reset();
      }
    };

    return () => {
      workerRef.current?.terminate();
      clearTimeout(modalTimerRef.current);
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
            message: 'Archivo no válido- Formato no válido. Sólo se permiten archivos .csv'
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
        if (workerRef.current) {
            workerRef.current.postMessage({
                csvText: text,
                areasConNiveles: areasConNiveles,
            });
        } else {
            console.error("Worker no inicializado.");
            setIsParsing(false);
        }
      };
      reader.onerror = () => {
        setModalState({ isOpen: true, type: 'error', title: 'Error de Lectura', message: 'No se pudo leer el archivo.' });
        setIsParsing(false);
      };
      reader.readAsText(file, 'UTF-8');
    },
    [reset, areasConNiveles]
  );

  const handleSave = () => {
    if (!gestionActual || !nombreArchivo) return;
    
    if (invalidHeaders.length > 0) {
      setModalState({ isOpen: true, type: 'error', title: 'Cabeceras no válidas', message: 'El archivo contiene columnas no reconocidas.' });
      return;
    }
    
    const filasValidas = filas.filter((f) => f.esValida);
    
    if (filas.length === 0) {
      setModalState({ isOpen: true, type: 'info', title: 'Sin datos', message: 'El archivo .csv no contiene datos de los competidores.' });
      return;
    }

    if (filasValidas.length === 0) {
      setModalState({ isOpen: true, type: 'info', title: 'Sin datos válidos', message: 'No hay filas válidas para guardar.' });
      return;
    }

    if (filasValidas.length !== filas.length) {
      setModalState({ isOpen: true, type: 'error', title: 'Datos Inválidos', message: 'No se puede guardar porque hay filas con errores.' });
      return;
    }

    setModalState({
      isOpen: true,
      type: 'confirmation',
      title: 'Confirmar registro',
      message: `Confirmar registro- ¿Está seguro que desea registrar a ${filasValidas.length} competidores?`,
      onConfirm: () => {
        const competidoresIndividuales = filasValidas.map((fila) =>
          mapCSVRenglonToPayload(fila.datos as CompetidorCSV) as CompetidorIndividualPayloadAPI
        );
        const payload: InscripcionPayload = {
          nombre_archivo: nombreArchivo,
          competidores: competidoresIndividuales,
        };
        mutate({ gestion: gestionActual, payload });
      },
    });
  };

  const esArchivoValido = useMemo(() =>
    filas.length > 0 && invalidHeaders.length === 0 && filas.every((f) => f.esValida),
    [filas, invalidHeaders]
  );

  return {
    datos: filas,
    nombreArchivo,
    esArchivoValido,
    isParsing,
    isLoadingData,
    isSubmitting,
    modalState,
    columnasDinamicas,
    invalidHeaders,
    gestionActual,
    onDrop,
    handleSave,
    handleCancel: reset,
    closeModal,
  };
}