import apiClient from '../../../api/ApiPhp';
import type { 
  ApiResponse, 
  AreaConNiveles, 
  AreaNivel, 
  AsignacionPayload,
  Area,
  Nivel,
  Grado,
  AreaNivelesResponse
} from '../types';

type GradosResponse = {
  success: boolean;
  data: Grado[];
};

export const asignacionesService = {
  // GET /api/area - Obtener todas las áreas
  async obtenerAreas(): Promise<Area[]> {
    const response = await apiClient.get<Area[]>('/area');
    return response.data;
  },

  // GET /api/niveles - Obtener todos los niveles
  async obtenerNiveles(): Promise<Nivel[]> {
    const response = await apiClient.get<Nivel[]>('/niveles');
    return response.data;
  },

  // GET /api/grados-escolaridad - Obtener todos los grados
  async obtenerGradosEscolaridad(): Promise<Grado[]> {
    const response = await apiClient.get<GradosResponse>('/grados-escolaridad');
    return response.data.data;
  },

  // GET /api/area-nivel/gestion/{gestion}/area/{id_area} - Obtener niveles y grados asignados
  async obtenerNivelesYGradosAsignados(gestion: string, id_area: number): Promise<AreaNivelesResponse> {
    const response = await apiClient.get<AreaNivelesResponse>(
      `/area-nivel/gestion/${gestion}/area/${id_area}`
    );
    return response.data;
  },

  // POST /api/area-nivel - Crear asignaciones con grados
  async crearAsignacionesDeArea(payload: AsignacionPayload[]): Promise<ApiResponse<AreaNivel[]>> {
    const response = await apiClient.post<ApiResponse<AreaNivel[]>>('/area-nivel', payload);
    return response.data;
  },

  // APIs antiguas (mantener para compatibilidad)
  async obtenerAreasConNiveles(): Promise<AreaConNiveles[]> {
    const response = await apiClient.get<ApiResponse<AreaConNiveles[]>>('/areas-con-niveles');
    return response.data.data;
  },

  async obtenerNivelesPorArea(id_area: number): Promise<AreaNivel[]> {
    const response = await apiClient.get<ApiResponse<AreaNivel[]>>(`/area-niveles/${id_area}`);
    return response.data.data;
  },

  async actualizarNivelesDeArea(
    id_area: number,
    payload: AsignacionPayload[]
  ): Promise<AreaNivel[]> {
    const response = await apiClient.put<ApiResponse<AreaNivel[]>>(
      `/area-niveles/${id_area}`,
      payload
    );
    return response.data.data;
  },
};