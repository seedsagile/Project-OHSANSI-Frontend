// src/service/service.ts
import apiClient from "../../../api/ApiPhp";
import type { Area } from "../../areas/types/index";

// Obtener todas las áreas
export const getAreasAPI = async (): Promise<Area[]> => {
  const response = await apiClient.get("/area");
  return response.data;
};

// Obtener los niveles asociados a un área específica
export const getAreaNivelesAPI = async (id_area: number) => {
  const response = await apiClient.get(`/area-niveles/${id_area}`);
  return response.data;
};
