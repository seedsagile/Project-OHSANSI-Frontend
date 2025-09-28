// services/faseService.ts
import axios from "axios";

// Tipo que viene del backend
interface FaseBackend {
  Nota_minima_clasificacion?: number;
  cantidad_maxima_de_clasificados?: number;
  nombre: string;
  orden: number;
  descripcion?: string;
}

// Tipo usado en frontend
export interface ParametroClasificacion {
  valor: number; // puede ser nota mínima o cantidad máxima
  nombre: string;
  orden: number;
  descripcion?: string;
}

const API_URL = "http://127.0.0.1:8000/api/fases";

export const getFases = async (): Promise<ParametroClasificacion[]> => {
  try {
    const response = await axios.get<{ data: FaseBackend[] }>(API_URL);

    return (
      response.data.data?.map((item) => ({
        valor:
          item.Nota_minima_clasificacion ??
          item.cantidad_maxima_de_clasificados ??
          0,
        nombre: item.nombre,
        orden: item.orden,
        descripcion: item.descripcion,
      })) || []
    );
  } catch (error) {
    console.error("Error al obtener las fases:", error);
    throw error;
  }
};

export const crearFase = async (
  fase: ParametroClasificacion
): Promise<ParametroClasificacion> => {
  try {
    const body: FaseBackend = {
      Nota_minima_clasificacion: fase.valor,
      cantidad_maxima_de_clasificados: fase.valor,
      nombre: fase.nombre,
      orden: fase.orden,
      descripcion: fase.descripcion,
    };

    const response = await axios.post<FaseBackend>(API_URL, body);
    const data = response.data;

    return {
      valor:
        data.Nota_minima_clasificacion ??
        data.cantidad_maxima_de_clasificados ??
        0,
      nombre: data.nombre,
      orden: data.orden,
      descripcion: data.descripcion,
    };
  } catch (error) {
    console.error("Error al crear la fase:", error);
    throw error;
  }
};
