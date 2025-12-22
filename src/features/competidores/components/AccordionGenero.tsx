import { useRef, useEffect } from 'react';
import { useGenero } from '../hooks/useGenero';

interface AccordionGeneroProps {
  selectedGenero: string[];
  onChangeSelected: React.Dispatch<React.SetStateAction<string[]>>;
}

export const AccordionGenero = ({ selectedGenero, onChangeSelected }: AccordionGeneroProps) => {
  const accordionRef = useRef<HTMLDivElement>(null);

  const { isOpen, toggleAccordion, generos, loading, toggleGenero, selectAll, isAllSelected } =
    useGenero({
      selectedGenero,
      onChangeSelected,
    });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accordionRef.current && !accordionRef.current.contains(event.target as Node)) {
        if (isOpen) toggleAccordion();
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
        type="button"
        onClick={toggleAccordion}
        className="flex items-center justify-between w-full px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg bg-white border-2 border-principal-500 text-black font-semibold hover:bg-white transition-colors"
      >
        <span>Género</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`w-6 h-6 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute left-0 top-full z-50 w-full bg-blanco px-4 sm:px-6 py-4 border-2 border-principal-500 rounded-b-xl shadow-lg overflow-y-auto"
          style={{ maxHeight: '220px' }}
        >
          {loading ? (
            <p className="text-center text-neutro-400">Cargando géneros...</p>
          ) : generos.length === 0 ? (
            <p className="text-center text-neutro-400">No hay géneros disponibles</p>
          ) : (
            <>
              {/* Marcar todo */}
              <label
                className={`flex justify-between items-center w-full px-2 py-2 rounded-md border cursor-pointer mb-2 ${
                  isAllSelected
                    ? 'bg-principal-100 border-principal-400 text-principal-700 font-semibold'
                    : 'bg-white hover:bg-neutro-100 border-neutro-200'
                }`}
              >
                <span className="text-principal-500">Marcar todo</span>
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={selectAll}
                  className="accent-principal-500 w-4 h-4"
                />
              </label>

              <div className="space-y-2">
                {generos.map((genero) => {
                  const isChecked = selectedGenero.includes(genero.id);

                  return (
                    <label
                      key={genero.id}
                      className={`flex justify-between items-center w-full px-2 py-2 rounded-md border cursor-pointer ${
                        isChecked
                          ? 'bg-principal-100 border-principal-400 text-principal-700 font-semibold'
                          : 'bg-white hover:bg-neutro-100 border-neutro-200'
                      }`}
                    >
                      <span className="text-negro">{genero.nombre}</span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleGenero(genero.id)}
                        className="accent-principal-500 w-4 h-4"
                      />
                    </label>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
