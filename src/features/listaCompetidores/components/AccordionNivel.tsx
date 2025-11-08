import React, { useState, useEffect } from 'react';
import type { Nivel } from '../interface/interface';

interface AreaNiveles {
  areaNombre: string;
  niveles: Nivel[];
}

interface AccordionNivelProps {
  data: AreaNiveles[];
  selectedNiveles: { [areaNombre: string]: number | null };
  onChangeSelected?: (niveles: { [areaNombre: string]: number | null }) => void;
  className?: string;
}

export const AccordionNivel: React.FC<AccordionNivelProps> = ({
  data,
  selectedNiveles,
  onChangeSelected,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localSelected, setLocalSelected] = useState<{ [areaNombre: string]: number | null }>({});

  const toggleAccordion = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    setLocalSelected(selectedNiveles);
  }, [selectedNiveles]);

  const handleCheckboxChange = (areaNombre: string, nivelId: number) => {
    const newSelected = {
      ...localSelected,
      [areaNombre]: localSelected[areaNombre] === nivelId ? null : nivelId,
    };
    setLocalSelected(newSelected);
    onChangeSelected?.(newSelected);
  };

  const sanitizedData = data.map((area) => ({
    ...area,
    niveles: Array.isArray(area.niveles) ? area.niveles : [],
  }));

  return (
    <div className={`relative w-60 ${className || ''}`}>
      <button
        type="button"
        onClick={toggleAccordion}
        className="flex items-center justify-between w-full px-6 py-2.5 rounded-lg bg-principal-500 text-blanco font-semibold hover:bg-principal-600 transition-colors"
      >
        <span>Seleccionar Nivel</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`w-6 h-6 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute z-[9999] w-60 bg-white px-6 py-4 border-2 border-principal-500 rounded-b-xl shadow-2xl backdrop-blur-sm"
          style={{
            maxHeight: '220px',
            overflowY: 'auto',
            transform: 'translateY(10px)',
          }}
        >
          {sanitizedData.length === 0 ? (
            <p className="text-neutro-700 text-sm text-center">No hay niveles disponibles.</p>
          ) : (
            sanitizedData.map(({ areaNombre, niveles }) => (
              <div key={areaNombre} className="mb-3">
                <h3 className="font-semibold text-principal-700 mb-2">{areaNombre}</h3>
                {niveles.length > 0 ? (
                  <div className="space-y-2">
                    {niveles.map((nivel) => {
                      const isChecked = localSelected[areaNombre] === nivel.id_nivel;
                      return (
                        <label
                          key={nivel.id_nivel}
                          className={`flex justify-between items-center w-full px-2 py-2 rounded-md border transition-all duration-150 cursor-pointer ${
                            isChecked
                              ? 'bg-principal-100 border-principal-400 text-principal-700 font-semibold'
                              : 'bg-white hover:bg-neutro-100 border-neutro-200'
                          }`}
                        >
                          <span className="text-negro">{nivel.nombre}</span>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleCheckboxChange(areaNombre, nivel.id_nivel)}
                            className="accent-principal-500 w-4 h-4"
                          />
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-neutro-500 ml-2">No tiene niveles asociados.</p>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
