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

  // Validamos niveles
  const sanitizedData = data.map((area) => ({
    ...area,
    niveles: Array.isArray(area.niveles) ? area.niveles : [],
  }));

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={toggleAccordion}
        className="flex items-center justify-between w-60 px-6 py-2.5 rounded-lg bg-principal-500 text-blanco font-semibold hover:bg-principal-600 transition-colors"
      >
        <span>Seleccionar Nivel</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          className={`transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 bg-gray-50 border-2 border-principal-500 rounded-lg shadow-inner p-4 space-y-4 w-full h-30 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {sanitizedData.length === 0 ? (
            <p className="text-sm text-gris-500">No hay niveles disponibles</p>
          ) : (
            sanitizedData.map(({ areaNombre, niveles }) => (
              <div key={areaNombre}>
                <h3 className="font-semibold text-negro mb-2">{areaNombre}</h3>
                {niveles.length > 0 ? (
                  niveles.map((nivel) => (
                    <label
                      key={nivel.id_nivel}
                      className="flex justify-between items-center gap-2 cursor-pointer"
                    >
                      <span className="text-negro">{nivel.nombre}</span>
                      <input
                        type="checkbox"
                        checked={localSelectedNiveles.includes(nivel.id_nivel)}
                        onChange={() => handleCheckboxChange(nivel.id_nivel)}
                        className="accent-principal-500 w-4 h-4"
                      />
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-gris-500">
                    No tiene niveles asociados
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
