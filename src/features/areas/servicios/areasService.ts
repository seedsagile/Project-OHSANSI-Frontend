import type { Area, CrearAreaData } from '../tipos';

const API_BASE_URL = 'http://127.0.0.1:8000/api';//de la Maria su api

export const areasService = {
    async obtenerAreas(): Promise<Area[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/area`);
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error al obtener áreas:', error);
            throw error;
        }
    },
    async crearArea(data: CrearAreaData): Promise<Area> {
        try {
            const response = await fetch(`${API_BASE_URL}/area`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error al crear área:', error);
            throw error;
        }
    }
};