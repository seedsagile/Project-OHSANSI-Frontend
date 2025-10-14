import { procesarYValidarCSV } from './csvProcessor';
self.onmessage = (e: MessageEvent<{ csvText: string; areas: string[]; niveles: string[] }>) => {
  const { csvText, areas, niveles } = e.data;

  try {
    const resultado = procesarYValidarCSV(csvText, areas, niveles);

    self.postMessage({ type: 'SUCCESS', payload: resultado });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error en el worker.';
    self.postMessage({ type: 'ERROR', payload: errorMessage });
  }
};

export {};
