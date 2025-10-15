import apiClient from "../../../api/ApiPhp";
import type { Area, Nivel, ParametroClasificacion } from "../interface/interface";

export const obtenerAreasAPI = async (): Promise<Area[]> => {
  const response = await apiClient.get("/area");
  return response.data.map((a: { id_area: number; nombre: string }) => ({
    id: a.id_area,
    nombre: a.nombre,
  }));
};

export const obtenerNivelesPorAreaAPI = async (
  id_area: number
): Promise<Nivel[]> => {
  const response = await apiClient.get("/areas-con-niveles");

  const areas = response.data.data;

  const areaEncontrada = areas.find(
    (a: { id_area: number }) => a.id_area === id_area
  );

  if (!areaEncontrada) {
    return [];
  }

  const niveles: Nivel[] = areaEncontrada.niveles.map(
    (n: { id_nivel: number; nombre: string }) => ({
      id: n.id_nivel,
      nombre: n.nombre,
    })
  );

  return niveles;
};


export const crearParametroAPI = async (payload: ParametroClasificacion) => {
  const response = await apiClient.post("/fases", payload);
  return response.data;
};
