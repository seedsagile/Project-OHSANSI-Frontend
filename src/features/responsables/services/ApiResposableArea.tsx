import apiClient from "../../../api/ApiPhp";
import type { AreaInterface } from "../interface/AreaInterface";

export const asignarResponsableAPI = async (payload: AreaInterface) => {
  const response = await apiClient.post("/responsableArea", payload);
  return response.data;
};
