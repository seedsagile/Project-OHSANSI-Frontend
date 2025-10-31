import apiClient from '../../../api/ApiPhp';
import type { Area, Nivel, ParametroClasificacion } from '../interface/interface';

// ===============================
// 🟩 Obtener todas las Áreas
// ===============================
export const obtenerAreasAPI = async (): Promise<Area[]> => {
  const response = await apiClient.get('/areas-nombres');
  const nombresAreas = response.data.data.nombres_areas;

  // Convertir el objeto { "1": "Matemáticas", "2": "Física" } en un array de objetos
  const areas = Object.entries(nombresAreas).map(([id, nombre]) => ({
    id: Number(id),
    nombre: nombre as string,
  }));

  return areas;
};

// ✅ Trae las áreas junto con sus niveles (endpoint: /areas-con-niveles)
export const obtenerAreasConNivelesAPI = async (): Promise<Area[]> => {
  const response = await apiClient.get('/areas-con-niveles');

  const areas = response.data.data.map((a: any) => ({
    id: a.id_area,
    nombre: a.nombre,
    niveles: Array.isArray(a.niveles)
      ? a.niveles.map((n: any) => ({
          id: n.id_nivel, // <-- convertir correctamente
          nombre: n.nombre,
          asignado_activo: n.asignado_activo, // opcional si lo necesitas luego
        }))
      : [],
  }));

  return areas;
};

// ===============================
// 🟦 Crear Parámetro de Clasificación
// ===============================
export const crearParametroAPI = async (payload: ParametroClasificacion) => {
  const response = await apiClient.post('/parametros', payload);
  return response.data;
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
  const response = await apiClient.get('/parametros/gestion-actual');
  return response.data.data.map((p: any) => ({
    id: p.id_parametro,
    gestion: p.area_nivel.olimpiada.gestion,
    area: p.area_nivel.area.nombre,
    nivel: p.area_nivel.nivel.nombre,
    notaMinima: p.nota_min_clasif,
    notaMaxima: p.nota_max_clasif,
    cantidadMaxima: p.cantidad_max_apro,
  }));
};
// ===============================
// 🟩 Obtener Áreas por Gestión
// ===============================
export const obtenerAreasPorGestionAPI = async (gestion: string): Promise<Area[]> => {
  const response = await apiClient.get(`/area-nivel/gestion/${gestion}`);
  return response.data.data.map((a: any) => ({
    id: a.id_area,
    nombre: a.nombre,
    niveles: a.niveles.map((n: any) => ({
      id: n.id_nivel,
      nombre: n.nombre,
    })),
  }));
};
