import { AxiosError } from 'axios';
import apiClient from '@/api/ApiPhp';

import type {
  ApiResponse,
  Gestion,
  MatrizConfiguracionResponse,
  GuardarConfiguracionPayload,
  PermisoFasePayload,
  AccionSistema,
  FaseGlobal,
  PermisoFase
} from '../types';

export interface ConfiguracionUI {
  gestion: Gestion;
  fases: FaseGlobal[];
  acciones: AccionSistema[];
  permisos: PermisoFase[];
}

type ApiErrorResponse = {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
};

export const configuracionService = {

  async obtenerGestionActual(): Promise<Gestion> {
    try {
      const response = await apiClient.get<ApiResponse<Gestion[]>>('/gestiones');
      
      const listaGestiones = response.data.data || response.data;

      if (!Array.isArray(listaGestiones)) {
        throw new Error('La respuesta del servidor no es una lista válida de gestiones.');
      }

      const actual = listaGestiones.find((g) => g.esActual);

      if (!actual) {
        if (listaGestiones.length > 0) {
            return listaGestiones[listaGestiones.length - 1];
        }
        throw new Error('No se encontraron gestiones registradas.');
      }

      return actual;
    } catch (error) {
      console.error('[ConfigService] Error al obtener gestión:', error);
      throw error instanceof Error ? error : new Error('Error desconocido al obtener gestión.');
    }
  },

  async obtenerConfiguracion(idGestion: number): Promise<ConfiguracionUI> {
    try {
      const response = await apiClient.get<ApiResponse<MatrizConfiguracionResponse>>(
        `/gestiones/${idGestion}/configuracion-acciones`
      );
      
      const apiData = response.data.data || response.data;
      
      if (!apiData || !Array.isArray(apiData.acciones)) {
        console.error('Estructura recibida:', apiData);
        throw new Error('La estructura de la matriz no es válida (faltan acciones).');
      }

      const accionesUI: AccionSistema[] = apiData.acciones.map(acc => ({
        id: acc.id,
        codigo: acc.codigo,
        nombre: acc.nombre,
        descripcion: acc.descripcion,
        porFase: []
      }));

      const permisosPlanos: PermisoFase[] = apiData.acciones.flatMap(accion => 
        accion.porFase.map(detalle => ({
          id_fase: detalle.idFase,
          id_accion: accion.id,
          habilitado: detalle.habilitada
        }))
      );

      const gestionCompleta: Gestion = {
        id: apiData.gestion.id,
        gestion: apiData.gestion.gestion,
        nombre: `Gestión ${apiData.gestion.gestion}`,
        esActual: true
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

  async guardarConfiguracion(
    idGestion: number,
    permisosUI: PermisoFase[],
    idsFasesActivas: number[]
  ): Promise<void> {
    try {

      const accionesPorFasePayload: PermisoFasePayload[] = permisosUI.map(p => ({
        idAccion: p.id_accion,
        idFase: p.id_fase,
        habilitada: p.habilitado
      }));

      const payload: GuardarConfiguracionPayload = {
        fases: idsFasesActivas,
        accionesPorFase: accionesPorFasePayload
      };

      await apiClient.put(`/gestiones/${idGestion}/configuracion-acciones`, payload);

    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      
      if (axiosError.response?.status === 422) {
        console.error('Errores de validación Backend:', axiosError.response.data.errors);
        throw new Error('Datos inválidos. Verifique que todos los campos sean correctos.');
      }

      const mensaje = axiosError.response?.data?.message || 'No se pudo guardar la configuración.';
      throw new Error(mensaje);
    }
  }
};