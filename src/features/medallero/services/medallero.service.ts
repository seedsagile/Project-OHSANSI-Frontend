// src/features/medallero/services/medallero.service.ts

import { AreasResponse, NivelesResponse, MedalleroSaveData } from '../types/medallero.types';

const BASE_URL = 'http://127.0.0.1:8000/api';

export const medalleroService = {
  async getAreasByResponsable(userId: number): Promise<AreasResponse> {
    const response = await fetch(`${BASE_URL}/responsableGestion/${userId}`);
    if (!response.ok) throw new Error('Error al obtener áreas');
    return response.json();
  },

  async getNivelesByArea(areaId: number): Promise<NivelesResponse> {
    const response = await fetch(`${BASE_URL}/medallero/area/${areaId}/niveles`);
    if (!response.ok) throw new Error('Error al obtener niveles');
    return response.json();
  },

  async saveMedallero(data: MedalleroSaveData[]): Promise<{ success: boolean }> {
    const response = await fetch(`${BASE_URL}/medallero/configuracion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ niveles: data }),
    });
    if (!response.ok) throw new Error('Error al guardar medallero');
    return response.json();
  }
};