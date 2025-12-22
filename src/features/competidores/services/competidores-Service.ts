import apiClient from '../../../api/ApiPhp';
import type { Nivel } from '../types/nivel-Type';

/**
 * 🔹 Obtener todos los competidores de un responsable (sin filtrar)
 * Ejemplo: GET /listaCompleta/4/0/0/0
 */
export const getTodosCompetidoresPorResponsableAPI = async (id_responsable: number) => {
  const response = await apiClient.get(`/listaCompleta/${id_responsable}/0/0/0`);
  return response.data;
};

/**
 * 🔹 Obtener solo las áreas de un responsable
 * GET /responsable/{id_responsable}
 */
export const getAreasPorResponsableAPI = async (id_responsable: number) => {
  const response = await apiClient.get(`/responsable/${id_responsable}`);
  return response.data.data?.areas || []; // asumiendo que la respuesta viene como { areas: [...] }
};

/**
 * 🔹 Obtener los niveles de un área específica
 * GET /niveles/{idArea}
 */

export const getNivelesPorAreaAPI = async (idArea: number): Promise<Nivel[]> => {
  try {
    const response = await apiClient.get(`/niveles/${idArea}/area`);
    const data = response.data?.data;

    if (!data || !Array.isArray(data.niveles)) return [];

    // ✅ Normalizamos los nombres de las propiedades
    return data.niveles.map((n: any) => ({
      id_nivel: n.id_nivel,
      nombre: n.nombre_nivel, // 👈 convertir nombre_nivel → nombre
    }));
  } catch (error) {
    console.error(`Error al obtener niveles del área ${idArea}:`, error);
    return [];
  }
};

/**
 * 🔹 Obtener todos los grados escolares
 * GET /grado
 */
export const getGradosAPI = async () => {
  try {
    const response = await apiClient.get('/grado');
    const data = response.data?.data;

    if (!data || !Array.isArray(data.grados)) return [];

    return data.grados.map((grado: any) => ({
      id_grado_escolaridad: grado.id_grado_escolaridad,
      nombre: grado.nombre,
      created_at: grado.created_at,
      updated_at: grado.updated_at,
    }));
  } catch (error) {
    console.error('Error al obtener los grados:', error);
    return [];
  }
};

/**
 * 🔹 Obtener todos los géneros
 * GET /generos
 */
export const getGenerosAPI = async () => {
  try {
    const response = await apiClient.get('/generos');
    const data = response.data?.data;

    if (!data || !Array.isArray(data.generos)) return [];

    // ✅ Normalizamos la estructura
    return data.generos.map((genero: any) => ({
      id: genero.id,
      nombre: genero.nombre,
    }));
  } catch (error) {
    console.error('Error al obtener los géneros:', error);
    return [];
  }
};

//recibier todos los filtros
export const getCompetidoresFiltradosAPI = async (
  id_responsable: number,
  idAreas: string = '0', // <- cambiar a string
  idNivel: number | number[] = 0,
  idGrado: number = 0,
  genero?: string,
  departamento?: string
) => {
  let url = `/listaCompleta/${id_responsable}/${idAreas}/${idNivel}/${idGrado}`;
  if (genero) url += `/${genero}`;
  if (departamento) url += `/${encodeURIComponent(departamento)}`;

  const response = await apiClient.get(url);
  return response.data;
};

/**
 * 🔹 Obtener grados por área y nivel
 * GET /grados/{idArea}/nivel/{idNivel}
 */
export const getGradosPorAreaYNivelAPI = async (idArea: number, idNivel: number) => {
  try {
    const response = await apiClient.get(`/grados/${idArea}/nivel/${idNivel}`);
    const data = response.data?.data;

    if (!data || !Array.isArray(data.grados)) return [];

    // Normalización de la respuesta
    return data.grados.map((grado: any) => ({
      id_grado_escolaridad: grado.id_grado_escolaridad,
      nombre: grado.nombre,
      created_at: grado.created_at,
      updated_at: grado.updated_at,
    }));
  } catch (error) {
    console.error(`Error al obtener grados del área ${idArea} y nivel ${idNivel}:`, error);
    return [];
  }
};
