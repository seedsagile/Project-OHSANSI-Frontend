import apiClient from "../../../api/ApiPhp";
import type { AreaInterface } from "../interface/AreaInterface";

export const asignarResponsableAPI = async (payload: AreaInterface) => {
  const response = await apiClient.post("/responsableArea", payload);
  return response.data;
};

// Nuevo: obtener todos los responsables
export const obtenerResponsablesAPI = async () => {
  const response = await apiClient.get("/responsableArea");
  return response.data; // asumimos que data es un array de responsables
};
