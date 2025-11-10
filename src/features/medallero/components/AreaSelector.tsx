// src/features/medallero/components/AreaSelector.tsx

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Area } from '../types/medallero.types';

interface AreaSelectorProps {
  areas: Area[];
  selectedArea: Area | null;
  onSelect: (area: Area) => void;
  loading: boolean;
}

export const AreaSelector = ({ 
  areas, 
  selectedArea, 
  onSelect,
  loading 
}: AreaSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Seleccione un Área
      </label>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={loading || areas.length === 0}
          className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg flex items-center justify-between hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="font-medium">
            {selectedArea ? selectedArea.nombre : 'Seleccionar Área'}
          </span>
          <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {areas.map((area) => (
              <button
                key={area.id_area}
                onClick={() => {
                  onSelect(area);
                  setIsOpen(false);
                }}
                className="w-full text-left px-6 py-3 hover:bg-blue-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
              >
                <div className="font-medium">{area.nombre}</div>
                <div className="text-sm text-gray-500">Gestión {area.gestion}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};