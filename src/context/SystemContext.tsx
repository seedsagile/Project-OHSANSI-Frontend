import React, { 
  createContext, 
  useContext, 
  useEffect, 
  useState, 
  useCallback,
  useMemo 
} from 'react';
import { useAuth } from '../auth/login/hooks/useAuth';
import { systemService } from '../api/systemService';

// Importamos los tipos del servicio para mantener consistencia
import type { GestionSystem, FaseSystem } from '../api/systemService';

// --- Definición de la Interfaz del Contexto ---
interface SystemContextType {
  /** Objeto con la información de la gestión activa (Año, ID, Nombre) */
  gestionActual: GestionSystem | null;
  /** Objeto con la fase global en la que se encuentra el sistema hoy */
  faseActual: FaseSystem | null;
  /** Conjunto de códigos de permisos habilitados para el usuario actual */
  permisos: Set<string>;
  /** Indica si el sistema está cargando su configuración inicial */
  isLoading: boolean;
  /** Función para verificar si el usuario tiene acceso a un módulo/acción */
  can: (codigoAccion: string) => boolean;
  /** Permite recargar manualmente los permisos (ej. después de un cambio de rol) */
  refreshSystem: () => Promise<void>;
}

// Creamos el contexto con valor inicial undefined
const SystemContext = createContext<SystemContextType | undefined>(undefined);

// --- Provider Component ---
export const SystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  
  // Estados Locales
  const [gestionActual, setGestionActual] = useState<GestionSystem | null>(null);
  const [faseActual, setFaseActual] = useState<FaseSystem | null>(null);
  const [permisos, setPermisos] = useState<Set<string>>(new Set());
  
  // Estado de carga inicial (bloqueante para la UI principal)
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Función principal de carga de datos.
   * Orquesta las llamadas al API en el orden correcto.
   */
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Obtener el "Latido" del Sistema (Gestión y Fase vigentes)
      const statusData = await systemService.getSystemStatus();
      
      setGestionActual(statusData.gestion);
      setFaseActual(statusData.fase_actual);

      // 2. Si hay usuario logueado, obtener sus permisos "Filtados por Fase"
      if (isAuthenticated && user?.id_usuario) {
        // Necesitamos los IDs de la gestión y fase que acabamos de traer
        const accionesCodigo = await systemService.getUserActions(
          user.id_usuario,
          statusData.fase_actual.id_fase_global,
          statusData.gestion.id
        );
        
        // Convertimos a Set para búsquedas ultra-rápidas: permisos.has('MOD_X')
        setPermisos(new Set(accionesCodigo));
      } else {
        // Si no hay usuario, limpiamos permisos por seguridad
        setPermisos(new Set());
      }

    } catch (error) {
      console.error('[SystemContext] Error crítico cargando estado del sistema:', error);
      // Aquí podrías redirigir a una página de "Mantenimiento" o error 500
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.id_usuario]);

  // Efecto para cargar datos al montar o cuando cambia la autenticación
  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * Función "can": El núcleo de la seguridad en el frontend.
   * Verifica si el código de acción existe en el set de permisos cargados.
   * @param codigoAccion El slug del módulo (ej: 'MOD_AREAS')
   */
  const can = useCallback((codigoAccion: string): boolean => {
    if (!codigoAccion) return false;
    // Verificación O(1) gracias al Set
    return permisos.has(codigoAccion);
  }, [permisos]);

  // Memorizamos el valor del contexto para evitar re-renders innecesarios
  const contextValue = useMemo(() => ({
    gestionActual,
    faseActual,
    permisos,
    isLoading,
    can,
    refreshSystem: loadData
  }), [gestionActual, faseActual, permisos, isLoading, can, loadData]);

  return (
    <SystemContext.Provider value={contextValue}>
      {children}
    </SystemContext.Provider>
  );
};

// --- Hook Personalizado ---
export const useSystem = () => {
  const context = useContext(SystemContext);
  if (!context) {
    throw new Error('useSystem debe ser usado dentro de un <SystemProvider>');
  }
  return context;
};