import axios from "axios";
import type { Nivel } from "../interface/interfaceNivel";

const API_URL = "http://localhost:8000/api";

export const getNiveles = async (): Promise<Nivel[]> => {
  try {
    const response = await axios.get(`${API_URL}/niveles`);
    // Devuelve directamente el array de niveles
    return response.data.data || [];
  } catch (error) {
    console.error("Error al obtener los niveles:", error);
    throw error;
  }
};

export const createNivel = async (nuevoNivel: Nivel): Promise<Nivel> => {
  try {
    const response = await axios.post(`${API_URL}/niveles`, nuevoNivel);
    // Ajusta según lo que tu backend devuelve al crear
    return response.data.nivel;
  } catch (error) {
    console.error("Error al crear el nivel:", error);
    throw error;
  }
};
