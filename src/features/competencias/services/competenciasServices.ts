// src/features/competencias/services/competenciasService.ts
import axios from 'axios';
import type { 
  Competencia, 
  CrearCompetenciaData, 
  AreasConNivelesResponse 
} from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

export const competenciasService = {
  // Obtener áreas con niveles del responsable usando su ID
  obtenerAreasConNiveles: async (idResponsable: number): Promise<AreasConNivelesResponse> => {
    try {
      console.log('📡 [Service] Llamando API:', `${API_BASE_URL}/responsables/${idResponsable}/areas-con-niveles/olimpiada-actual`);
      
      const response = await axios.get(
        `${API_BASE_URL}/responsables/${idResponsable}/areas-con-niveles/olimpiada-actual`
      );
      
      console.log('✅ [Service] Respuesta recibida:', response.data);
      console.log('📊 [Service] Status:', response.status);
      
      // Verificar estructura de datos
      if (!response.data || !response.data.areas) {
        console.error('❌ [Service] Estructura de datos incorrecta:', response.data);
        throw new Error('El API no devolvió la estructura esperada');
      }
      
      // Convertir los IDs de string a number si es necesario
      const datosConvertidos: AreasConNivelesResponse = {
        areas: response.data.areas.map((area: any) => ({
          id_area: Number(area.id_area),
          area: area.area,
          niveles: area.niveles.map((nivel: any) => ({
            id_area_nivel: Number(nivel.id_area_nivel),
            id_nivel: Number(nivel.id_nivel),
            nombre: nivel.nombre,
          })),
        })),
      };
      
      console.log('🔄 [Service] Datos convertidos:', datosConvertidos);
      
      return datosConvertidos;
    } catch (error) {
      console.error('❌ [Service] Error en obtenerAreasConNiveles:', error);
      if (axios.isAxiosError(error)) {
        console.error('📋 [Service] Detalles del error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
      }
      throw error;
    }
  },

  // Crear nueva competencia
  crearCompetencia: async (data: CrearCompetenciaData): Promise<Competencia> => {
    try {
      console.log('📡 [Service] Creando competencia:', data);
      
      const response = await axios.post(`${API_BASE_URL}/competencias`, data);
      
      console.log('✅ [Service] Competencia creada:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ [Service] Error al crear competencia:', error);
      if (axios.isAxiosError(error)) {
        console.error('📋 [Service] Detalles del error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        throw new Error(error.response?.data?.message || 'Error al crear la competencia');
      }
      throw error;
    }
  },
};