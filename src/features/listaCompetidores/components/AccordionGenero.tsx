import React, { useState } from 'react';

export const AccordionGenero: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGeneros, setSelectedGeneros] = useState<string[]>([]);

  const generos = ['Masculino', 'Femenino'];

  const toggleAccordion = () => setIsOpen(!isOpen);

  const handleCheckboxChange = (genero: string) => {
    const isSelected = selectedGeneros.includes(genero);
    const newSelected = isSelected
      ? selectedGeneros.filter((g) => g !== genero)
      : [...selectedGeneros, genero];
    setSelectedGeneros(newSelected);
  };

  return (
    <div className="relative w-60">
      <button
        type="button"
        onClick={toggleAccordion}
        className="flex items-center justify-between w-full px-6 py-2.5 rounded-lg bg-principal-500 text-blanco font-semibold hover:bg-principal-600 transition-colors"
      >
        <span>Seleccionar Género</span>

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
            {generos.map((genero) => {
              const isChecked = selectedGeneros.includes(genero);
              return (
                <label
                  key={genero}
                  className={`flex justify-between items-center w-full px-4 py-2 rounded-md border transition-all duration-150 cursor-pointer ${
                    isChecked
                      ? 'bg-principal-100 border-principal-400 text-principal-700 font-semibold'
                      : 'bg-blanco hover:bg-neutro-100 border-neutro-200'
                  }`}
                >
                  <span className="text-negro">{genero}</span>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleCheckboxChange(genero)}
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
