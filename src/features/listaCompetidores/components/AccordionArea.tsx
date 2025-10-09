import React, { useState } from "react";
import type { Area } from "../../areas/types/index";

interface AccordionAreaProps {
  areas: Area[];
  onChangeSelected?: (selected: Area[]) => void; // nueva prop
}

export const AccordionArea: React.FC<AccordionAreaProps> = ({
  areas,
  onChangeSelected,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAreas, setSelectedAreas] = useState<Area[]>([]);

  const toggleAccordion = () => setIsOpen(!isOpen);

  const handleCheckboxChange = (area: Area) => {
    const newSelected = selectedAreas.includes(area)
      ? selectedAreas.filter((a) => a !== area)
      : [...selectedAreas, area];

    setSelectedAreas(newSelected);

    if (onChangeSelected) onChangeSelected(newSelected);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggleAccordion}
        className="flex items-center justify-between w-60 px-6 py-2.5 rounded-lg bg-principal-500 text-blanco font-semibold hover:bg-principal-600 transition-colors"
      >
        <span>Seleccionar Área</span>
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
          {areas.map((area) => (
            <label
              key={area.id_area}
              className="flex justify-between items-center gap-2 cursor-pointer"
            >
              <span className="text-negro">{area.nombre}</span>
              <input
                type="checkbox"
                checked={selectedAreas.includes(area)}
                onChange={() => handleCheckboxChange(area)}
                className="accent-principal-500 w-4 h-4"
              />
            </label>
          ))}
        </div>
      )}
    </div>
  );
};
