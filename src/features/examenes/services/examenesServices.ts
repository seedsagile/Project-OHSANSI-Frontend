import apiClient from '@/api/ApiPhp';
import type { 
  Examen, 
  CrearExamenPayload, 
  EditarExamenPayload, 
  AreaNivelCompetencia 
} from '../types';

export const examenesService = {
  async obtenerEstructura(idResponsable: number): Promise<AreaNivelCompetencia[]> {
    const { data } = await apiClient.get<any[]>(`/competencias/responsable/${idResponsable}/areas-niveles-competencia`);
    return data.map((item) => ({
      id_area: item.id_Area,
      area: item.área,
      niveles: item.niveles
    }));
  },

  async listarExamenes(idAreaNivel: number): Promise<Examen[]> {
    const { data } = await apiClient.get<Examen[]>(`/examenes/area-nivel/${idAreaNivel}`);
    return data.sort((a, b) => a.id_examen - b.id_examen);
  },

  async crearExamen(payload: CrearExamenPayload): Promise<Examen> {
    const { data } = await apiClient.post<Examen>('/examenes', payload);
    return data;
  },

  async editarExamen(payload: EditarExamenPayload): Promise<Examen> {
    const { id_examen, ...rest } = payload;
    const { data } = await apiClient.put<Examen>(`/examenes/${id_examen}`, rest);
    return data;
  },

  async eliminarExamen(id: number): Promise<void> {
    await apiClient.delete(`/examenes/${id}`);
  },

  async iniciarExamen(id: number): Promise<void> {
    await apiClient.patch(`/examenes/${id}/iniciar`);
  },

  async finalizarExamen(id: number): Promise<void> {
    await apiClient.patch(`/examenes/${id}/finalizar`);
  }
};