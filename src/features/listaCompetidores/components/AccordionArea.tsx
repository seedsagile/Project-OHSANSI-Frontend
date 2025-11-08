import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../../../api/ApiPhp';
import type { Area } from '../interface/interface';

interface AccordionAreaProps {
  responsableId: number;
  selectedAreas: Area[];
  onChangeSelected?: (selected: Area[]) => void;
}

export const AccordionArea: React.FC<AccordionAreaProps> = ({
  responsableId,
  selectedAreas,
  onChangeSelected,
}) => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [localSelectedAreas, setLocalSelectedAreas] = useState<Area[]>([]);
  const accordionRef = useRef<HTMLDivElement>(null); // <- ref para detectar clicks fuera

  const toggleAccordion = () => setIsOpen(!isOpen);

  useEffect(() => {
    setLocalSelectedAreas(selectedAreas);
  }, [selectedAreas]);

  // Fetch interno de áreas
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/responsable/${responsableId}`);
        setAreas(response.data.data.areas || []);
      } catch (error) {
        console.error('Error al obtener áreas:', error);
        setAreas([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAreas();
  }, [responsableId]);

  const handleCheckboxChange = (area: Area) => {
    const isSelected = localSelectedAreas.some((a) => a.id_area === area.id_area);
    const newSelected = isSelected
      ? localSelectedAreas.filter((a) => a.id_area !== area.id_area)
      : [...localSelectedAreas, area];

    setLocalSelectedAreas(newSelected);
    onChangeSelected?.(newSelected);
  };

  // Cerrar acordeón al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accordionRef.current && !accordionRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={accordionRef} className="relative w-60">
      <button
        type="button"
        onClick={toggleAccordion}
        className="flex items-center justify-between w-full px-6 py-2.5 rounded-lg bg-principal-500 text-blanco font-semibold hover:bg-principal-600 transition-colors"
      >
        <span>Seleccionar Área</span>
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
            <p className="text-neutro-700 text-sm text-center">Cargando áreas...</p>
          ) : areas.length === 0 ? (
            <p className="text-neutro-700 text-sm text-center">No hay áreas disponibles.</p>
          ) : (
            <div className="space-y-2">
              {areas.map((area) => {
                const isChecked = localSelectedAreas.some((a) => a.id_area === area.id_area);
                return (
                  <label
                    key={area.id_area}
                    className={`flex justify-between items-center w-full px-4 py-2 rounded-md border transition-all duration-150 cursor-pointer ${
                      isChecked
                        ? 'bg-principal-100 border-principal-400 text-principal-700 font-semibold'
                        : 'bg-blanco hover:bg-neutro-100 border-neutro-200'
                    }`}
                  >
                    <span className="text-negro">{area.nombre}</span>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleCheckboxChange(area)}
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
