import apiClient from "../../../api/ApiPhp";
import type {
  Area,
  Nivel,
  ParametroClasificacion,
  CompetidoresResponse,
  Competidor,
} from "../interface/interface";

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
  const response = await apiClient.get<CompetidoresResponse>(
    `/responsables/2/competidores`
  );

  const data: Competidor[] = response.data.data;

  const nivelesFiltrados = data
    .filter((c) => c.id_area === id_area)
    .map((c) => ({
      id: c.nivel.id_nivel,
      nombre: c.nivel.nombre,
    }));

  const nivelesUnicos: Nivel[] = [];
  const idsVistos = new Set<number>();

  nivelesFiltrados.forEach((n) => {
    if (!idsVistos.has(n.id)) {
      idsVistos.add(n.id);
      nivelesUnicos.push(n);
    }
  });

  return nivelesUnicos;
};

export const crearParametroAPI = async (payload: ParametroClasificacion) => {
  const response = await apiClient.post("/fases", payload);
  return response.data;
};
