import { useRef, useState, useEffect } from 'react';
import type { Area } from '../types/area-Type';
import { useArea } from '../hooks/useArea';

interface AccordionAreaProps {
  responsableId: number;
  selectedAreas: Area[];
  onChangeSelected?: (selected: Area[]) => void;
}

export const AccordionArea = ({
  responsableId,
  selectedAreas,
  onChangeSelected,
}: AccordionAreaProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const accordionRef = useRef<HTMLDivElement>(null);

  const { areas, loading, localSelectedAreas, toggleArea, selectAll, isAllSelected } = useArea({
    responsableId,
    selectedAreas,
    onChangeSelected,
  });

  const toggleAccordion = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accordionRef.current && !accordionRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={accordionRef} className="relative w-full sm:w-60">
      <button
        type="button"
        onClick={toggleAccordion}
        className="flex items-center justify-between w-full px-6 sm:px-6 py-2.5 sm:py-2.5 rounded-lg bg-white border-2 border-principal-500 text-black font-semibold"
      >
        <span>Área</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`w-6 h-6 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 min-w-full bg-blanco px-4 sm:px-6 py-4 border-2 border-principal-500 rounded-b-xl shadow-lg overflow-y-auto max-h-[400px]">
          {loading ? (
            <p className="text-sm text-center">Cargando áreas...</p>
          ) : areas.length === 0 ? (
            <p className="text-sm text-center">No hay áreas disponibles.</p>
          ) : (
            <div className="space-y-2">
              <label
                className={`flex justify-between items-center px-4 py-2 rounded-md border cursor-pointer ${
                  isAllSelected
                    ? 'bg-principal-100 border-principal-400'
                    : 'bg-blanco border-neutro-200'
                }`}
              >
                <span className="text-principal-500">Marcar todo</span>
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={selectAll}
                  className="accent-principal-500"
                />
              </label>

              {areas.map((area) => {
                const isChecked = localSelectedAreas.some((a) => a.id_area === area.id_area);
                return (
                  <label
                    key={area.id_area}
                    className={`flex justify-between items-center px-4 py-2 rounded-md border cursor-pointer ${
                      isChecked
                        ? 'bg-principal-100 border-principal-400'
                        : 'bg-blanco border-neutro-200'
                    }`}
                  >
                    <span className="text-black">{area.nombre}</span>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleArea(area)}
                      className="accent-principal-500"
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
