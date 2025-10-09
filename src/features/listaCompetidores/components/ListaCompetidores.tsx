import React, { useEffect, useState } from "react";
import { AccordionArea } from "./AccordionArea";
import { AccordionNivel } from "./AccordionNivel";
import {
  getAreasAPI,
  getAreaNivelesAPI,
  getCompetidoresPorResponsableAPI,
} from "../service/service";
import type { Area } from "../../areas/types/index";
import type { Nivel, Competidor } from "../interface/interface";

export const ListaCompetidores = () => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [areaNiveles, setAreaNiveles] = useState<
    { areaNombre: string; niveles: Nivel[] }[]
  >([]);
  const [competidores, setCompetidores] = useState<Competidor[]>([]);
  const [loadingCompetidores, setLoadingCompetidores] = useState(true);

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const data = await getAreasAPI();
        setAreas(data);
      } catch (error) {
        console.error("Error al obtener las áreas:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAreas();
  }, []);

  useEffect(() => {
    const fetchCompetidores = async () => {
      try {
        const data = await getCompetidoresPorResponsableAPI(2); // Cambia 2 por el id del responsable actual
        setCompetidores(data.data);
      } catch (error) {
        console.error("Error al obtener los competidores:", error);
      } finally {
        setLoadingCompetidores(false);
      }
    };
    fetchCompetidores();
  }, []);

  const handleSelectedAreas = async (selected: Area[]) => {
    const resultados = await Promise.all(
      selected.map(async (area) => {
        const niveles = await getAreaNivelesAPI(area.id_area);
        return { areaNombre: area.nombre, niveles };
      })
    );
    setAreaNiveles(resultados);
  };

  return (
    <div className="bg-neutro-100 min-h-screen flex items-center justify-center p-4 font-display">
      <main className="bg-blanco w-full max-w-5xl rounded-xl shadow-sombra-3 p-8">
        <header className="flex flex-col mb-10">
          <h1 className="text-4xl font-extrabold text-negro tracking-tighter text-center mb-8">
            Listar competidores
          </h1>

          <div className="flex justify-end items-start gap-4 mb-6">
            {/* Botón Mostrar Todo */}
            <div className="flex flex-col items-end">
              <button
                type="button"
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-principal-500 text-blanco font-semibold hover:bg-principal-600 transition-colors disabled:bg-principal-300 disabled:cursor-not-allowed"
              >
                <span>Mostrar Todo</span>
              </button>
            </div>

            {/* Accordion Área */}
            <div className="flex flex-col items-end">
              {loading ? (
                <span>Cargando áreas...</span>
              ) : (
                <AccordionArea
                  areas={areas}
                  onChangeSelected={handleSelectedAreas}
                />
              )}
            </div>

            {/* Accordion Nivel */}
            <div className="flex flex-col items-end">
              <AccordionNivel data={areaNiveles} />
            </div>
          </div>

          {/* Tabla */}
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse rounded-lg overflow-hidden shadow-sm">
              <thead>
                <tr className="bg-principal-500 text-blanco text-left">
                  <th className="px-6 py-3 font-semibold">Nombre</th>
                  <th className="px-6 py-3 font-semibold">Apellido</th>
                  <th className="px-6 py-3 font-semibold">Área</th>
                  <th className="px-6 py-3 font-semibold">Nivel</th>
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
                ) : competidores.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-3 text-center">
                      No hay competidores disponibles
                    </td>
                  </tr>
                ) : (
                  competidores.map((c) => (
                    <tr
                      key={c.id_competidor}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="px-6 py-3">{c.persona.nombre}</td>
                      <td className="px-6 py-3">{c.persona.apellido}</td>
                      <td className="px-6 py-3">{c.area.nombre}</td>
                      <td className="px-6 py-3">{c.nivel.nombre}</td>
                      <td className="px-6 py-3">{c.persona.ci}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </header>
      </main>
    </div>
  );
};
