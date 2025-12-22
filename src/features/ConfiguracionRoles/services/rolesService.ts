import { AxiosError } from 'axios';
import apiClient from '@/api/ApiPhp';

import type {
  ApiResponseWrapper,
  ApiRolData,
  ApiAccionMaestra,
  MatrizRolesUI,
  AccionSistema,
  RolGlobal,
  PermisoRol,
  GuardarRolesPayload,
  PayloadRolItem,
  PayloadAccionRol
} from '../types';

type ApiErrorResponse = {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
};

export const rolesService = {

  async obtenerMatriz(): Promise<MatrizRolesUI> {
    try {
      const [accionesResponse, rolesResponse] = await Promise.all([
        apiClient.get<ApiResponseWrapper<ApiAccionMaestra[]>>('/acciones-sistema'),
        apiClient.get<ApiResponseWrapper<ApiRolData[]>>('/roles/matriz')
      ]);

      const accionesMaestras = accionesResponse.data.data;
      const rolesData = rolesResponse.data.data;

      const accionesUI: AccionSistema[] = accionesMaestras.map(acc => ({
        id: acc.id_accion_sistema,
        codigo: acc.codigo,
        nombre: acc.nombre,
        descripcion: acc.descripcion
      })).sort((a, b) => a.nombre.localeCompare(b.nombre));

      const roles: RolGlobal[] = [];
      const permisos: PermisoRol[] = [];

      if (Array.isArray(rolesData)) {
        rolesData.forEach((item) => {
          roles.push({
            id: item.rol.id_rol,
            nombre: item.rol.nombre
          });

          item.acciones.forEach((accRol) => {
            permisos.push({
              id_rol: item.rol.id_rol,
              id_accion: accRol.id_accion_sistema,
              activo: accRol.activo
            });
          });
        });
        
        roles.sort((a, b) => a.id - b.id);
      }

      return {
        roles,
        acciones: accionesUI,
        permisos
      };

    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      console.error('[RolesService] Error construyendo matriz:', axiosError);
      const mensaje = axiosError.response?.data?.message || 'Error al cargar la configuración de roles.';
      throw new Error(mensaje);
    }
  },

  async guardarConfiguracion(permisosUI: PermisoRol[]): Promise<void> {
    try {
      const permisosPorRol = new Map<number, PayloadAccionRol[]>();

      permisosUI.forEach(p => {
        const accionesRol = permisosPorRol.get(p.id_rol) || [];
        accionesRol.push({
          id_accion_sistema: p.id_accion,
          activo: p.activo
        });
        permisosPorRol.set(p.id_rol, accionesRol);
      });

      const rolesPayload: PayloadRolItem[] = Array.from(permisosPorRol.entries()).map(([idRol, acciones]) => ({
        id_rol: idRol,
        acciones
      }));

      const payload: GuardarRolesPayload = {
        user_id: 1, 
        roles: rolesPayload
      };

      await apiClient.post('/roles/matriz', payload);

    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      console.error('Error al guardar roles:', axiosError);
      const mensaje = axiosError.response?.data?.message || 'No se pudo guardar la configuración.';
      throw new Error(mensaje);
    }
  }
};