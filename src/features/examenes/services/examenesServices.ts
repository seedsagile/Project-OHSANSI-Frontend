// src/features/examenes/services/examenesService.ts
import axios from 'axios';
import type { Examen, CrearExamenData } from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

export const examenesService = {
  // Obtener exámenes de una competencia
  obtenerExamenesPorCompetencia: async (idCompetencia: number): Promise<Examen[]> => {
    try {
      console.log('📡 [ExamenesService] Obteniendo exámenes para competencia:', idCompetencia);
      
      const response = await axios.get(
        `${API_BASE_URL}/competencias/${idCompetencia}/examenes`
      );
      
      console.log('✅ [ExamenesService] Exámenes recibidos:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ [ExamenesService] Error al obtener exámenes:', error);
      if (axios.isAxiosError(error)) {
        console.error('📋 [ExamenesService] Detalles del error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
      }
      throw error;
    }
  },

  // Crear nuevo examen para una competencia
  crearExamen: async (
    idCompetencia: number,
    data: CrearExamenData
  ): Promise<Examen> => {
    try {
      console.log('📡 [ExamenesService] Creando examen para competencia:', idCompetencia);
      console.log('📋 [ExamenesService] Datos del examen:', data);
      
      const response = await axios.post(
        `${API_BASE_URL}/competencias/${idCompetencia}/examenes`,
        data
      );
      
      console.log('✅ [ExamenesService] Examen creado:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ [ExamenesService] Error al crear examen:', error);
      if (axios.isAxiosError(error)) {
        console.error('📋 [ExamenesService] Detalles del error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        throw new Error(
          error.response?.data?.message || 'Error al crear el examen'
        );
      }
      throw error;
    }
  },
};