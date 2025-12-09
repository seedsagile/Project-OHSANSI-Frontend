import { ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Area, Competencia, Examen } from '../types/evaluacion.types';
import { evaluacionService } from '../services/evaluacionService';

interface AreaNivelSelectorProps {
  areas: Area[];
  competencias: Competencia[];
  selectedArea: string;
  selectedNivel: string;
  selectedCompetencia: string;
  selectedExamen: string;
  onAreaChange: (idArea: string) => void;
  onNivelChange: (idNivel: string) => void;
  onCompetenciaChange: (idCompetencia: string) => void;
  onExamenChange: (idExamen: string) => void;
  disabled?: boolean;
}

export const AreaNivelSelector = ({
  areas,
  competencias,
  selectedArea,
  selectedNivel,
  selectedCompetencia,
  selectedExamen,
  onAreaChange,
  onNivelChange,
  onCompetenciaChange,
  onExamenChange,
  disabled = false,
}: AreaNivelSelectorProps) => {
  const [examenes, setExamenes] = useState<Examen[]>([]);
  const areaSeleccionada = areas.find(a => a.id_area.toString() === selectedArea);
  
  const niveles = areaSeleccionada?.niveles 
    ? [...areaSeleccionada.niveles].sort((a, b) => a.nombre.localeCompare(b.nombre))
    : [];

  useEffect(() => {
    if (selectedCompetencia) {
      evaluacionService.getExamenesPorCompetencia(Number(selectedCompetencia))
        .then(setExamenes)
        .catch(console.error);
    } else {
      setExamenes([]);
    }
  }, [selectedCompetencia]);

  const handleAreaChange = (idArea: string) => {
    onAreaChange(idArea);
    onNivelChange('');
    onCompetenciaChange('');
    onExamenChange('');
  };

  const handleNivelChange = (idNivel: string) => {
    onNivelChange(idNivel);
    onCompetenciaChange('');
    onExamenChange('');
  };

  const handleCompetenciaChange = (idCompetencia: string) => {
    onCompetenciaChange(idCompetencia);
    onExamenChange('');
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* Selector de Área */}
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

      {/* Selector de Nivel */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Seleccione un Nivel <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <select
            value={selectedNivel}
            onChange={(e) => handleNivelChange(e.target.value)}
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

      {/* Selector de Competencia */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Seleccione una Competencia <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <select
            value={selectedCompetencia}
            onChange={(e) => handleCompetenciaChange(e.target.value)}
            disabled={disabled || !selectedNivel}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Seleccionar Competencia</option>
            {competencias.map((competencia) => (
              <option key={competencia.id_competencia} value={competencia.id_competencia}>
                {competencia.nombre}
              </option>
            ))}
          </select>
          <ChevronDown
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white pointer-events-none"
            size={20}
          />
        </div>
      </div>

      {/* Selector de Examen */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Seleccione un Examen <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <select
            value={selectedExamen}
            onChange={(e) => onExamenChange(e.target.value)}
            disabled={disabled || !selectedCompetencia}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Seleccionar Examen</option>
            {examenes.map((examen) => (
              <option key={examen.id_examen_conf} value={examen.id_examen_conf}>
                {examen.nombre}
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