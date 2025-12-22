import React, { useEffect, useRef, useState } from 'react';
import { useNivel } from '../hooks/useNivel';
import type { Area } from '../types/area-Type';

interface AccordionNivelProps {
  selectedAreas: Area[];
  selectedNiveles: { [areaId: number]: number[] };
  onChangeSelected?: (niveles: { [areaId: number]: number[] }) => void;
  className?: string;
}

export const AccordionNivel: React.FC<AccordionNivelProps> = ({
  selectedAreas,
  selectedNiveles,
  onChangeSelected,
  className,
}) => {
  const accordionRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [panelWidth, setPanelWidth] = useState<number>(0);

  const {
    isOpen,
    toggleAccordion,
    localSelected,
    nivelesData,
    loading,
    handleCheckboxChange,
    handleSelectAll,
    isAllSelected,
    closeAccordion,
  } = useNivel({
    selectedAreas,
    selectedNiveles,
    onChangeSelected,
  });

  useEffect(() => {
    const updateWidth = () => {
      if (buttonRef.current) {
        setPanelWidth(buttonRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accordionRef.current && !accordionRef.current.contains(event.target as Node)) {
        closeAccordion();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeAccordion]);

  return (
    <div ref={accordionRef} className={`relative w-full sm:w-60 ${className || ''}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleAccordion}
        className="flex items-center justify-between w-full px-6 sm:px-6 py-2.5 sm:py-2.5 rounded-lg bg-white border-2 border-principal-500 text-black font-semibold"
      >
        <span>Nivel</span>
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
          className="absolute left-0 top-full z-50 min-w-full bg-blanco px-4 sm:px-6 py-4 border-2 border-principal-500 rounded-b-xl shadow-lg overflow-y-auto max-h-[400px]"
          style={{
            width: panelWidth,
            maxHeight: '220px',
            overflowY: 'auto',
            transform: 'translateY(10px)',
          }}
        >
          {loading ? (
            <p className="text-neutro-700 text-sm text-center">Cargando niveles...</p>
          ) : nivelesData.length === 0 ? (
            <p className="text-neutro-700 text-sm text-center">
              Selecciona un área para ver sus niveles.
            </p>
          ) : (
            nivelesData.map(({ areaId, areaNombre, niveles }) => (
              <div key={areaNombre} className="mb-3">
                <h3 className="font-semibold text-principal-700 mb-2">{areaNombre}</h3>

                {niveles.length > 0 && (
                  <label
                    className={`flex justify-between items-center w-full px-2 py-2 rounded-md border transition-all duration-150 cursor-pointer mb-2 ${
                      isAllSelected(areaId, niveles)
                        ? 'bg-principal-100 border-principal-400 text-principal-700 font-semibold'
                        : 'bg-white hover:bg-neutro-100 border-neutro-200'
                    }`}
                  >
                    <span className="text-principal-500">Marcar todo</span>
                    <input
                      type="checkbox"
                      checked={isAllSelected(areaId, niveles)}
                      onChange={() => handleSelectAll(areaId, niveles)}
                      className="accent-principal-500 w-4 h-4"
                    />
                  </label>
                )}

                {niveles.length > 0 ? (
                  <div className="space-y-2">
                    {niveles.map((nivel) => {
                      const isChecked = localSelected[areaId]?.includes(nivel.id_nivel) || false;
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
                            onChange={() => handleCheckboxChange(areaId, nivel.id_nivel)}
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
