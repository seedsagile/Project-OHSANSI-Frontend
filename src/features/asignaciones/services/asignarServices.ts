import apiClient from '../../../api/ApiPhp';
import type { ApiResponse, AreaConNiveles, AreaNivel, AsignacionPayload } from '../types';

type AreasNombresResponse = {
  success: boolean;
  data: {
    nombres_areas: Record<string, string>;
  };
};

export const asignacionesService = {
  // Nueva API: Obtener áreas con sus niveles asignados
  async obtenerAreasConNiveles(): Promise<AreaConNiveles[]> {
    const response = await apiClient.get<ApiResponse<AreaConNiveles[]>>('/areas-con-niveles');
    return response.data.data;
  },

  // Nueva API: Obtener nombres de áreas permitidas
  async obtenerAreasNombres(): Promise<Record<number, string>> {
    const response = await apiClient.get<AreasNombresResponse>('/areas-nombres');
    // Convertir las claves string a number
    const nombresAreas = response.data.data.nombres_areas;
    const areasPermitidas: Record<number, string> = {};
    
    Object.entries(nombresAreas).forEach(([id, nombre]) => {
      areasPermitidas[Number(id)] = nombre;
    });
    
    return areasPermitidas;
  },

  // Crear nuevas asignaciones (solo para niveles nuevos)
  async crearAsignacionesDeArea(payload: AsignacionPayload[]): Promise<ApiResponse<AreaNivel[]>> {
    const response = await apiClient.post<ApiResponse<AreaNivel[]>>('/area-niveles', payload);
    // Retornar la respuesta completa para poder acceder a success_count y errors
    return response.data;
  },

  // Mantener estas por si se necesitan después
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