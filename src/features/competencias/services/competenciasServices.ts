import apiClient from '@/api/ApiPhp';
import type { Competencia, CrearCompetenciaPayload, AreaFiltro, FaseGlobal, NivelFiltro } from '../types';

export const competenciasService = {
  async obtenerAreasResponsable(idResponsable: number): Promise<AreaFiltro[]> {
    const { data } = await apiClient.get<AreaFiltro[]>(`/competencias/responsable/${idResponsable}/areas/actuales`);
    return data;
  },

  async listarCompetencias(idResponsable: number, idArea: number): Promise<Competencia[]> {
    const { data } = await apiClient.get<Competencia[]>(`/competencias/responsable/${idResponsable}/area/${idArea}`);
    return data.sort((a, b) => b.id_competencia - a.id_competencia);
  },

  // 3. Crear Competencia
  async crearCompetencia(payload: CrearCompetenciaPayload): Promise<Competencia> {
    const { data } = await apiClient.post<Competencia>('/competencias', payload);
    return data;
  },

  // 4. Acciones de Estado (Máquina de Estados)
  async publicarCompetencia(id: number): Promise<void> {
    await apiClient.patch(`/competencias/${id}/publicar`);
  },

  async iniciarCompetencia(id: number): Promise<void> {
    await apiClient.patch(`/competencias/${id}/iniciar`);
  },

  async cerrarCompetencia(id: number): Promise<void> {
    await apiClient.post(`/competencias/${id}/cerrar`);
  },

  async avalarCompetencia(id: number, userIdSimulado: number, passwordConfirmacion: string): Promise<void> {
    await apiClient.post(`/competencias/${id}/avalar`, {
      user_id_simulado: userIdSimulado,
      password_confirmacion: passwordConfirmacion
    });
  },

  // 5. Helpers para el Modal de Creación
  async obtenerFasesGlobales(): Promise<FaseGlobal[]> {
    const { data } = await apiClient.get<FaseGlobal[]>('/competencias/fase-global/clasificatoria/actuales');
    return data;
  },

  async obtenerNivelesPorArea(idArea: number): Promise<NivelFiltro[]> {
    const { data } = await apiClient.get<NivelFiltro[]>(`/competencias/area/${idArea}/niveles`);
    return data;
  }
};