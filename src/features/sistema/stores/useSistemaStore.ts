import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { 
  SystemStatus, 
  SistemaStateData, 
  SistemaActivoResponse, 
  SistemaSinGestionResponse 
} from '../types/sistema.types';

interface SistemaStore {
  status: SystemStatus;
  data: SistemaStateData | null;
  isInitialized: boolean;
  setSystemData: (apiResponse: unknown) => void;
  setLoading: () => void;
  setError: () => void;
  resetSistema: () => void;
  getGestionActual: () => SistemaActivoResponse['gestion_actual'] | null;
  getAnioGestion: () => string | null;
}

export const useSistemaStore = create<SistemaStore>()(
  devtools(
    persist(
      (set, get) => ({
        status: 'loading',
        data: null,
        isInitialized: false,

        setLoading: () => set({ status: 'loading' }),
        
        setError: () => set({ status: 'error', isInitialized: true }),

        resetSistema: () => set({ status: 'loading', data: null, isInitialized: false }),

        setSystemData: (apiResponse: any) => {
          if (apiResponse?.status === 'sin_gestion') {
            const cleanData: SistemaSinGestionResponse = {
              status: 'sin_gestion',
              mensaje: apiResponse.mensaje || 'No hay gestión activa',
              server_timestamp: apiResponse.server_timestamp,
              gestion_actual: null,
              fase_global_activa: null,
              cronograma_vigente: null,
            };

            set({
              status: 'sin_gestion',
              data: cleanData,
              isInitialized: true,
            });
            return;
          }

          if (apiResponse?.gestion_actual || (apiResponse?.data && apiResponse?.success)) {
            const payload = apiResponse.gestion_actual ? apiResponse : apiResponse.data;
            const activeData: SistemaActivoResponse = {
              status: 'active',
              gestion_actual: payload.gestion_actual || payload, 
              fase_global_activa: payload.fase_global_activa || apiResponse.fase_global_activa || null,
              cronograma_vigente: payload.cronograma_vigente || apiResponse.cronograma_vigente || null,
              mensaje: apiResponse.message || 'Sistema activo',
            };

            set({
              status: 'active',
              data: activeData,
              isInitialized: true,
            });
            return;
          }

          console.error('Respuesta del sistema no reconocida:', apiResponse);
          set({ status: 'error', isInitialized: true });
        },
        
        getGestionActual: () => {
          const { data, status } = get();
          if (status === 'active' && data) {
            return (data as SistemaActivoResponse).gestion_actual;
          }
          return null;
        },

        getAnioGestion: () => {
          const gestion = get().getGestionActual();
          return gestion ? gestion.gestion : null;
        }
      }),
      {
        name: 'sistema-storage',
        partialize: (state) => ({
          data: state.data, 
          status: state.status,
          isInitialized: state.isInitialized 
        }), 
      }
    ),
    { name: 'SistemaStore' }
  )
);