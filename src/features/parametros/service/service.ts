import apiClient from '../../../api/ApiPhp';
import type { Area, Nivel, ParametroClasificacion } from '../interface/interface';

// ===============================
// 🟩 Obtener todas las Áreas
// ===============================
export const obtenerAreasAPI = async (): Promise<Area[]> => {
  const response = await apiClient.get('/area');
  return response.data.map((a: { id_area: number; nombre: string }) => ({
    id: a.id_area,
    nombre: a.nombre,
  }));
};

// ===============================
// 🟨 Obtener Niveles por Área
// ===============================
export const obtenerNivelesPorAreaAPI = async (id_area: number): Promise<Nivel[]> => {
  const response = await apiClient.get('/areas-con-niveles');
  const areas = response.data.data;

  const areaEncontrada = areas.find((a: { id_area: number }) => a.id_area === id_area);
  if (!areaEncontrada) return [];

  return areaEncontrada.niveles.map((n: { id_nivel: number; nombre: string }) => ({
    id: n.id_nivel,
    nombre: n.nombre,
  }));
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
export const obtenerParametrosPorOlimpiadaAPI = async (id_olimpiada: number) => {
  const response = await apiClient.get(`/parametros/${id_olimpiada}`);
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
