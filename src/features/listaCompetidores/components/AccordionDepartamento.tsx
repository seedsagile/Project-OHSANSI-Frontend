import React, { useState, useRef, useEffect } from 'react';

interface Departamento {
  id: number;
  nombre: string;
}

interface AccordionDepartamentoProps {
  selectedDepartamentos: string[]; // ✅ ahora acepta varios
  onChangeSelected: React.Dispatch<React.SetStateAction<string[]>>;
}

export const AccordionDepartamento: React.FC<AccordionDepartamentoProps> = ({
  selectedDepartamentos,
  onChangeSelected,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const accordionRef = useRef<HTMLDivElement>(null);

  const departamentos: Departamento[] = [
    { id: 1, nombre: 'La Paz' },
    { id: 2, nombre: 'Cochabamba' },
    { id: 3, nombre: 'Santa Cruz' },
    { id: 4, nombre: 'Oruro' },
    { id: 5, nombre: 'Potosí' },
    { id: 6, nombre: 'Chuquisaca' },
    { id: 7, nombre: 'Tarija' },
    { id: 8, nombre: 'Beni' },
    { id: 9, nombre: 'Pando' },
  ];

  const toggleAccordion = () => setIsOpen(!isOpen);

  // 🔹 Función para seleccionar o deseleccionar uno
  const handleCheckboxChange = (nombre: string) => {
    const isSelected = selectedDepartamentos.includes(nombre);
    const newSelected = isSelected
      ? selectedDepartamentos.filter((d) => d !== nombre)
      : [...selectedDepartamentos, nombre];
    onChangeSelected(newSelected);
  };

  // 🔹 Función para marcar o desmarcar todos
  const handleSelectAll = () => {
    const allSelected = selectedDepartamentos.length === departamentos.length;
    const newSelected = allSelected ? [] : departamentos.map((d) => d.nombre);
    onChangeSelected(newSelected);
  };

  const isAllSelected =
    departamentos.length > 0 && selectedDepartamentos.length === departamentos.length;

  // 🔹 Cerrar acordeón al hacer click fuera
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
    <div ref={accordionRef} className="relative w-60">
      <button
        type="button"
        onClick={toggleAccordion}
        className="flex items-center justify-between w-full h-full px-6 py-2.5 rounded-lg bg-principal-500 text-blanco font-semibold hover:bg-principal-600 transition-colors"
      >
        <span>Seleccionar Departamento</span>
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
          className="absolute left-0 top-full z-50 w-60 bg-blanco px-6 py-4 border-2 border-principal-500 rounded-b-xl shadow-lg overflow-y-auto"
          style={{ maxHeight: '200px' }}
        >
          <div className="space-y-2">
            {/* 🔹 Opción de marcar todo */}
            <label
              className={`flex justify-between items-center w-full px-4 py-2 rounded-md border transition-all duration-150 cursor-pointer ${
                isAllSelected
                  ? 'bg-principal-100 border-principal-400 text-principal-700 font-semibold'
                  : 'bg-blanco hover:bg-neutro-100 border-neutro-200'
              }`}
            >
              <span className="text-principal-500">Marcar todo</span>
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={handleSelectAll}
                className="accent-principal-500 w-4 h-4"
              />
            </label>

            {/* 🔹 Lista de departamentos */}
            {departamentos.map((d) => {
              const isChecked = selectedDepartamentos.includes(d.nombre);
              return (
                <label
                  key={d.id}
                  className={`flex justify-between items-center w-full px-4 py-2 rounded-md border transition-all duration-150 cursor-pointer ${
                    isChecked
                      ? 'bg-principal-100 border-principal-400 text-principal-700 font-semibold'
                      : 'bg-blanco hover:bg-neutro-100 border-neutro-200'
                  }`}
                >
                  <span className="text-negro">{d.nombre}</span>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleCheckboxChange(d.nombre)}
                    className="accent-principal-500 w-4 h-4"
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
