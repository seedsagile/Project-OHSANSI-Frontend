import apiClient from '../../../api/ApiPhp';
import type { Area, CrearAreaData } from '../types';
import type { Nivel } from '../../niveles/types';
import { AxiosError } from 'axios';

type ApiErrorResponse = { message?: string; error?: string; };

export const areasService = {
    async obtenerAreas(): Promise<Area[]> {
        const response = await apiClient.get<Area[]>('/area');
        return response.data;
    },

    async crearArea(data: CrearAreaData): Promise<Area> {
        // ... (código sin cambios)
    },

    // --- AÑADIR ESTAS NUEVAS FUNCIONES ---
    async obtenerNivelesPorArea(id_area: number): Promise<Nivel[]> {
        const response = await apiClient.get<Nivel[]>(`/area/${id_area}/niveles`);
        return response.data;
    },

    async actualizarNivelesDeArea(id_area: number, ids_niveles: number[]): Promise<void> {
        await apiClient.put(`/area/${id_area}/niveles`, { niveles: ids_niveles });
    }
};