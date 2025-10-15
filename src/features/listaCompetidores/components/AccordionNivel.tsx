import React, { useState, useEffect } from "react";
import type { Nivel } from "../interface/interface";

interface AreaNiveles {
  areaNombre: string;
  niveles: Nivel[];
}

interface AccordionNivelProps {
  data: AreaNiveles[];
  selectedNiveles: number[];
  onChangeSelected?: (niveles: number[]) => void;
}

export const AccordionNivel: React.FC<AccordionNivelProps> = ({
  data,
  selectedNiveles,
  onChangeSelected,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localSelectedNiveles, setLocalSelectedNiveles] = useState<number[]>(
    []
  );

  const toggleAccordion = () => setIsOpen((prev) => !prev);

  // Sincronizar estado local con el del padre
  useEffect(() => {
    setLocalSelectedNiveles(selectedNiveles);
  }, [selectedNiveles]);

  const handleCheckboxChange = (nivelId: number) => {
    const newSelected = localSelectedNiveles.includes(nivelId)
      ? localSelectedNiveles.filter((id) => id !== nivelId)
      : [...localSelectedNiveles, nivelId];

    setLocalSelectedNiveles(newSelected);
    onChangeSelected?.(newSelected);
  };

  // Validar datos de niveles
  const sanitizedData = data.map((area) => ({
    ...area,
    niveles: Array.isArray(area.niveles) ? area.niveles : [],
  }));

  return (
    <div className="relative w-60">
      {/* Botón principal */}
      <button
        type="button"
        onClick={toggleAccordion}
        className="flex items-center justify-between w-full px-6 py-2.5 rounded-lg bg-principal-500 text-blanco font-semibold hover:bg-principal-600 transition-colors"
      >
        <span>Seleccionar Nivel</span>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* Contenedor desplegable con diseño del combobox anterior */}
      {isOpen && (
        <div
          className="absolute left-0 top-full z-20 w-full bg-blanco px-6 py-4 border-2 border-principal-500 rounded-b-xl shadow-lg overflow-y-auto transition-all duration-300"
          style={{
            maxHeight: "200px",
            scrollbarWidth: "thin",
            scrollbarColor: "#a3a3a3 #f5f5f5",
          }}
        >
          {sanitizedData.length === 0 ? (
            <p className="text-neutro-700 text-sm text-center">
              No hay niveles disponibles.
            </p>
          ) : (
            sanitizedData.map(({ areaNombre, niveles }) => (
              <div key={areaNombre} className="mb-3">
                <h3 className="font-semibold text-principal-700 mb-2">
                  {areaNombre}
                </h3>
                {niveles.length > 0 ? (
                  <div className="space-y-2">
                    {niveles.map((nivel) => {
                      const isChecked = localSelectedNiveles.includes(
                        nivel.id_nivel
                      );
                      return (
                        <label
                          key={nivel.id_nivel}
                          className={`flex justify-between items-center w-full px-4 py-2 rounded-md border transition-all duration-150 cursor-pointer ${
                            isChecked
                              ? "bg-principal-100 border-principal-400 text-principal-700 font-semibold"
                              : "bg-blanco hover:bg-neutro-100 border-neutro-200"
                          }`}
                        >
                          <span className="text-negro">{nivel.nombre}</span>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() =>
                              handleCheckboxChange(nivel.id_nivel)
                            }
                            className="accent-principal-500 w-4 h-4"
                          />
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-neutro-500 ml-2">
                    No tiene niveles asociados.
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
