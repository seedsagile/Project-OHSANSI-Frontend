import apiClient from '../../../api/ApiPhp';
import type { Area, Nivel, Competidor, CompetidoresResponse } from '../interface/interface';

// ✅ Obtener todos los competidores de un responsable específico
export const getCompetidoresPorResponsableAPI = async (
  id_responsable: number
): Promise<CompetidoresResponse> => {
  const response = await apiClient.get<CompetidoresResponse>(
    `/responsables/${id_responsable}/competidores`
  );
  return response.data;
};

// ✅ Obtener todas las ÁREAS de los competidores de un responsable (sin duplicados)
export const getAreasPorResponsableAPI = async (id_responsable: number): Promise<Area[]> => {
  const response = await getCompetidoresPorResponsableAPI(id_responsable);
  const competidores: Competidor[] = response.data || [];

  const areas = Array.from(
    new Map(
      competidores.filter((item) => item.area).map((item) => [item.area.id_area, item.area])
    ).values()
  );

  return areas;
};

// ✅ Obtener todos los NIVELES de los competidores de un responsable (sin duplicados)
export const getNivelesPorResponsableAPI = async (id_responsable: number): Promise<Nivel[]> => {
  const response = await getCompetidoresPorResponsableAPI(id_responsable);
  const competidores: Competidor[] = response.data || [];

  const niveles = Array.from(
    new Map(
      competidores.filter((item) => item.nivel).map((item) => [item.nivel.id_nivel, item.nivel])
    ).values()
  );

  return niveles;
};

// ✅ Obtener niveles de un área específica
export const getAreaNivelesAPI = async (id_area: number): Promise<Nivel[]> => {
  const response = await apiClient.get(`/area-niveles/${id_area}`);
  return response.data;
};
