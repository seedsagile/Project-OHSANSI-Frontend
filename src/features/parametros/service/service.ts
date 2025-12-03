import apiClient from '../../../api/ApiPhp';
import type { Area, Nivel, ParametroClasificacion } from '../interface/interface';

export const obtenerAreasAPI = async (): Promise<Area[]> => {
  try {
    const response = await apiClient.get('/area/gestion/2025');
    const data = response.data.data;

    if (!Array.isArray(data)) {
      console.error('Formato inesperado de áreas:', data);
      return [];
    }

    // Convertimos cada objeto del backend al tipo Area esperado
    return data.map((a: any) => ({
      id: a.id_area,
      nombre: a.nombre,
    }));
  } catch (error) {
    console.error('Error al obtener áreas:', error);
    throw error;
  }
};

// ===============================
// 🟦 Crear Parámetro de Clasificación
// ===============================
export const crearParametroAPI = async (payload: ParametroClasificacion) => {
  const response = await apiClient.post('/parametros', payload);
  return response.data;
};

// ===============================
// 🟨 Obtener niveles por área seleccionada
// ===============================
export const obtenerNivelesPorAreaAPI = async (id_area: number): Promise<Nivel[]> => {
  try {
    const response = await apiClient.get(`/area-nivel/gestion/2025/area/${id_area}`);

    const nivelesAgrupados = response.data.data.niveles_con_grados_agrupados;
    const nivelesIndividuales = response.data.data.niveles_individuales;

    // Agregamos el id_area_nivel correspondiente por nombre
    const niveles: Nivel[] = nivelesAgrupados.map((nivel: any) => {
      // Buscar coincidencias en niveles_individuales según el nombre
      const coincidencias = nivelesIndividuales.filter(
        (n: any) => n.nivel.nombre === nivel.nombre_nivel
      );

      // Retornar los grados y los ids de área_nivel que coinciden
      return {
        id: nivel.id_nivel,
        nombre: nivel.nombre_nivel,
        grados: nivel.grados.map((g: any) => ({
          id: g.id_grado_escolaridad,
          nombre: g.nombre,
        })),
        areaNiveles: coincidencias.map((n: any) => n.id_area_nivel), // 🔹 aquí guardamos los ids
      };
    });

    return niveles;
  } catch (error) {
    console.error('Error al obtener niveles por área:', error);

    throw error;
  }
};

// ===============================
// 🟪 Obtener parámetros por olimpiada (gestiones pasadas)
// ===============================
// ✅ Obtener parámetros de todas las gestiones (según tu backend actual)
export const obtenerParametrosPorOlimpiadaAPI = async () => {
  const response = await apiClient.get(`/parametros/gestiones`);

  // Aplanar los datos para que cada parámetro tenga la info completa
  const gestiones = response.data.data;

  const parametrosFormateados = gestiones.flatMap((g: any) =>
    g.parametros.map((p: any) => ({
      id: p.id_area_nivel,
      gestion: g.gestion,
      area: p.nombre_area,
      nivel: p.nombre_nivel,
      notaMinima: p.nota_minima,
      notaMaxima: p.nota_maxima,
      cantidadMaxima: p.cant_max_clasificados,
    }))
  );

  return parametrosFormateados;
};

// ===============================
// 🟩 Obtener parámetros de la gestión actual
// ===============================
export const obtenerParametrosGestionActualAPI = async () => {
  try {
    const response = await apiClient.get(`/parametros/gestion-actual`);
    return response.data.data; // contiene los parámetros ya registrados
  } catch (error) {
    console.error('Error al obtener parámetros de la gestión actual:', error);
    throw error;
  }
};
