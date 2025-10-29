import { useEffect, useState } from 'react';
import { AccordionArea } from './AccordionArea';
import { AccordionNivel } from './AccordionNivel';
import {
  getAreasPorResponsableAPI,
  getNivelesPorAreaAPI,
  getCompetidoresAPI,
} from '../service/service';
import type { Nivel, Area } from '../interface/interface';

interface Competidor {
  nombre: string;
  apellido: string;
  area: string;
  nivel: string;
  grado: string;
  ci: string;
}

export const ListaCompetidores = () => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [competidores, setCompetidores] = useState<Competidor[]>([]);
  const [areaNiveles, setAreaNiveles] = useState<{ areaNombre: string; niveles: Nivel[] }[]>([]);

  const [selectedAreas, setSelectedAreas] = useState<Area[]>([]);
  const [selectedNiveles, setSelectedNiveles] = useState<{ [areaNombre: string]: number | null }>(
    {}
  );

  const [loadingAreas, setLoadingAreas] = useState(true);
  const [loadingCompetidores, setLoadingCompetidores] = useState(true);

  const responsableId = 4;

  /** 🔹 Cargar Áreas del responsable */
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const data = await getAreasPorResponsableAPI(responsableId);
        setAreas(data);
      } catch (error) {
        console.error('Error al obtener áreas:', error);
      } finally {
        setLoadingAreas(false);
      }
    };
    fetchAreas();
  }, []);

  /** 🔹 Cargar competidores */
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

  /** 🔹 Manejar selección de áreas */
  const handleSelectedAreas = async (selected: Area[]) => {
    setSelectedAreas(selected);

    if (selected.length === 0) {
      setAreaNiveles([]);
      setSelectedNiveles({});
      await fetchCompetidores(0, 0);
      return;
    }

    // Cargar niveles de todas las áreas seleccionadas
    const nivelesPorArea = await Promise.all(
      selected.map(async (area) => {
        const niveles = await getNivelesPorAreaAPI(area.id_area);
        return { areaNombre: area.nombre, niveles };
      })
    );
    setAreaNiveles(nivelesPorArea);

    // 🔹 Mostrar competidores de todas las áreas seleccionadas
    let todos: Competidor[] = [];
    for (const area of selected) {
      const data = await getCompetidoresAPI(responsableId, area.id_area, 0);
      todos = todos.concat(data.original || []);
    }
    setCompetidores(todos);
  };

  /** 🔹 Manejar selección de niveles */
  const handleSelectedNiveles = async (niveles: { [areaNombre: string]: number | null }) => {
    setSelectedNiveles(niveles);

    if (selectedAreas.length === 0) return;

    let todos: Competidor[] = [];

    for (const area of selectedAreas) {
      const nivelId = niveles[area.nombre];
      if (nivelId) {
        const data = await getCompetidoresAPI(responsableId, area.id_area, nivelId);
        todos = todos.concat(data.original || []);
      }
    }

    setCompetidores(todos);
  };

  /** 🔹 Mostrar todos los competidores */
  const handleMostrarTodo = () => {
    setSelectedAreas([]);
    setSelectedNiveles({});
    setAreaNiveles([]);
    fetchCompetidores(0, 0);
  };

  return (
    <div className="bg-neutro-100 min-h-screen flex items-center justify-center p-4 font-display">
      <main className="bg-blanco w-full max-w-5xl rounded-xl shadow-sombra-3 p-8">
        <header className="flex flex-col mb-10">
          <h1 className="text-4xl font-extrabold text-negro tracking-tighter text-center mb-8">
            Listar competidores
          </h1>

          <div className="flex justify-end items-start gap-4 mb-6">
            <button
              onClick={handleMostrarTodo}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-principal-500 text-blanco font-semibold hover:bg-principal-600 transition-colors"
            >
              Mostrar Todo
            </button>

            {loadingAreas ? (
              <span>Cargando áreas...</span>
            ) : (
              <AccordionArea
                areas={areas}
                selectedAreas={selectedAreas}
                onChangeSelected={handleSelectedAreas}
              />
            )}

            <AccordionNivel
              data={areaNiveles}
              selectedNiveles={selectedNiveles}
              onChangeSelected={handleSelectedNiveles}
            />
          </div>

          {/* Tabla */}
          <div className="w-full overflow-x-auto">
            <div className="max-h-[950px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent rounded-lg border border-gray-200">
              <table className="w-full border-collapse">
                <thead className="bg-principal-500 text-blanco text-left sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Nombre</th>
                    <th className="px-6 py-3 font-semibold">Apellido</th>
                    <th className="px-6 py-3 font-semibold">Nivel</th>
                    <th className="px-6 py-3 font-semibold">Área</th>
                    <th className="px-6 py-3 font-semibold">CI</th>
                    <th className="px-6 py-3 font-semibold">Grado</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingCompetidores ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-3 text-center">
                        Cargando competidores...
                      </td>
                    </tr>
                  ) : competidores.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-3 text-center">
                        No hay competidores registrados
                      </td>
                    </tr>
                  ) : (
                    competidores.map((c, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-3">{c.nombre}</td>
                        <td className="px-6 py-3">{c.apellido}</td>
                        <td className="px-6 py-3">{c.nivel}</td>
                        <td className="px-6 py-3">{c.area}</td>
                        <td className="px-6 py-3">{c.ci}</td>
                        <td className="px-6 py-3">{c.grado}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </header>
      </main>
    </div>
  );
};
