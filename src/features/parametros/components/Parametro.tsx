import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { obtenerAreasAPI, obtenerNivelesPorAreaAPI } from "../service/service";
import type { Area, Nivel } from "../interface/interface";

export const Parametro = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [areas, setAreas] = useState<Area[]>([]);
  const [niveles, setNiveles] = useState<Nivel[]>([]);
  const [areaSeleccionada, setAreaSeleccionada] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const toggleAccordion = () => setIsOpen(!isOpen);

  // 🔹 Obtener todas las áreas
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const data = await obtenerAreasAPI();
        setAreas(data);
      } catch (error) {
        console.error("Error al obtener las áreas:", error);
      }
    };
    fetchAreas();
  }, []);

  // 🔹 Obtener niveles al seleccionar un área
  const handleSelectArea = async (id: number) => {
    setAreaSeleccionada(id);
    setLoading(true);
    try {
      const data = await obtenerNivelesPorAreaAPI(id);
      setNiveles(data);
    } catch (error) {
      console.error("Error al obtener niveles:", error);
      setNiveles([]);
    } finally {
      setLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="bg-neutro-100 min-h-screen flex items-center justify-center p-6 font-display relative">
      <main className="bg-blanco w-full max-w-3xl rounded-2xl shadow-sombra-3 p-10 border border-neutro-200 relative">
        {/* HEADER */}
        <header className="flex justify-center items-center mb-12">
          <h1 className="text-4xl font-extrabold text-negro tracking-tight text-center">
            Ingrese parámetro de calificación
          </h1>
        </header>

        {/* CONTENIDO */}
        <div className="space-y-6 relative">
          {/* 🔹 Acordeón de área */}
          <div className="relative border border-neutro-300 rounded-xl overflow-visible z-30">
            <button
              onClick={toggleAccordion}
              className="w-full flex justify-between items-center bg-principal-500 hover:bg-principal-600 transition-colors px-4 py-3 font-semibold text-white rounded-t-xl"
            >
              <span>
                {areaSeleccionada
                  ? `Área seleccionada: ${
                      areas.find((a) => a.id === areaSeleccionada)?.nombre
                    }`
                  : "Seleccionar Área"}
              </span>
              <svg
                className={`w-5 h-5 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isOpen && (
              <div
                className="absolute left-0 top-full z-20 w-full bg-blanco px-6 py-4 border border-neutro-200 rounded-b-xl shadow-lg overflow-y-auto transition-all duration-300"
                style={{
                  maxHeight: "200px",
                  scrollbarWidth: "thin",
                  scrollbarColor: "#a3a3a3 #f5f5f5",
                }}
              >
                {areas.length === 0 ? (
                  <p className="text-neutro-700 text-sm">
                    No hay áreas disponibles.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {areas.map((area) => (
                      <button
                        key={area.id}
                        onClick={() => handleSelectArea(area.id)}
                        className={`w-full text-left px-4 py-2 rounded-md border transition-all duration-150 ${
                          areaSeleccionada === area.id
                            ? "bg-principal-100 border-principal-400 text-principal-700 font-semibold"
                            : "bg-blanco hover:bg-neutro-100 border-neutro-200"
                        }`}
                      >
                        {area.nombre}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* LISTA DE NIVELES */}
          <div className="relative z-10">
            <h2 className="text-lg font-bold text-negro mb-3">
              Lista de niveles
            </h2>

            <div className="overflow-hidden rounded-lg border border-neutro-300">
              <table className="w-full border-collapse">
                <thead className="bg-principal-500 text-blanco">
                  <tr>
                    <th className="py-2 px-4 text-left w-16">NRO</th>
                    <th className="py-2 px-4 text-left">NIVEL</th>
                    <th className="py-2 px-4 text-center w-24">TIENE</th>
                  </tr>
                </thead>
                <tbody className="text-neutro-800">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="text-center py-4 text-neutro-600"
                      >
                        Cargando niveles...
                      </td>
                    </tr>
                  ) : niveles.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="text-center py-4 text-neutro-600"
                      >
                        {areaSeleccionada
                          ? "No hay niveles disponibles para esta área."
                          : "Seleccione un área para ver sus niveles."}
                      </td>
                    </tr>
                  ) : (
                    niveles.map((nivel, index) => (
                      <tr
                        key={nivel.id}
                        className="border-t border-neutro-200 hover:bg-neutro-100 transition"
                      >
                        <td className="py-2 px-4">{index + 1}</td>
                        <td className="py-2 px-4">{nivel.nombre}</td>
                        <td className="py-2 px-4 text-center">
                          <input
                            type="checkbox"
                            className="w-5 h-5 accent-principal-500"
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="flex justify-end items-center gap-6 mt-14">
          <Link
            type="button"
            className="flex items-center gap-2 font-medium py-2.5 px-6 rounded-lg bg-neutro-200 text-neutro-700 hover:bg-neutro-300 hover:shadow transition-all"
            to="/dashboard"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            <span>Cancelar</span>
          </Link>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 w-48 font-semibold py-2.5 px-6 rounded-lg bg-principal-500 text-blanco hover:bg-principal-600 hover:shadow transition-all disabled:bg-principal-300 disabled:cursor-not-allowed"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            <span>Guardar</span>
          </button>
        </footer>
      </main>
    </div>
  );
};
