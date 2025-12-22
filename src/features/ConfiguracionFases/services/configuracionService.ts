import { AxiosError } from 'axios';
import apiClient from '@/api/ApiPhp';

import type {
  ApiResponseWrapper,
  ApiConfiguracionResponse,
  ApiAccionMaestra,
  ConfiguracionUI,
  AccionSistema,
  FaseGlobal,
  PermisoFase,
  Gestion,
  GuardarConfiguracionPayload,
  ConfigAccionPayload
} from '../types';

type ApiErrorResponse = {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
};

export const configuracionService = {

  async obtenerGestionActual(): Promise<Gestion> {
    try {
      const response = await apiClient.get<{ data: Gestion[] } | Gestion[]>('/gestiones');
      const lista = Array.isArray(response.data) ? response.data : response.data.data;
      
      const actual = lista.find((g) => g.esActual);
      if (!actual) {
         if (lista.length > 0) return lista[lista.length - 1];
         throw new Error('No hay gestiones.');
      }
      return actual;
    } catch (error) {
      console.error('Error al obtener gestión:', error);
      throw error;
    }
  },

  async obtenerConfiguracion(): Promise<ConfiguracionUI> {
    try {
      const [accionesResponse, configResponse] = await Promise.all([
        apiClient.get<ApiResponseWrapper<ApiAccionMaestra[]>>('/acciones-sistema'),
        apiClient.get<ApiResponseWrapper<ApiConfiguracionResponse>>('/configuracion-acciones')
      ]);

      const accionesMaestras = accionesResponse.data.data;
      const configData = configResponse.data.data;

      const accionesUI: AccionSistema[] = accionesMaestras.map(acc => ({
        id: acc.id_accion_sistema,
        codigo: acc.codigo,
        nombre: acc.nombre,
        descripcion: acc.descripcion
      })).sort((a, b) => a.nombre.localeCompare(b.nombre));

      const fases: FaseGlobal[] = [];
      const permisos: PermisoFase[] = [];

      if (configData && Object.keys(configData).length > 0) {
        Object.values(configData).forEach((item) => {
          fases.push({
            id: item.fase.id,
            nombre: item.fase.nombre,
            codigo: item.fase.codigo,
            orden: item.fase.orden
          });

          item.acciones.forEach((accConfig) => {
            permisos.push({
              id_fase: item.fase.id,
              id_accion: accConfig.id_accion_sistema,
              habilitado: accConfig.habilitada
            });
          });
        });

        fases.sort((a, b) => (a.orden || 0) - (b.orden || 0));
      }

      return {
        gestion: null, 
        fases,
        acciones: accionesUI,
        permisos
      };

    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      console.error('[ConfigService] Error construyendo matriz:', axiosError);
      const mensaje = axiosError.response?.data?.message || 'Error al cargar la configuración del sistema.';
      throw new Error(mensaje);
    }
  },

  async guardarConfiguracion(
    permisosUI: PermisoFase[]
  ): Promise<void> {
    try {
      const accionesPayload: ConfigAccionPayload[] = permisosUI.map(p => ({
        id_accion_sistema: p.id_accion,
        id_fase_global: p.id_fase,
        habilitada: p.habilitado
      }));

      const payload: GuardarConfiguracionPayload = {
        user_id: 1, 
        accionesPorFase: accionesPayload
      };

      await apiClient.post('/configuracion-acciones', payload);

    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      console.error('Error al guardar:', axiosError);
      const mensaje = axiosError.response?.data?.message || 'No se pudo guardar la configuración.';
      throw new Error(mensaje);
    }
  }
};