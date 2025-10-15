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
    <div className="relative w-60">
      {/* Botón principal */}
      <button
        type="button"
        onClick={toggleAccordion}
        className="flex items-center justify-between w-full px-6 py-2.5 rounded-lg bg-principal-500 text-blanco font-semibold hover:bg-principal-600 transition-colors"
      >
        <span>Seleccionar Área</span>

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

      {/* Contenedor desplegable con el nuevo diseño */}
      {isOpen && (
        <div
          className="absolute left-0 top-full z-20 w-full bg-blanco px-6 py-4 border-2 border-principal-500 rounded-b-xl shadow-lg overflow-y-auto transition-all duration-300"
          style={{
            maxHeight: "200px",
            scrollbarWidth: "thin",
            scrollbarColor: "#a3a3a3 #f5f5f5",
          }}
        >
          {areas.length === 0 ? (
            <p className="text-neutro-700 text-sm text-center">
              No hay áreas disponibles.
            </p>
          ) : (
            <div className="space-y-2">
              {areas.map((area) => {
                const isChecked = localSelectedAreas.some(
                  (a) => a.id_area === area.id_area
                );
                return (
                  <label
                    key={area.id_area}
                    className={`flex justify-between items-center w-full px-4 py-2 rounded-md border transition-all duration-150 cursor-pointer ${
                      isChecked
                        ? "bg-principal-100 border-principal-400 text-principal-700 font-semibold"
                        : "bg-blanco hover:bg-neutro-100 border-neutro-200"
                    }`}
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
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
