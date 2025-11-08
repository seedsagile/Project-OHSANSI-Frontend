// src/features/listaCompetidores/components/AccordionGrado.tsx
import React, { useState, useRef, useEffect } from 'react';
import { getGradosAPI } from '../service/service';

interface Grado {
  id_grado_escolaridad: number;
  nombre: string;
}

interface AccordionGradoProps {
  selectedGrado: number | null;
  onChangeSelected: React.Dispatch<React.SetStateAction<number | null>>;
}

export const AccordionGrado: React.FC<AccordionGradoProps> = ({
  selectedGrado,
  onChangeSelected,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [grados, setGrados] = useState<Grado[]>([]);
  const accordionRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  const toggleAccordion = () => setIsOpen(!isOpen);

  const handleCheckboxChange = (id_grado_escolaridad: number) => {
    // Selección única: si ya estaba seleccionado, deselecciona; si no, selecciona
    onChangeSelected(selectedGrado === id_grado_escolaridad ? null : id_grado_escolaridad);
  };

  // 🔹 Obtener los grados desde la API al montar el componente
  useEffect(() => {
    const fetchGrados = async () => {
      try {
        setLoading(true);
        const data = await getGradosAPI();
        setGrados(data);
      } catch (error) {
        console.error('Error al obtener los grados:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGrados();
  }, []);

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
      {/* Botón principal */}
      <button
        type="button"
        onClick={toggleAccordion}
        className="flex items-center justify-between w-full px-6 py-2.5 rounded-lg bg-principal-500 text-blanco font-semibold hover:bg-principal-600 transition-colors"
      >
        <span>Seleccionar Grado</span>
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

      {/* Contenido del acordeón */}
      {isOpen && (
        <div
          className="absolute left-0 top-full z-50 w-60 bg-blanco px-6 py-4 border-2 border-principal-500 rounded-b-xl shadow-lg overflow-y-auto"
          style={{ maxHeight: '200px' }}
        >
          {loading ? (
            <div className="text-center text-gray-500 py-2">Cargando grados...</div>
          ) : grados.length === 0 ? (
            <div className="text-center text-gray-500 py-2">No hay grados disponibles</div>
          ) : (
            <div className="space-y-2">
              {grados.map((grado) => {
                const isChecked = selectedGrado === grado.id_grado_escolaridad;
                return (
                  <label
                    key={grado.id_grado_escolaridad}
                    className={`flex justify-between items-center w-full px-4 py-2 rounded-md border transition-all duration-150 cursor-pointer ${
                      isChecked
                        ? 'bg-principal-100 border-principal-400 text-principal-700 font-semibold'
                        : 'bg-blanco hover:bg-neutro-100 border-neutro-200'
                    }`}
                  >
                    <span className="text-negro">{grado.nombre}</span>
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
