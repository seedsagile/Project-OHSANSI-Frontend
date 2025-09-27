// src/services/nivelService.ts
import axios from "axios";
import type { Nivel } from "../interface/interfaceNivel";

const API_URL = "http://localhost:8000/api"; // Ajusta según tu backend

export const getNiveles = async (): Promise<Nivel[]> => {
  try {
    const response = await axios.get<Nivel[]>(`${API_URL}/niveles`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener los niveles:", error);
    throw error;
  }
};

export const createNivel = async (nuevoNivel: Nivel): Promise<Nivel> => {
  try {
    const response = await axios.post<{ nivel: Nivel }>(
      `${API_URL}/niveles`,
      nuevoNivel
    );
    return response.data.nivel;
  } catch (error) {
    console.error("Error al crear el nivel:", error);
    throw error;
  }
};
