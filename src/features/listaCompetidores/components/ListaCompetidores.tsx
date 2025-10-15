import { useEffect, useState } from "react";
import { AccordionArea } from "./AccordionArea";
import { AccordionNivel } from "./AccordionNivel";
import {
  getAreasPorResponsableAPI,
  getCompetidoresPorResponsableAPI,
} from "../service/service";
import type { Nivel, Competidor, Area } from "../interface/interface";

export const ListaCompetidores = () => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [competidores, setCompetidores] = useState<Competidor[]>([]);
  const [areaNiveles, setAreaNiveles] = useState<
    { areaNombre: string; niveles: Nivel[] }[]
  >([]);

  const [selectedAreas, setSelectedAreas] = useState<Area[]>([]);
  const [selectedNiveles, setSelectedNiveles] = useState<number[]>([]);

  const [loadingAreas, setLoadingAreas] = useState(true);
  const [loadingCompetidores, setLoadingCompetidores] = useState(true);

  const responsableId = 2;

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const data = await getAreasPorResponsableAPI(responsableId);
        setAreas(data);
      } catch (error) {
        console.error("Error al obtener áreas:", error);
      } finally {
        setLoadingAreas(false);
      }
    };
    fetchAreas();
  }, []);

  const fetchCompetidores = async () => {
    try {
      setLoadingCompetidores(true);
      const data = await getCompetidoresPorResponsableAPI(responsableId);
      setCompetidores(data.data);
    } catch (error) {
      console.error("Error al obtener competidores:", error);
      setCompetidores([]);
    } finally {
      setLoadingCompetidores(false);
    }
  };

  useEffect(() => {
    fetchCompetidores();
  }, []);

  const handleSelectedAreas = (selected: Area[]) => {
    setSelectedAreas(selected);

    if (!selected || selected.length === 0) {
      setAreaNiveles([]);
      setSelectedNiveles([]);
      return;
    }

    const filtrado = selected.map((area) => {
      const nivelesUnicos = Array.from(
        new Map(
          competidores
            .filter((c) => c.area.id_area === area.id_area)
            .map((c) => [c.nivel.id_nivel, c.nivel])
        ).values()
      );
      return { areaNombre: area.nombre, niveles: nivelesUnicos };
    });

    setAreaNiveles(filtrado);
    setSelectedNiveles([]);
  };

  const handleSelectedNiveles = (niveles: number[]) => {
    setSelectedNiveles(niveles);
  };

  const handleMostrarTodo = () => {
    setSelectedAreas([]);
    setSelectedNiveles([]);
    setAreaNiveles([]);
    fetchCompetidores();
  };

  const filteredCompetidores = competidores.filter((c) => {
    if (
      selectedAreas.length > 0 &&
      !selectedAreas.some((a) => a.id_area === c.area.id_area)
    ) {
      return false;
    }
    if (
      selectedNiveles.length > 0 &&
      !selectedNiveles.includes(c.nivel.id_nivel)
    ) {
      return false;
    }
    return true;
  });

  const sortedCompetidores = [...filteredCompetidores].sort((a, b) => {
    const areaCompare = a.area.nombre.localeCompare(b.area.nombre);
    if (areaCompare !== 0) return areaCompare;

    const getNivelNum = (nombre: string) => {
      const match = nombre.match(/\d+/);
      return match ? parseInt(match[0]) : 999;
    };
    const nivelCompare =
      getNivelNum(a.nivel.nombre) - getNivelNum(b.nivel.nombre);
    if (nivelCompare !== 0) return nivelCompare;

    return a.persona.nombre.localeCompare(b.persona.nombre);
  });

  let infoMessage = "";
  if (!loadingCompetidores && sortedCompetidores.length === 0) {
    if (selectedAreas.length === 0 && selectedNiveles.length === 0) {
      infoMessage = "No hay competidores registrados en el área seleccionada";
    } else if (selectedAreas.length > 0 && selectedNiveles.length === 0) {
      infoMessage = "No hay competidores registrados en el área seleccionada";
    } else if (selectedAreas.length > 0 && selectedNiveles.length > 0) {
      infoMessage =
        "No hay competidores registrados en el área y nivel seleccionados";
    } else if (selectedAreas.length === 0 && selectedNiveles.length > 0) {
      infoMessage = "No hay competidores registrados en el nivel seleccionado";
    }
  }

  return (
    <div className="bg-neutro-100 min-h-screen flex items-center justify-center p-4 font-display">
      <main className="bg-blanco w-full max-w-5xl rounded-xl shadow-sombra-3 p-8">
        <header className="flex flex-col mb-10">
          <h1 className="text-4xl font-extrabold text-negro tracking-tighter text-center mb-8">
            Listar competidores
          </h1>

          <div className="flex justify-end items-start gap-4 mb-6">
            <div className="flex flex-col items-end">
              <button
                onClick={handleMostrarTodo}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-principal-500 text-blanco font-semibold hover:bg-principal-600 transition-colors"
              >
                Mostrar Todo
              </button>
            </div>

            <div className="flex flex-col items-end">
              {loadingAreas ? (
                <span>Cargando áreas...</span>
              ) : (
                <AccordionArea
                  areas={areas}
                  selectedAreas={selectedAreas}
                  onChangeSelected={handleSelectedAreas}
                />
              )}
            </div>

            <div className="flex flex-col items-end">
              <AccordionNivel
                data={areaNiveles}
                selectedNiveles={selectedNiveles}
                onChangeSelected={handleSelectedNiveles}
              />
            </div>
          </div>

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
                  </tr>
                </thead>
                <tbody>
                  {loadingCompetidores ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-3 text-center">
                        Cargando competidores...
                      </td>
                    </tr>
                  ) : sortedCompetidores.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-3 text-center">
                        {infoMessage}
                      </td>
                    </tr>
                  ) : (
                    sortedCompetidores.map((c) => (
                      <tr
                        key={c.id_competidor}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="px-6 py-3">{c.persona.nombre}</td>
                        <td className="px-6 py-3">{c.persona.apellido}</td>
                        <td className="px-6 py-3">{c.nivel.nombre}</td>
                        <td className="px-6 py-3">{c.area.nombre}</td>

                        <td className="px-6 py-3">{c.persona.ci}</td>
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
