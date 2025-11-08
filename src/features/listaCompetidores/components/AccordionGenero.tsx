// src/features/listaCompetidores/components/AccordionGenero.tsx
import React, { useState, useRef, useEffect } from 'react';
import { getGenerosAPI } from '../service/service';

interface Genero {
  id: string;
  nombre: string;
}

interface AccordionGeneroProps {
  selectedGenero: string | null;
  onChangeSelected: React.Dispatch<React.SetStateAction<string | null>>;
}

export const AccordionGenero: React.FC<AccordionGeneroProps> = ({
  selectedGenero,
  onChangeSelected,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [generos, setGeneros] = useState<Genero[]>([]);
  const accordionRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Obtener géneros desde la API
  useEffect(() => {
    const fetchGeneros = async () => {
      try {
        setLoading(true);
        const data = await getGenerosAPI();
        setGeneros(data);
      } catch (error) {
        console.error('Error cargando los géneros:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGeneros();
  }, []);

  const toggleAccordion = () => setIsOpen(!isOpen);

  const handleCheckboxChange = (generoId: string) => {
    // Selección única: si ya estaba seleccionado, deselecciona; si no, selecciona
    onChangeSelected(selectedGenero === generoId ? null : generoId);
  };

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
          {loading ? (
            <p className="text-center text-neutro-400">Cargando géneros...</p>
          ) : generos.length === 0 ? (
            <p className="text-center text-neutro-400">No hay géneros disponibles</p>
          ) : (
            <div className="space-y-2">
              {generos.map((genero) => {
                const isChecked = selectedGenero === genero.id;
                return (
                  <label
                    key={genero.id}
                    className={`flex justify-between items-center w-full px-4 py-2 rounded-md border transition-all duration-150 cursor-pointer ${
                      isChecked
                        ? 'bg-principal-100 border-principal-400 text-principal-700 font-semibold'
                        : 'bg-blanco hover:bg-neutro-100 border-neutro-200'
                    }`}
                  >
                    <span className="text-negro">{genero.nombre}</span>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleCheckboxChange(genero.id)}
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
