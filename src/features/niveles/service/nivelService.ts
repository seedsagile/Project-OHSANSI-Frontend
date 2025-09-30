import axios from "axios";
import type { Nivel } from "../interface/interfaceNivel";

const API_URL = "http://localhost:8000/api";

// ✅ Obtener todos los niveles
export const getNiveles = async (): Promise<Nivel[]> => {
  try {
    const response = await axios.get(`${API_URL}/niveles`);
    return response.data.data || [];
  } catch (error) {
    console.error("Error al obtener los niveles:", error);
    throw error;
  }
};

// ✅ Obtener un nivel por ID
export const getNivelById = async (id: number): Promise<Nivel> => {
  try {
    const response = await axios.get(`${API_URL}/niveles/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener el nivel con id ${id}:`, error);
    throw error;
  }
};

// ✅ Crear un nuevo nivel (solo nombre y id_area)
export const createNivel = async (nuevoNivel: {
  nombre: string;
  id_area: number;
}): Promise<Nivel> => {
  try {
    const response = await axios.post(`${API_URL}/niveles`, {
      nombre: nuevoNivel.nombre,
      id_area: nuevoNivel.id_area,
    });
    return response.data.nivel || response.data; // depende de lo que devuelva tu backend
  } catch (error) {
    console.error("Error al crear el nivel:", error);
    throw error;
  }
};
