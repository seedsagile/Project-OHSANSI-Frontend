import React, { useRef, useEffect, useState } from 'react';
import { useGrado } from '../hooks/useGrado';
import type { Area } from '../types/area-Type';

interface AccordionGradoProps {
  selectedAreas: Area[];
  selectedNiveles: { [areaId: number]: number[] };
  selectedGrados: number[];
  onChangeSelected: React.Dispatch<React.SetStateAction<number[]>>;
}

export const AccordionGrado: React.FC<AccordionGradoProps> = ({
  selectedAreas,
  selectedNiveles,
  selectedGrados,
  onChangeSelected,
}) => {
  const accordionRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [panelWidth, setPanelWidth] = useState<number>(0);

  const {
    isOpen,
    toggleAccordion,
    grados,
    loading,
    marcarTodo,
    handleCheckboxChange,
    handleMarcarTodo,
  } = useGrado({
    selectedAreas,
    selectedNiveles,
    selectedGrados,
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
        toggleAccordion();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, toggleAccordion]);

  return (
    <div ref={accordionRef} className="relative w-full sm:w-60">
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleAccordion}
        className="flex items-center justify-between w-full px-6 py-2.5 rounded-lg bg-white border-2 border-principal-500 text-black font-semibold hover:bg-white transition-colors"
      >
        <span>Grado</span>
        <svg
          className={`w-6 h-6 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute left-0 top-full z-50 bg-blanco px-6 py-4 border-2 border-principal-500 rounded-b-xl shadow-lg overflow-y-auto"
          style={{ width: panelWidth, maxHeight: '200px' }}
        >
          {loading ? (
            <div className="text-center text-gray-500 py-2">
              Selecciona un nivel para ver sus grados.
            </div>
          ) : grados.length === 0 ? (
            <div className="text-center text-gray-500 py-2">No hay grados disponibles</div>
          ) : (
            <div className="space-y-2">
              <label
                className={`flex justify-between items-center w-full px-4 py-2 rounded-md border cursor-pointer ${
                  marcarTodo
                    ? 'bg-principal-100 border-principal-400 text-principal-700 font-semibold'
                    : 'bg-blanco hover:bg-neutro-100 border-neutro-200'
                }`}
              >
                <span className="text-principal-500">Marcar todo</span>
                <input
                  type="checkbox"
                  checked={marcarTodo}
                  onChange={handleMarcarTodo}
                  className="accent-principal-500 w-4 h-4"
                />
              </label>

              {grados.map((grado) => {
                const isChecked = selectedGrados.includes(grado.id_grado_escolaridad);

                return (
                  <label
                    key={grado.id_grado_escolaridad}
                    className={`flex justify-between items-center w-full px-4 py-2 rounded-md border cursor-pointer ${
                      isChecked
                        ? 'bg-principal-100 border-principal-400 text-principal-700 font-semibold'
                        : 'bg-blanco hover:bg-neutro-100 border-neutro-200'
                    }`}
                  >
                    <span>{grado.nombre}</span>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleCheckboxChange(grado.id_grado_escolaridad)}
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
