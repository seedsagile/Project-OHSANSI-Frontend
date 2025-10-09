import React, { useState } from "react";

interface AccordionNivelProps {
  niveles: string[];
}

export const AccordionNivel: React.FC<AccordionNivelProps> = ({ niveles }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNiveles, setSelectedNiveles] = useState<string[]>([]);

  const toggleAccordion = () => setIsOpen(!isOpen);

  const handleCheckboxChange = (nivel: string) => {
    setSelectedNiveles((prev) =>
      prev.includes(nivel) ? prev.filter((n) => n !== nivel) : [...prev, nivel]
    );
  };

  return (
    <div className="relative">
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
        <div className="mt-2 bg-gray-50 border border-gray-200 rounded-lg shadow-inner p-4 space-y-2">
          {niveles.map((nivel) => (
            <label
              key={nivel}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedNiveles.includes(nivel)}
                onChange={() => handleCheckboxChange(nivel)}
                className="accent-principal-500 w-4 h-4"
              />
              <span className="text-negro">{nivel}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};
