// src/features/ConfiguracionFases/services/configuracionService.ts

import { AxiosError } from 'axios';
import apiClient from '@/api/ApiPhp';

// Importamos los tipos definidos en tu archivo index.ts
import type {
  ApiResponse,
  Gestion,
  MatrizConfiguracionResponse,
  GuardarConfiguracionPayload,
  PermisoFasePayload,
  AccionSistema,
  FaseGlobal,
  PermisoFase // Este es el tipo plano para la UI { id_fase, id_accion, habilitado }
} from '../types';

// Interfaz "UI Friendly" que devuelve este servicio al Hook
export interface ConfiguracionUI {
  gestion: Gestion;
  fases: FaseGlobal[];
  acciones: AccionSistema[]; 
  permisos: PermisoFase[];
}

// Tipo para errores estándar de tu backend
type ApiErrorResponse = {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
};

export const configuracionService = {

  /**
   * 1. Obtiene la gestión actual (REAL).
   * Endpoint: GET /api/gestiones
   */
  async obtenerGestionActual(): Promise<Gestion> {
    try {
      // Petición tipada esperando el wrapper ApiResponse
      const response = await apiClient.get<ApiResponse<Gestion[]>>('/gestiones');
      
      // Extraemos el array de gestiones. 
      // Nota: Verificamos si viene en response.data.data (estándar) o response.data (por si acaso)
      const listaGestiones = response.data.data || response.data;

      if (!Array.isArray(listaGestiones)) {
        throw new Error('La respuesta del servidor no es una lista válida de gestiones.');
      }

      // Buscamos la gestión marcada como actual
      const actual = listaGestiones.find((g) => g.esActual);

      if (!actual) {
        // Fallback: Si ninguna está marcada, devolvemos la última
        if (listaGestiones.length > 0) {
             return listaGestiones[listaGestiones.length - 1];
        }
        throw new Error('No se encontraron gestiones registradas.');
      }

      return actual;
    } catch (error) {
      console.error('[ConfigService] Error al obtener gestión:', error);
      // Re-lanzamos el error para que React Query lo capture
      throw error instanceof Error ? error : new Error('Error desconocido al obtener gestión.');
    }
  },

  /**
   * 2. Obtiene la matriz de configuración.
   * Endpoint: GET /api/gestiones/{id}/configuracion-acciones
   */
  async obtenerConfiguracion(idGestion: number): Promise<ConfiguracionUI> {
    try {
      const response = await apiClient.get<ApiResponse<MatrizConfiguracionResponse>>(
        `/gestiones/${idGestion}/configuracion-acciones`
      );
      
      // Extraemos los datos. Manejamos si viene directo o envuelto en 'data'
      // TypeScript nos ayuda aquí gracias a los genéricos
      const apiData = response.data.data || response.data;

      // VALIDACIÓN CLAVE: Verificamos que exista la propiedad 'acciones' (según tu JSON real)
      if (!apiData || !Array.isArray(apiData.acciones)) {
        console.error('Estructura recibida:', apiData);
        throw new Error('La estructura de la matriz no es válida (faltan acciones).');
      }

      // --- ADAPTADOR (Backend -> Frontend) ---
      
      // 1. Preparamos la lista de acciones (limpiando la data anidada que no sirve en la tabla)
      const accionesUI: AccionSistema[] = apiData.acciones.map(acc => ({
        id: acc.id,
        codigo: acc.codigo,
        nombre: acc.nombre,
        descripcion: acc.descripcion,
        porFase: [] // Vaciamos esto, ya que usaremos la lista plana 'permisos'
      }));

      // 2. Aplanamos los permisos para que la TablaFases los consuma fácilmente
      // Convertimos: Accion -> porFase[]  ===>  PermisoFase[]
      const permisosPlanos: PermisoFase[] = apiData.acciones.flatMap(accion => 
        accion.porFase.map(detalle => ({
          id_fase: detalle.idFase,
          id_accion: accion.id,
          habilitado: detalle.habilitada
        }))
      );

      // Reconstruimos el objeto Gestion completo para la UI si apiData.gestion viene incompleto
      // (Tu JSON mostraba solo { id, gestion }, así que completamos los faltantes)
      const gestionCompleta: Gestion = {
        id: apiData.gestion.id,
        gestion: apiData.gestion.gestion,
        nombre: `Gestión ${apiData.gestion.gestion}`, // Nombre fallback
        esActual: true // Asumimos true porque estamos editando la activa
      };

      return {
        gestion: gestionCompleta,
        fases: apiData.fases,
        acciones: accionesUI,
        permisos: permisosPlanos
      };

    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      console.error('[ConfigService] Error cargando matriz:', axiosError);
      const mensaje = axiosError.response?.data?.message || 'Error al cargar la configuración de fases.';
      throw new Error(mensaje);
    }
  },

  /**
   * 3. Guarda la configuración.
   * Endpoint: PUT /api/gestiones/{id}/configuracion-acciones
   */
  async guardarConfiguracion(
    idGestion: number, 
    permisosUI: PermisoFase[], // Lista plana que viene de la Tabla
    idsFasesActivas: number[] 
  ): Promise<void> {
    try {
      // --- ADAPTADOR (Frontend -> Backend) ---
      // Convertimos la lista plana de la UI al formato jerárquico/lista que espera el API
      
      const accionesPorFasePayload: PermisoFasePayload[] = permisosUI.map(p => ({
        idAccion: p.id_accion, // Mapeo: id_accion -> idAccion
        idFase: p.id_fase,     // Mapeo: id_fase -> idFase
        habilitada: p.habilitado
      }));

      const payload: GuardarConfiguracionPayload = {
        fases: idsFasesActivas,
        accionesPorFase: accionesPorFasePayload
      };

      // console.log('[ConfigService] Enviando payload:', payload);

      await apiClient.put(`/gestiones/${idGestion}/configuracion-acciones`, payload);
      
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      
      // Manejo especial para errores de validación (422)
      if (axiosError.response?.status === 422) {
        console.error('Errores de validación Backend:', axiosError.response.data.errors);
        throw new Error('Datos inválidos. Verifique que todos los campos sean correctos.');
      }

      const mensaje = axiosError.response?.data?.message || 'No se pudo guardar la configuración.';
      throw new Error(mensaje);
    }
  }
};