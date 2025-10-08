import apiClient from "../../../api/ApiPhp";

// Definimos el tipo de payload para mayor seguridad en TS
export interface PayloadParametro {
  nota_minima_clasificacion: number;
  cantidad_maxima_de_clasificados: number;
}

export const crearParametroAPI = async (payload: PayloadParametro) => {
  const response = await apiClient.post("/fases", payload);
  return response.data;
};
