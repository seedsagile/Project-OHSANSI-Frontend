// src/features/evaluaciones/components/AreaNivelSelector.tsx

import { ChevronDown } from 'lucide-react';
import type { Area } from '../types/evaluacion.types';

interface AreaNivelSelectorProps {
  areas: Area[];
  selectedArea: string;
  selectedNivel: string;
  onAreaChange: (idArea: string) => void;
  onNivelChange: (idNivel: string) => void;
  disabled?: boolean;
}

export const AreaNivelSelector = ({
  areas,
  selectedArea,
  selectedNivel,
  onAreaChange,
  onNivelChange,
  disabled = false,
}: AreaNivelSelectorProps) => {
  const areaSeleccionada = areas.find(a => a.id_area.toString() === selectedArea);
  
  // ✅ ORDENAR NIVELES ALFABÉTICAMENTE (A-Z)
  const niveles = areaSeleccionada?.niveles 
    ? [...areaSeleccionada.niveles].sort((a, b) => a.nombre.localeCompare(b.nombre))
    : [];

  const handleAreaChange = (idArea: string) => {
    onAreaChange(idArea);
    onNivelChange(''); // Resetear nivel al cambiar área
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Seleccione un Área <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <select
            value={selectedArea}
            onChange={(e) => handleAreaChange(e.target.value)}
            disabled={disabled}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Seleccionar Área</option>
            {areas.map((area) => (
              <option key={area.id_area} value={area.id_area}>
                {area.nombre_area}
              </option>
            ))}
          </select>
          <ChevronDown
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white pointer-events-none"
            size={20}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Seleccione un Nivel <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <select
            value={selectedNivel}
            onChange={(e) => onNivelChange(e.target.value)}
            disabled={disabled || !selectedArea || niveles.length === 0}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Seleccionar Nivel</option>
            {niveles.map((nivel) => (
              <option key={nivel.id_nivel} value={nivel.id_nivel}>
                {nivel.nombre}
              </option>
            ))}
          </select>
          <ChevronDown
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white pointer-events-none"
            size={20}
          />
        </div>
      </div>
    </div>
  );
};