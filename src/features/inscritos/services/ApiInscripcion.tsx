import apiClient from "../../../api/ApiPhp";
import type { InscripcionPayload } from "../types/indexInscritos";

export const importarCompetidoresAPI = async (payload: InscripcionPayload[]) => {
    const response = await apiClient.post('/competidores/importar', { competidores: payload });
    return response.data;
};