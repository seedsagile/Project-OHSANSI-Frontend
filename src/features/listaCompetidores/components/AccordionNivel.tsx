import React, { useState } from "react";
import type { Nivel } from "../../niveles/types/index";

interface AreaNiveles {
  areaNombre: string;
  niveles: Nivel[];
}

interface AccordionNivelProps {
  data: AreaNiveles[];
}

export const AccordionNivel: React.FC<AccordionNivelProps> = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNiveles, setSelectedNiveles] = useState<number[]>([]);

  const toggleAccordion = () => setIsOpen(!isOpen);

  const handleCheckboxChange = (nivelId: number) => {
    setSelectedNiveles((prev) =>
      prev.includes(nivelId)
        ? prev.filter((id) => id !== nivelId)
        : [...prev, nivelId]
    );
  };

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
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          <path d="m7 6 5 5 5-5" />
          <path d="m7 13 5 5 5-5" />
        </svg>
      </button>

      {isOpen && (
        <div className="mt-2 bg-gray-50 border border-gray-200 rounded-lg shadow-inner p-4 space-y-4 w-full">
          {data.map(({ areaNombre, niveles }) => (
            <div key={areaNombre}>
              <h3 className="font-semibold text-negro mb-2">{areaNombre}</h3>
              {niveles && niveles.length > 0 ? (
                niveles.map((nivel) => (
                  <label
                    key={nivel.id_nivel}
                    className="flex justify-between items-center gap-2 cursor-pointer"
                  >
                    <span className="text-negro">{nivel.nombre}</span>
                    <input
                      type="checkbox"
                      checked={selectedNiveles.includes(nivel.id_nivel)}
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
          ))}
        </div>
      )}
    </div>
  );
};
