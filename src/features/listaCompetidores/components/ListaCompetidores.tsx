import { useEffect, useState } from 'react';
import { getAreasPorResponsableAPI, getCompetidoresAPI } from '../service/service';
import type { Area } from '../interface/interface';
import { AccordionArea } from './AccordionArea';
import { AccordionNivel } from './AccordionNivel';
import { AccordionGrado } from './AccordionGrado';
import { AccordionDepartamento } from './AccordionDepartamento';
import { AccordionGenero } from './AccordionGenero';

interface Competidor {
  nombre: string;
  apellido: string;
  area: string;
  nivel: string;
  grado: string;
  ci: string;
  Genero?: string;
  Departamento?: string;
  Colegio?: string;
}

export const ListaCompetidores = () => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [competidores, setCompetidores] = useState<Competidor[]>([]);
  const [loadingAreas, setLoadingAreas] = useState(true);
  const [loadingCompetidores, setLoadingCompetidores] = useState(true);
  const [nivelesSeleccionados, setNivelesSeleccionados] = useState<{
    [area: string]: number | null;
  }>({});

  const responsableId = 4;

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const data = await getAreasPorResponsableAPI(responsableId);
        if (Array.isArray(data)) setAreas(data);
        else if (Array.isArray(data.areas)) setAreas(data.areas);
        else setAreas([]);
      } catch (error) {
        console.error('Error al obtener áreas:', error);
        setAreas([]);
      } finally {
        setLoadingAreas(false);
      }
    };
    fetchAreas();
  }, []);

  const fetchCompetidores = async (id_area = 0, id_nivel = 0) => {
    try {
      setLoadingCompetidores(true);
      const data = await getCompetidoresAPI(responsableId, id_area, id_nivel);
      setCompetidores(data.original || []);
    } catch (error) {
      console.error('Error al obtener competidores:', error);
      setCompetidores([]);
    } finally {
      setLoadingCompetidores(false);
    }
  };

  useEffect(() => {
    fetchCompetidores();
  }, []);

  const handleMostrarTodo = () => fetchCompetidores(0, 0);

  return (
    <div className="bg-gradient-to-b from-principal-100 via-blanco to-principal-50 min-h-screen flex items-center justify-center p-4 font-display">
      <main className="bg-blanco w-full max-w-7xl rounded-2xl shadow-lg p-6 md:p-10">
        <header className="flex flex-col mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-principal-800 tracking-tight text-center mb-6 animate-fade-in">
            Listado de Competidores
          </h1>

          <div className="flex flex-col md:flex-row gap-6 mb-8">
            {/* 🔹 Acordeones a la izquierda */}
            <div className="flex flex-col space-y-4 w-60">
              <button
                onClick={handleMostrarTodo}
                className="flex items-center justify-between w-full px-6 py-2.5 rounded-lg bg-principal-500 text-blanco font-semibold hover:bg-principal-600 transition-colors"
              >
                <span>Mostrar Todo</span>
              </button>
              <AccordionArea
                areas={areas}
                loading={loadingAreas}
                onSelectArea={(id_area) => fetchCompetidores(id_area, 0)}
              />
              <AccordionNivel
                data={areas.map((area) => ({
                  areaNombre: area.nombre,
                  niveles: area.niveles || [],
                }))}
                selectedNiveles={nivelesSeleccionados}
                onChangeSelected={(newSelected) => {
                  setNivelesSeleccionados(newSelected);
                  const primerArea = Object.keys(newSelected)[0];
                  const nivelId = newSelected[primerArea] || 0;
                  const areaId = areas.find((a) => a.nombre === primerArea)?.id_area || 0;
                  fetchCompetidores(areaId, nivelId);
                }}
              />
              <AccordionGrado />
              <AccordionDepartamento />
              <AccordionGenero />

              <button className="flex items-center justify-between w-full px-6 py-2.5 rounded-lg bg-principal-500 text-blanco font-semibold hover:bg-principal-600 transition-colors">
                <span>Descargar PDF</span>
              </button>
              <button className="flex items-center justify-between w-full px-6 py-2.5 rounded-lg bg-principal-500 text-blanco font-semibold hover:bg-principal-600 transition-colors">
                <span>Descargar EXCEL</span>
              </button>
            </div>

            {/* 🔹 Tabla y buscador a la derecha */}
            <div className="flex-1 flex flex-col gap-4">
              {/* Buscador alineado a la derecha */}
              <div className="flex justify-end gap-2">
                <input
                  type="text"
                  placeholder="Buscar: nombre, apellido, colegio"
                  className="px-4 py-2 rounded-xl border-2 border-principal-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-principal-300 transition w-72"
                />
                <button className="px-6 py-2.5 rounded-lg bg-principal-500 text-blanco font-semibold hover:bg-principal-600 transition-colors">
                  Buscar
                </button>
              </div>

              <div className="overflow-x-auto">
                <div className="max-h-[1000px] overflow-y-auto scrollbar-thin scrollbar-thumb-principal-300 scrollbar-track-transparent rounded-lg border border-principal-200 shadow-inner">
                  <table className="w-full border-collapse text-sm md:text-base min-w-[900px]">
                    <thead className="bg-principal-500 text-white sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 md:px-6 text-left font-semibold">Apellido</th>
                        <th className="px-4 py-3 md:px-6 text-left font-semibold">Nombre</th>
                        <th className="px-4 py-3 md:px-6 text-left font-semibold">Género</th>
                        <th className="px-4 py-3 md:px-6 text-left font-semibold">Departamento</th>
                        <th className="px-4 py-3 md:px-6 text-left font-semibold">Colegio</th>
                        <th className="px-4 py-3 md:px-6 text-left font-semibold">CI</th>
                        <th className="px-4 py-3 md:px-6 text-left font-semibold">Área</th>
                        <th className="px-4 py-3 md:px-6 text-left font-semibold">Nivel</th>
                        <th className="px-4 py-3 md:px-6 text-left font-semibold">Grado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingCompetidores ? (
                        <tr>
                          <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                            Cargando competidores...
                          </td>
                        </tr>
                      ) : competidores.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                            No hay competidores registrados
                          </td>
                        </tr>
                      ) : (
                        competidores.map((c, i) => (
                          <tr
                            key={i}
                            className={`border-b transition-colors ${
                              i % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                            } hover:bg-principal-100/50`}
                          >
                            <td className="px-4 py-3 md:px-6">{c.apellido}</td>
                            <td className="px-4 py-3 md:px-6">{c.nombre}</td>
                            <td className="px-4 py-3 md:px-6">{c.Genero || '-'}</td>
                            <td className="px-4 py-3 md:px-6">{c.Departamento || '-'}</td>
                            <td className="px-4 py-3 md:px-6">{c.Colegio || '-'}</td>
                            <td className="px-4 py-3 md:px-6">{c.ci}</td>
                            <td className="px-4 py-3 md:px-6">{c.area}</td>
                            <td className="px-4 py-3 md:px-6">{c.nivel}</td>
                            <td className="px-4 py-3 md:px-6">{c.grado}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </header>
      </main>
    </div>
  );
};
