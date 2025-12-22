import { useRef, useEffect } from 'react';
import { useDepartamento } from '../hooks/useDepartamento';

interface AccordionDepartamentoProps {
  selectedDepartamentos: string[];
  onChangeSelected: React.Dispatch<React.SetStateAction<string[]>>;
}

export const AccordionDepartamento = ({
  selectedDepartamentos,
  onChangeSelected,
}: AccordionDepartamentoProps) => {
  const accordionRef = useRef<HTMLDivElement>(null);

  const { isOpen, toggleAccordion, departamentos, toggleDepartamento, selectAll, isAllSelected } =
    useDepartamento({
      selectedDepartamentos,
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
        className="flex items-center justify-between w-full px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg bg-white border-2 border-principal-500 text-black font-semibold"
      >
        <span>Departamento</span>
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
        <div className="absolute left-0 top-full z-50 w-full bg-blanco px-4 sm:px-6 py-4 border-2 border-principal-500 rounded-b-xl shadow-lg overflow-y-auto max-h-[200px]">
          <div className="space-y-2">
            {/* Marcar todo */}
            <label
              className={`flex justify-between items-center px-4 py-2 rounded-md border cursor-pointer ${
                isAllSelected
                  ? 'bg-principal-100 border-principal-400'
                  : 'bg-blanco border-neutro-200 hover:bg-neutral-100'
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

            {departamentos.map((d) => {
              const isChecked = selectedDepartamentos.includes(d.nombre);

              return (
                <label
                  key={d.id}
                  className={`flex justify-between items-center px-4 py-2 rounded-md border cursor-pointer ${
                    isChecked
                      ? 'bg-principal-100 border-principal-400'
                      : 'bg-blanco border-neutro-200'
                  }`}
                >
                  <span>{d.nombre}</span>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleDepartamento(d.nombre)}
                    className="accent-principal-500"
                  />
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
