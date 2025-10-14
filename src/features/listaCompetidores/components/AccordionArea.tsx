import React, { useState, useEffect } from "react";
import type { Area } from "../interface/interface";

interface AccordionAreaProps {
  areas: Area[];
  selectedAreas: Area[];
  onChangeSelected?: (selected: Area[]) => void;
}

export const AccordionArea: React.FC<AccordionAreaProps> = ({
  areas,
  selectedAreas,
  onChangeSelected,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localSelectedAreas, setLocalSelectedAreas] = useState<Area[]>([]);

  const toggleAccordion = () => setIsOpen(!isOpen);

  // Sincronizar estado local con el del padre
  useEffect(() => {
    setLocalSelectedAreas(selectedAreas);
  }, [selectedAreas]);

  const handleCheckboxChange = (area: Area) => {
    const isSelected = localSelectedAreas.some(
      (a) => a.id_area === area.id_area
    );
    const newSelected = isSelected
      ? localSelectedAreas.filter((a) => a.id_area !== area.id_area)
      : [...localSelectedAreas, area];

    setLocalSelectedAreas(newSelected);
    onChangeSelected?.(newSelected);
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
          {areas.length === 0 ? (
            <p className="text-center text-gray-500">
              No hay áreas registradas
            </p>
          ) : (
            areas.map((area) => {
              const isChecked = localSelectedAreas.some(
                (a) => a.id_area === area.id_area
              );
              return (
                <label
                  key={area.id_area}
                  className="flex justify-between items-center gap-2 cursor-pointer"
                >
                  <span className="text-negro">{area.nombre}</span>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleCheckboxChange(area)}
                    className="accent-principal-500 w-4 h-4"
                  />
                </label>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
