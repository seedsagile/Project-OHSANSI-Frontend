import apiClient from '@/api/ApiPhp';
import type { 
  AreaEvaluador, 
  ExamenCombo, 
  CompetidorSala, 
  GuardarNotaPayload 
} from '../types/sala.types';

export const salaService = {
  
  // 1. Obtener Áreas/Niveles del Evaluador (Con Adapter)
  async obtenerAreasNiveles(idUser: number): Promise<AreaEvaluador[]> {
    const { data } = await apiClient.get<any[]>(`/sala-evaluacion/evaluador/${idUser}/areas-niveles`);
    
    // Adapter: Normalizar nombres "sucios" del backend
    return data.map(item => ({
      id_area: item.id_Area,
      nombre_area: item.área,
      niveles: item.niveles
    }));
  },

  // 2. Obtener Exámenes (Combo)
  async obtenerExamenes(idAreaNivel: number): Promise<ExamenCombo[]> {
    const { data } = await apiClient.get<ExamenCombo[]>(`/examenes/combo/area-nivel/${idAreaNivel}`);
    return data;
  },

  // 3. Cargar la Pizarra (Lista de Alumnos)
  async obtenerCompetidores(idExamen: number): Promise<CompetidorSala[]> {
    const { data } = await apiClient.get<CompetidorSala[]>(`/examenes/${idExamen}/competidores`);
    return data;
  },

  // 4. SEMÁFORO ROJO: Intentar Bloquear
  async bloquearCompetidor(idEvaluacion: number, userId: number): Promise<void> {
    await apiClient.post(`/sala-evaluacion/${idEvaluacion}/bloquear`, { user_id: userId });
  },

  // 5. SEMÁFORO VERDE: Guardar Nota
  async guardarNota(idEvaluacion: number, payload: GuardarNotaPayload): Promise<void> {
    await apiClient.post(`/sala-evaluacion/${idEvaluacion}/guardar`, payload);
  },

  // 6. LIBERAR: Desbloquear (Cancelar)
  async desbloquearCompetidor(idEvaluacion: number, userId: number): Promise<void> {
    await apiClient.post(`/sala-evaluacion/${idEvaluacion}/desbloquear`, { user_id: userId });
  }
};