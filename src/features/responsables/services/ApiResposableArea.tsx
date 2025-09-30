import apiClient from "../../../api/ApiPhp";
import type { PayloadResponsable } from "../tipos/IndexResponsable";

export const asignarResponsableAPI = async (payload: PayloadResponsable) => {
    const response = await apiClient.post('/responsableArea', payload);
    return response.data;
};