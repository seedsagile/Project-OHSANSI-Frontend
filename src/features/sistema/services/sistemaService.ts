import apiClient from '@/api/ApiPhp';
import { useAuthStore } from '@/auth/login/stores/authStore';               
import type { 
  SistemaStateData, 
  CrearGestionPayload, 
  CrearGestionResponse 
} from '../types/sistema.types';
import type { 
  CapabilitiesResponse, 
  UserCapabilities 
} from '../types/permisos.types';

export const sistemaService = {

  obtenerEstadoSistema: async (): Promise<SistemaStateData> => {
    const { data } = await apiClient.get<SistemaStateData>('/sistema/estado');
    return data;
  },

  obtenerCapacidadesUsuario: async (idUser: number): Promise<UserCapabilities> => {
    const { data } = await apiClient.get<CapabilitiesResponse>(
      `/usuario/mis-acciones/usuario/${idUser}`
    );
    return data.data;
  },

  inicializarGestion: async (payload: CrearGestionPayload): Promise<CrearGestionResponse> => {
    const user = useAuthStore.getState().user;

    if (!user?.id_usuario) {
      throw new Error("No se pudo identificar al usuario administrador.");
    }

    const body = {
      nombre: payload.nombre,
      gestion: payload.anio,
      user_id: user.id_usuario,
      estado: payload.activar ? 1 : 0
    };

    console.log('Payload Creación:', body);

    const { data } = await apiClient.post<CrearGestionResponse>('/olimpiadas/admin', body);
    return data;
  },

  verificarSalud: async (): Promise<boolean> => {
    try {
      await apiClient.get('/ping'); 
      return true;
    } catch (error) {
      return false;
    }
  }
};