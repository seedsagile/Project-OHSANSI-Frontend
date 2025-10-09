import { AccordionArea } from "./AccordionArea";
import { AccordionNivel } from "./AccordionNivel";

export const ListaCompetidores = () => {
  return (
    <div className="bg-neutro-100 min-h-screen flex items-center justify-center p-4 font-display">
      <main className="bg-blanco w-full max-w-5xl rounded-xl shadow-sombra-3 p-8">
        <header className="flex flex-col mb-10">
          {/* Título centrado */}
          <h1 className="text-4xl font-extrabold text-negro tracking-tighter text-center mb-8">
            Registrar Responsable de Área
          </h1>

          <div className="flex justify-end items-start gap-4 mb-6">
            {/* Botón Mostrar Todo (solo botón) */}
            <div className="flex flex-col items-end">
              <button
                type="button"
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg 
      bg-principal-500 text-blanco font-semibold hover:bg-principal-600 
      transition-colors disabled:bg-principal-300 disabled:cursor-not-allowed"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-table"
                >
                  <path d="M12 3v18" />
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M3 9h18" />
                  <path d="M3 15h18" />
                </svg>
                <span>Mostrar Todo</span>
              </button>
            </div>

            {/* Accordion Área */}
            <div className="flex flex-col items-end">
              <AccordionArea areas={["Área 1", "Área 2", "Área 3"]} />
            </div>

            {/* Accordion Nivel */}
            <div className="flex flex-col items-end">
              <AccordionNivel niveles={["Nivel 1", "Nivel 2", "Nivel 3"]} />
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
                {/* Fila de ejemplo */}
                <tr className="border-b hover:bg-gray-50">
                  <td className="px-6 py-3">---</td>
                  <td className="px-6 py-3">---</td>
                  <td className="px-6 py-3">---</td>
                  <td className="px-6 py-3">---</td>
                  <td className="px-6 py-3">---</td>
                </tr>
              </tbody>
            </table>
          </div>
        </header>
      </main>
    </div>
  );
};
