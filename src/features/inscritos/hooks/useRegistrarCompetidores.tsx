import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import type { ColumnDef } from '@tanstack/react-table';
import type { FileRejection } from 'react-dropzone';

// Importar los tipos API específicos y los tipos internos
import type {
  ApiErrorResponse,
  CompetidorCSV,
  InscripcionPayload, // Este es el tipo renombrado InscripcionPayloadAPI
  FilaProcesada,
  ApiResponseAreas,
  CompetidorIndividualPayloadAPI // Tipo específico mapeado para la API
} from '../types/indexInscritos'; //
import { importarCompetidoresAPI, obtenerAreasConNivelesAPI } from '../services/ApiInscripcion'; //
import { mapCSVRenglonToPayload } from '../utils/apiMapper'; //
import {
  headerMapping,
  normalizarEncabezado,
  type ProcesamientoCSVResult,
  reverseHeaderMapping // Asegúrate que se exporte si se usa en TablaResultados
} from '../utils/csvProcessor'; //

// Exportar reverseHeaderMapping si es necesario en otro lugar (ej. TablaResultados)
export { reverseHeaderMapping };

// Definición del estado del Modal
export type ModalState = {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'confirmation';
  onConfirm?: () => void;
};

// Estado inicial del Modal
const initialModalState: ModalState = { isOpen: false, title: '', message: '', type: 'info' };
// Fallback para la gestión actual si la API no la devuelve
const GESTION_ACTUAL_FALLBACK = "2025"; // Considerar obtener esto de forma más dinámica

/**
 * Hook personalizado para gestionar la lógica de importación de competidores desde CSV.
 */
export function useImportarCompetidores() {
  // --- Estados Locales ---
  const [filas, setFilas] = useState<FilaProcesada[]>([]); // Datos procesados del CSV
  const [isParsing, setIsParsing] = useState<boolean>(false); // Indicador de parseo del CSV
  const [nombreArchivo, setNombreArchivo] = useState<string | null>(null); // Nombre del archivo cargado
  const [modalState, setModalState] = useState<ModalState>(initialModalState); // Estado del modal de feedback/confirmación
  const [columnasDinamicas, setColumnasDinamicas] = useState<ColumnDef<FilaProcesada>[]>([]); // Definiciones de columnas para la tabla
  const [invalidHeaders, setInvalidHeaders] = useState<string[]>([]); // Lista de cabeceras no válidas encontradas
  const [gestionActual, setGestionActual] = useState<string | null>(null); // Gestión obtenida de la API o fallback

  // --- Refs ---
  const workerRef = useRef<Worker | null>(null); // Referencia al Web Worker para procesar CSV
  const modalTimerRef = useRef<number | undefined>(undefined); // Timer para cerrar modales automáticamente

  // --- Query para obtener Áreas y Niveles (y la Gestión Actual) ---
  const { data: apiResponseAreas, isLoading: isLoadingData } = useQuery({
    queryKey: ['areasConNiveles'], // Clave de caché para React Query
    queryFn: obtenerAreasConNivelesAPI, // Función que llama al servicio API
    // Selecciona y transforma la respuesta de la API
    select: (data: ApiResponseAreas) => ({
        areasConNiveles: data.data || [], // Extrae el array de áreas
        gestion: data.olimpiada_actual || GESTION_ACTUAL_FALLBACK // Extrae la gestión o usa el fallback
    })
  });

  // Memoizar los datos extraídos para optimización
  const areasConNiveles = useMemo(() => apiResponseAreas?.areasConNiveles || [], [apiResponseAreas]);

  // Efecto para actualizar el estado de gestionActual cuando la query cargue o cambie
  useEffect(() => {
    if (apiResponseAreas?.gestion) {
        setGestionActual(apiResponseAreas.gestion);
        console.log("Gestión actual establecida:", apiResponseAreas.gestion); // Log útil para depuración
    } else if (!isLoadingData) { // Solo si ya terminó de cargar y no obtuvo gestión
        console.warn("No se pudo obtener la gestión actual de la API, usando fallback:", GESTION_ACTUAL_FALLBACK);
        setGestionActual(GESTION_ACTUAL_FALLBACK); // Asegurar que siempre haya una gestión
    }
  }, [apiResponseAreas, isLoadingData]);

  // --- Callbacks para manejo de estado ---
  const reset = useCallback(() => {
    setFilas([]);
    setNombreArchivo(null);
    setColumnasDinamicas([]);
    setInvalidHeaders([]);
    // No reseteamos gestionActual aquí
  }, []);

  const closeModal = useCallback(() => {
    setModalState(initialModalState);
    clearTimeout(modalTimerRef.current);
  }, []);

  // --- Mutación para enviar datos a la API ---
  const { mutate, isPending: isSubmitting } = useMutation< // Renombrar isPending a isSubmitting para claridad
    { message: string }, // Tipo de respuesta en éxito
    AxiosError<ApiErrorResponse>, // Tipo de error
    { gestion: string; payload: InscripcionPayload } // Argumentos que recibe la función de mutación
  >({
    mutationFn: ({ gestion, payload }) => importarCompetidoresAPI(gestion, payload), // Llama al servicio API
    onSuccess: (data) => {
      // Mostrar modal de éxito
      setModalState({
        isOpen: true,
        type: 'success',
        title: '¡Registro Exitoso!',
        message: data.message || 'Competidores registrados correctamente.',
      });
      // Cerrar modal automáticamente después de un tiempo
      modalTimerRef.current = window.setTimeout(closeModal, 1500);
      reset(); // Limpiar la UI
    },
    onError: (error) => {
        // --- Manejo de Errores Mejorado ---
        let errorMessage = 'Ocurrió un error inesperado al guardar.';
        const errorData = error.response?.data;

        if (errorData) {
            // Intentar formatear errores específicos de validación del backend
            if (errorData.errors && typeof errorData.errors === 'object') {
                const formattedErrors = Object.entries(errorData.errors)
                    .map(([key, messages]) => {
                        const match = key.match(/competidores\.(\d+)\.(.+)/);
                        if (match && filas.length > 0) { // Asegurarse que filas tenga datos
                            const index = parseInt(match[1], 10);
                            const fieldPath = match[2].replace(/\./g, ' -> ');
                            const filaAfectada = filas[index]; // Asume correlación índice API y array local
                            const ci = filaAfectada?.datos?.ci || `Fila CSV ${filaAfectada?.numeroDeFila || index + 1}`; // Usar CI o número de fila
                            return `  - Competidor (${ci}), Campo '${fieldPath}': ${(messages as string[]).join(', ')}`;
                        }
                        return `  - ${key}: ${(messages as string[]).join(', ')}`; // Fallback si no coincide el formato
                    })
                    .join('\n');
                if (formattedErrors) {
                   errorMessage = "Se encontraron errores de validación:\n" + formattedErrors;
                } else if (errorData.message) {
                   errorMessage = errorData.message; // Usar mensaje general si el formato de errors no es útil
                }

            } else if (errorData.message) {
                errorMessage = errorData.message; // Mensaje general del backend
            } else if (errorData.error) {
                errorMessage = errorData.error; // Otro campo posible para mensajes
            }
        } else if (error.request) {
            errorMessage = 'No se recibió respuesta del servidor. Verifique la conexión.';
        } else {
            errorMessage = error.message; // Error genérico (ej. configuración)
        }

        // Mostrar modal de error
        setModalState({
            isOpen: true,
            type: 'error',
            title: '¡Ups! Algo Salió Mal',
            message: errorMessage,
        });
        // No hacer reset() aquí, para que el usuario vea los datos y posibles errores en tabla
    },
  });

  // --- Efecto para inicializar y manejar el Web Worker ---
  useEffect(() => {
    // Crear instancia del worker
    workerRef.current = new Worker(new URL('../utils/csv.worker.ts', import.meta.url), {
      type: 'module',
    }); //

    // Manejador de mensajes recibidos del worker
    workerRef.current.onmessage = (
      e: MessageEvent<{ type: string; payload: ProcesamientoCSVResult | string }>
    ) => {
      const { type, payload } = e.data;
      setIsParsing(false); // Indicar que el parseo terminó

      if (type === 'SUCCESS' && typeof payload !== 'string') { // Éxito en el worker
        if (payload.errorGlobal) { // Error global detectado (ej. cabeceras)
          setModalState({
            isOpen: true, type: 'error', title: 'Error Crítico en Archivo', message: payload.errorGlobal,
          });
          setNombreArchivo(null); setFilas([]); setColumnasDinamicas([]);
          setInvalidHeaders(payload.invalidHeaders || []);
        } else { // Procesamiento exitoso
          // Definir columna fija para el número de fila
          const numeroDeFilaColumn: ColumnDef<FilaProcesada> = {
            id: 'numeroDeFila', // Añadir un ID único
            header: 'Nº',
            // Usar 'nro' del CSV si existe, sino el número de fila real
            cell: ({ row }) => row.original.datos.nro || row.original.numeroDeFila,
            size: 60, // Tamaño sugerido para la columna N°
          };

          // Crear columnas dinámicamente basadas en las cabeceras del CSV
          const columnasDesdeArchivo: ColumnDef<FilaProcesada>[] = payload.headers
            .filter((header) => { // Excluir cabeceras de número de fila
              const normalized = normalizarEncabezado(header);
              return normalized !== 'n' && normalized !== 'no' && normalized !== 'nro' && normalized !== 'numero';
            })
            .map((header) => {
              const normalizedHeader = normalizarEncabezado(header);
              const key = headerMapping[normalizedHeader]; // Obtener clave interna si es válida
              // Acceder a 'datos.key' si la cabecera es válida, sino a 'rawData.header'
              const accessorKey = key ? `datos.${key}` : `rawData.${header}`;
              return {
                id: header, // Usar cabecera original como ID único
                header, // Mostrar cabecera original
                accessorKey, // Cómo obtener el dato de la fila
              };
            });

          // Actualizar estado con columnas y filas procesadas
          setColumnasDinamicas([numeroDeFilaColumn, ...columnasDesdeArchivo]);
          setFilas(payload.filasProcesadas);
          setInvalidHeaders(payload.invalidHeaders || []); // Guardar cabeceras inválidas
        }
      } else if (type === 'ERROR') { // Error dentro del worker
        setModalState({ isOpen: true, type: 'error', title: 'Error de Procesamiento', message: payload as string });
        reset(); // Limpiar UI en caso de error irrecuperable en worker
      }
    };

    // Función de limpieza: terminar el worker al desmontar el componente
    return () => {
      workerRef.current?.terminate();
      clearTimeout(modalTimerRef.current); // Limpiar timer del modal
    };
  }, [reset]); // Dependencia 'reset'

  // --- Callback para manejar el drop de archivos (react-dropzone) ---
  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      reset(); // Limpiar estado previo
      // Rechazar si no es CSV
      if (fileRejections.length > 0) {
        setModalState({ isOpen: true, type: 'error', title: 'Archivo no válido', message: 'Formato no válido. Solo se permiten archivos .csv.' });
        return;
      }
      const file = acceptedFiles[0];
      if (!file) return; // Si no hay archivo aceptado

      setIsParsing(true); // Indicar inicio de parseo
      setNombreArchivo(file.name); // Guardar nombre

      // Leer contenido del archivo
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        // Enviar texto y datos de validación (áreas/niveles) al worker
        if (workerRef.current) {
             workerRef.current.postMessage({
                csvText: text,
                areasConNiveles: areasConNiveles, // Pasar datos actuales
             });
        } else {
             console.error("Worker no inicializado al leer archivo.");
             setIsParsing(false);
             setModalState({ isOpen: true, type: 'error', title: 'Error Interno', message: 'El procesador de archivos no está listo.' });
        }
      };
      reader.onerror = () => { // Manejar error de lectura
        setModalState({ isOpen: true, type: 'error', title: 'Error de Lectura', message: 'No se pudo leer el archivo.' });
        setIsParsing(false);
      };
      reader.readAsText(file, 'UTF-8'); // Leer como UTF-8
    },
    [reset, areasConNiveles] // Depender de areasConNiveles para pasar datos actualizados
  );

  // --- Callback para manejar el guardado ---
  const handleSave = () => {
    // Validaciones previas
    if (!gestionActual) {
       setModalState({ isOpen: true, type: 'error', title: 'Error Interno', message: 'No se pudo determinar la gestión actual.' }); return;
    }
    if (!nombreArchivo) {
       setModalState({ isOpen: true, type: 'error', title: 'Error Interno', message: 'No se encontró el nombre del archivo.' }); return;
    }
    if (invalidHeaders.length > 0) {
      setModalState({ isOpen: true, type: 'error', title: 'Cabeceras no válidas', message: 'El archivo contiene columnas no reconocidas. Corríjalas antes de guardar.' });
      return;
    }
    const filasValidas = filas.filter((f) => f.esValida);
    if (filas.length === 0 || filasValidas.length === 0) {
      setModalState({ isOpen: true, type: 'info', title: 'Sin datos', message: 'No hay filas válidas para guardar.' });
       modalTimerRef.current = window.setTimeout(closeModal, 1500); // Cerrar modal info automáticamente
      return;
    }
    // No permitir guardar si hay filas con errores
    if (filasValidas.length !== filas.length) {
      setModalState({ isOpen: true, type: 'error', title: 'Datos Inválidos', message: 'No se puede guardar porque hay filas con errores. Revise los datos marcados.' });
      return;
    }

    // Mostrar modal de confirmación antes de enviar
    setModalState({
      isOpen: true,
      type: 'confirmation',
      title: 'Confirmar Registro',
      message: `¿Está seguro de que desea registrar ${filasValidas.length} competidores para la gestión ${gestionActual}?`,
      onConfirm: () => { // Función que se ejecuta si el usuario confirma
        // Mapear filas válidas al payload esperado por la API
        const competidoresIndividuales = filasValidas.map((fila) =>
          mapCSVRenglonToPayload(fila.datos as CompetidorCSV) as CompetidorIndividualPayloadAPI
        );
        // Crear el payload final
        const payload: InscripcionPayload = {
          nombre_archivo: nombreArchivo, // Incluir nombre del archivo
          competidores: competidoresIndividuales,
        };
        // Ejecutar la mutación pasando la gestión y el payload
        mutate({ gestion: gestionActual, payload });
      },
    });
  };

  // Memoizar si el archivo es válido para guardar (optimización)
  const esArchivoValido = useMemo(() =>
    filas.length > 0 && invalidHeaders.length === 0 && filas.every((f) => f.esValida),
    [filas, invalidHeaders]
  );

  // --- Retorno del Hook ---
  return {
    // Datos y Estado
    datos: filas,
    nombreArchivo,
    esArchivoValido, // Indica si se puede presionar Guardar
    isParsing, // CSV procesándose en worker
    isLoadingData, // Cargando áreas/niveles iniciales
    isSubmitting, // Enviando a la API
    modalState, // Estado del modal
    columnasDinamicas, // Columnas para la tabla
    invalidHeaders, // Cabeceras inválidas encontradas
    gestionActual, // Gestión detectada

    // Callbacks y Acciones
    onDrop, // Para react-dropzone
    handleSave, // Para el botón Guardar
    handleCancel: reset, // Para el botón Limpiar/Cancelar
    closeModal, // Para cerrar el modal manualmente
  };
}