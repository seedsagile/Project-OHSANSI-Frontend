import { useState } from "react";
import { X } from "lucide-react";

// ==================== TIPOS ====================
export interface Area {
  id_area: number;
  nombre: string;
}

export interface Nivel {
  id_nivel: number;
  nombre: string;
}

interface ModalAsignarAreaProps {
  isOpen: boolean;
  onClose: () => void;
  areas: Area[];
  niveles: Nivel[];
  loading: boolean;
  onConfirmar: (area: Area, niveles: Nivel[]) => void;
}

// ==================== COMPONENTE MODAL ====================
export const ModalAsignarArea = ({
  isOpen,
  onClose,
  areas,
  niveles,
  loading,
  onConfirmar,
}: ModalAsignarAreaProps) => {
  const [step, setStep] = useState<"area" | "nivel">("area");
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [selectedNiveles, setSelectedNiveles] = useState<number[]>([]);

  const handleCerrar = () => {
    setStep("area");
    setSelectedArea(null);
    setSelectedNiveles([]);
    onClose();
  };

  const handleSeleccionarArea = (area: Area) => {
    setSelectedArea(area);
  };

  const handleConfirmarArea = () => {
    if (selectedArea) {
      setStep("nivel");
      setSelectedNiveles([]);
    }
  };

  const handleToggleNivel = (nivelId: number) => {
    setSelectedNiveles((prev) => {
      if (prev.includes(nivelId)) {
        return prev.filter((id) => id !== nivelId);
      } else {
        return [...prev, nivelId];
      }
    });
  };

  const handleConfirmarNiveles = () => {
    if (selectedArea && selectedNiveles.length > 0) {
      const nivelesSeleccionados = niveles.filter((n) =>
        selectedNiveles.includes(n.id_nivel)
      );
      onConfirmar(selectedArea, nivelesSeleccionados);
      handleCerrar();
    }
  };

  const handleVolverAreas = () => {
    setStep("area");
    setSelectedNiveles([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <h2 className="text-2xl font-bold text-black mb-4 text-center">
          Registrar Evaluador de Area/Nivel
        </h2>

        {step === "area" ? (
          <>
            <div className="mb-4">
              <label className="text-sm font-semibold text-black mb-2 block">
                Area
              </label>
              <button
                type="button"
                className="w-full bg-[#0076FF] text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
              >
                Asignar Area
              </button>
            </div>

            <div className="border border-gray-300 rounded-md max-h-[240px] overflow-y-auto mb-6">
              {loading ? (
                <p className="text-gray-500 italic p-4">Cargando areas...</p>
              ) : areas.length > 0 ? (
                <ul>
                  {areas.map((area, index) => (
                    <li
                      key={area.id_area}
                      onClick={() => handleSeleccionarArea(area)}
                      className={`flex justify-between items-center px-4 py-3 cursor-pointer transition-colors ${
                        index % 2 === 0 ? "bg-gray-200" : "bg-gray-100"
                      } hover:bg-gray-300 ${
                        selectedArea?.id_area === area.id_area
                          ? "ring-2 ring-blue-500"
                          : ""
                      }`}
                    >
                      <span className="font-medium">{area.nombre}</span>
                      <input
                        type="checkbox"
                        checked={selectedArea?.id_area === area.id_area}
                        readOnly
                        className="w-5 h-5"
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic p-4">
                  No hay areas registradas
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCerrar}
                className="flex items-center gap-2 px-6 py-2.5 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
              >
                <X size={20} />
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarArea}
                disabled={!selectedArea}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#0076FF] text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
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
                Guardar
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4">
              <label className="text-sm font-semibold text-black mb-2 block">
                Nivel
              </label>
              <button
                type="button"
                className="w-full bg-[#0076FF] text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
              >
                Asignar Nivel
              </button>
            </div>

            <div className="border border-gray-300 rounded-md max-h-[200px] overflow-y-auto mb-6">
              {niveles.length > 0 ? (
                <ul>
                  {niveles.map((nivel, index) => (
                    <li
                      key={nivel.id_nivel}
                      onClick={() => handleToggleNivel(nivel.id_nivel)}
                      className={`flex justify-between items-center px-4 py-3 cursor-pointer transition-colors ${
                        index % 2 === 0 ? "bg-gray-200" : "bg-gray-100"
                      } hover:bg-gray-300`}
                    >
                      <span className="font-medium">{nivel.nombre}</span>
                      <input
                        type="checkbox"
                        checked={selectedNiveles.includes(nivel.id_nivel)}
                        readOnly
                        className="w-5 h-5"
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic p-4">
                  No hay niveles disponibles
                </p>
              )}
            </div>

            <div className="flex justify-between gap-3">
              <button
                type="button"
                onClick={handleVolverAreas}
                className="px-6 py-2.5 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
              >
                Volver
              </button>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCerrar}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <X size={20} />
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmarNiveles}
                  disabled={selectedNiveles.length === 0}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#0076FF] text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
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
                  Guardar
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};