// src/features/areas/services/areasService.ts
import apiClient from '../../../api/ApiPhp'; // Asegúrate de que la ruta sea correcta
import type { Area, CrearAreaData } from '../types';
import { AxiosError } from 'axios';

type ApiErrorResponse = {
    message?: string;
    error?: string;
};

export const areasService = {
    async obtenerAreas(): Promise<Area[]> {
        const response = await apiClient.get<Area[]>('/area');
        return response.data;
    },

    async crearArea(data: CrearAreaData): Promise<Area> {
        try {
            const response = await apiClient.post<Area>('/area', data);
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                const apiError = error.response?.data as ApiErrorResponse;
                if (error.response?.status === 409) {
                    throw new Error('Ya existe un área con este nombre.');
                }
                throw new Error(apiError?.message || 'Ocurrió un error al crear el área.');
            }
            throw new Error('Error de conexión al servidor.');
        }
    }
};