import React, { useEffect, useState } from "react";
import { areasService } from "../../areas/services/areasService"; // ajusta la ruta según tu estructura
import type { Area } from "../../areas/types/index";

export const FormularioAsignarResponsable = () => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const data = await areasService.obtenerAreas();
        setAreas(data);
      } catch (error) {
        console.error("Error cargando áreas:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAreas();
  }, []);

  return (
    <div className="bg-neutro-100 min-h-screen flex items-center justify-center p-4 font-display">
      <main className="bg-blanco w-full max-w-4xl rounded-xl shadow-sombra-3 p-8">
        <header className="flex justify-center items-center mb-10">
          <h1 className="text-4xl font-extrabold text-negro tracking-tighter text-center">
            Registrar Responsable de Area
          </h1>
        </header>

        <form action="" className="space-y-8">
          <div className="flex gap-8">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-negro">
                Nombre del responsable de area
              </label>
              <input
                type="text"
                placeholder="Ej: Pepito"
                className="w-[400px] border rounded-md p-2 border-neutro-400 focus:outline-none focus:ring-2 focus:ring-principal-400"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-negro">
                Apellido del responsable de area
              </label>
              <input
                type="text"
                placeholder="Ej: Perez"
                className="w-[400px] border rounded-md p-2 border-neutro-400 focus:outline-none focus:ring-2 focus:ring-principal-400"
              />
            </div>
          </div>

          <div className="flex gap-8">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-negro">
                  Correo Electrónico
                </label>
                <input
                  type="text"
                  placeholder="ejemplo@ejemplo.com"
                  className="w-[400px] border rounded-md p-2 border-neutro-400 focus:outline-none focus:ring-2 focus:ring-principal-400"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-negro">
                  Carnet de identidad
                </label>
                <input
                  type="text"
                  placeholder="Ej: 1234567 o 1234567-18"
                  className="w-[400px] border rounded-md p-2 border-neutro-400 focus:outline-none focus:ring-2 focus:ring-principal-400"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-negro">
                  Contraseña
                </label>
                <button
                  type="button"
                  className="w-[400px] border rounded-md p-2 text-white border-neutro-400 bg-[#0076FF] hover:bg-principal-600 transition-colors"
                >
                  Generar contraseña
                </button>
              </div>
            </div>

            {/* Campo Área */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-negro">Area</label>
              <div className="relative flex flex-col gap-2">
                <button
                  type="button"
                  className="w-[400px] border rounded-md p-2 border-neutro-400 bg-[#0076FF] text-white transition-colors"
                >
                  Asignar Área
                </button>
                <div className="w-[400px] border rounded-md p-2 border-neutro-400 bg-neutro-50 max-h-[137px] overflow-y-auto text-sm">
                  {loading ? (
                    <p className="text-neutro-500 italic">Cargando areas...</p>
                  ) : areas.length > 0 ? (
                    <ul className="space-y-1">
                      {areas.map((area, index) => (
                        <li
                          key={area.id_area} // 👈 usa la propiedad correcta del tipo Area
                          className={`cursor-pointer rounded-md px-2 py-1 hover:bg-neutro-200 transition-colors ${
                            index % 2 === 0 ? "bg-[#E5E7EB]" : "bg-[#F3F4F6]"
                          }`}
                        >
                          {area.nombre}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-neutro-500 italic">
                      No hay areas registradas
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>

        <footer className="flex justify-end items-center gap-4 mt-12">
          <button
            type="button"
            className="flex items-center gap-2 font-semibold py-2.5 px-6 rounded-lg bg-neutro-200 text-neutro-700 hover:bg-neutro-300 transition-colors"
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
          </button>

          <button className="flex items-center justify-center gap-2 w-48 font-semibold py-2.5 px-6 rounded-lg bg-[#0076FF] text-blanco hover:bg-principal-600 transition-colors disabled:bg-principal-300 disabled:cursor-not-allowed">
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
