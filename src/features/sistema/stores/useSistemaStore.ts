import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import type { 
  SistemaStateData, 
  SystemStatus,
  SistemaActivoResponse,
  SistemaSinGestionResponse 
} from '../types/sistema.types';
import type { UserCapabilities, SystemPermissionCode } from '../types/permisos.types';

interface SistemaState {
  // Estado Global
  status: SystemStatus;
  data: SistemaStateData | null;
  isInitialized: boolean;
  
  // Permisos Usuario
  capabilities: UserCapabilities | null;
  isLoadingCapabilities: boolean;
  permissionError: string | null;

  // Actions
  setSystemData: (apiResponse: any) => void;
  setLoading: () => void;
  setStatus: (status: SystemStatus) => void;
  setError: () => void;
  resetSistema: () => void;
  
  setCapabilities: (data: UserCapabilities) => void;
  setCapabilitiesLoading: (loading: boolean) => void;
  setCapabilitiesError: (error: string | null) => void;
  clearCapabilities: () => void;

  // Selectors
  getGestionActual: () => SistemaActivoResponse['gestion_actual'] | null;
  getAnioGestion: () => string | null;
  canAccess: (code: SystemPermissionCode) => boolean;
  getAccessDenialReason: () => { roles: string[]; fase: string };
}

export const useSistemaStore = create<SistemaState>()(
  devtools(
    persist(
      (set, get) => ({
        status: 'loading',
        data: null,
        isInitialized: false,
        capabilities: null,
        isLoadingCapabilities: false,
        permissionError: null,

        // --- SISTEMA GLOBAL ---
        setLoading: () => set({ status: 'loading' }),
        setStatus: (status) => set({ status }),
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
            set({ status: 'sin_gestion', data: cleanData, isInitialized: true });
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
            set({ status: 'active', data: activeData, isInitialized: true });
            return;
          }
          set({ status: 'error', isInitialized: true });
        },

        getGestionActual: () => {
          const { data, status } = get();
          return (status === 'active' && data) ? (data as SistemaActivoResponse).gestion_actual : null;
        },

        getAnioGestion: () => get().getGestionActual()?.gestion || null,

        // --- PERMISOS (RBAC Simplificado) ---

        setCapabilities: (data) => set({ 
          capabilities: data, 
          permissionError: null, 
          isLoadingCapabilities: false 
        }),
        
        setCapabilitiesLoading: (loading) => set({ isLoadingCapabilities: loading }),
        
        setCapabilitiesError: (error) => set({ 
          permissionError: error, 
          isLoadingCapabilities: false 
        }),

        clearCapabilities: () => set({ capabilities: null, permissionError: null }),

        canAccess: (code) => {
          const { capabilities } = get();
          
          // 1. Si no hay capabilities, denegar.
          if (!capabilities) return false;

          // 2. CORRECCIÓN CRÍTICA: Validamos que el array exista antes de usar .some()
          // Esto evita el crash si LocalStorage tiene datos viejos sin esta propiedad.
          if (!Array.isArray(capabilities.acciones_permitidas)) {
            console.warn("Estructura de permisos corrupta o antigua. Limpiando...");
            return false;
          }

          return capabilities.acciones_permitidas.some(
            (accion) => accion.codigo === code
          );
        },

        getAccessDenialReason: () => {
          const { capabilities } = get();
          return {
            roles: capabilities?.roles || ['Sin Rol Identificado'],
            fase: capabilities?.debug_estado?.fase_detectada || 'Fase Desconocida',
          };
        },
      }),
      {
        name: 'sistema-storage',
        partialize: (state) => ({
          data: state.data, 
          status: state.status,
          isInitialized: state.isInitialized,
          capabilities: state.capabilities
        }), 
      }
    ),
    { name: 'SistemaStore' }
  )
);