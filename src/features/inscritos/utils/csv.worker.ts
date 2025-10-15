import { procesarYValidarCSV } from './csvProcessor';
import type { AreaConNiveles } from '../types/indexInscritos';

self.onmessage = (e: MessageEvent<{ csvText: string; areasConNiveles: AreaConNiveles[] }>) => {
  const { csvText, areasConNiveles } = e.data;

  try {
    const resultado = procesarYValidarCSV(csvText, areasConNiveles);

    self.postMessage({ type: 'SUCCESS', payload: resultado });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error en el worker.';
    self.postMessage({ type: 'ERROR', payload: errorMessage });
  }
};

export {};