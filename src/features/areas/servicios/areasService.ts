// src/features/areas/servicios/areasService.ts
import type { Area, CrearAreaData } from '../tipos';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const areasService = {
    async obtenerAreas(): Promise<Area[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/area`);
            
            if (!response.ok) {
                throw new Error(`Error al obtener áreas: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error al obtener áreas:', error);
            throw new Error('Error de conexión al servidor');
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
                let mensaje = 'Error al crear el área';
                
                if (response.status === 409) {
                    mensaje = 'Ya existe un área con este nombre';
                } else if (response.status === 422 || response.status === 400) {
                    mensaje = 'Los datos ingresados no son válidos';
                } else if (response.status >= 500) {
                    mensaje = 'Error interno del servidor. Intente nuevamente';
                }

                throw new Error(mensaje);
            }

            return await response.json();
        } catch (error) {
            console.error('Error al crear área:', error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Error de conexión al servidor');
        }
    }
};