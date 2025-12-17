import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SistemaEstado } from '../types/sistema.types';

interface SistemaState {
  config: SistemaEstado | null;
  setConfig: (config: SistemaEstado) => void;
  reset: () => void;
}

export const useSistemaStore = create<SistemaState>()(
  persist(
    (set) => ({
      config: null,
      setConfig: (config) => set({ config }),
      reset: () => set({ config: null }),
    }),
    { 
      name: 'ohsansi-system-state',
    }
  )
);