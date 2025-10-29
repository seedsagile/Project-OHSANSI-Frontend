// src/features/service/service.ts
import apiClient from '../../../api/ApiPhp';
import type { Area, Nivel } from '../interface/interface';

/**
 * 🔹 Obtener todas las ÁREAS de un responsable
 * Ejemplo: GET /responsable/4
 * Devuelve:
 * [
 *   { "id_area": 1, "nombre": "Matemáticas" },
 *   { "id_area": 2, "nombre": "Física" }
 * ]
 */
export const getAreasPorResponsableAPI = async (id_responsable: number): Promise<Area[]> => {
  const response = await apiClient.get<Area[]>(`/responsable/${id_responsable}`);
  return response.data;
};

/**
 * 🔹 Obtener todos los NIVELES de un área
 * Ejemplo: GET /niveles/2
 * Devuelve:
 * [
 *   { "id_nivel": 1, "nombre": "1ro de Secundaria" },
 *   { "id_nivel": 2, "nombre": "2do de Secundaria" }
 * ]
 */
export const getNivelesPorAreaAPI = async (id_area: number): Promise<Nivel[]> => {
  const response = await apiClient.get<Nivel[]>(`/niveles/${id_area}`);
  return response.data;
};

/**
 * 🔹 Obtener lista de competidores (estudiantes) según filtros
 * Ejemplo:
 *  - Todos los estudiantes del responsable 4 → /listaCompleta/4/0/0
 *  - Filtrando por área 2 → /listaCompleta/4/2/0
 *  - Filtrando por área y nivel → /listaCompleta/4/2/1
 *
 * Devuelve:
 * {
 *   "headers": {},
 *   "original": [
 *     { "nombre": "Juan", "apellido": "Angel", "area": "Matemáticas", ... }
 *   ],
 *   "exception": null
 * }
 */
export const getCompetidoresAPI = async (
  id_responsable: number,
  id_area: number = 0,
  id_nivel: number = 0
) => {
  const response = await apiClient.get(`/listaCompleta/${id_responsable}/${id_area}/${id_nivel}`);
  return response.data;
};
