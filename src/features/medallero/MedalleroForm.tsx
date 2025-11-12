import { useState } from 'react';
import { ChevronDown, X, Save } from 'lucide-react';

// Types
interface MedalData {
  nivel: string;
  oro: number;
  plata: number;
  bronce: number;
  menciones: number;
}

// Mock data
const initialMedalData: MedalData[] = [
  { nivel: 'Nivel 1', oro: 1, plata: 1, bronce: 1, menciones: 3 },
  { nivel: 'Nivel 2', oro: 1, plata: 1, bronce: 1, menciones: 3 },
  { nivel: 'Nivel 3', oro: 1, plata: 1, bronce: 1, menciones: 2 },
  { nivel: 'Nivel 4', oro: 1, plata: 1, bronce: 1, menciones: 5 },
];

const MedalleroParametrizar = () => {
  const [selectedArea, setSelectedArea] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [competitionType] = useState('Grupal/Individual');
  const [medalData, setMedalData] = useState<MedalData[]>(initialMedalData);

  // Mock areas
  const areas = [
    'Matemáticas',
    'Ciencias Naturales',
    'Lenguaje',
    'Ciencias Sociales',
    'Inglés'
  ];

  const handleAreaSelect = (area: string) => {
    setSelectedArea(area);
    setIsDropdownOpen(false);
  };

  const handleInputChange = (index: number, field: keyof Omit<MedalData, 'nivel'>, value: string) => {
    const newData = [...medalData];
    const numValue = parseInt(value) || 0;
    newData[index] = { ...newData[index], [field]: numValue };
    setMedalData(newData);
  };

  const handleCancel = () => {
    setMedalData(initialMedalData);
    setSelectedArea('');
  };

  const handleSave = () => {
    console.log('Guardando configuración:', {
      area: selectedArea,
      competitionType,
      medalData
    });
    alert('Configuración guardada exitosamente');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Parametrizar Medallero
        </h1>

        {/* Area Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccione una Área
          </label>
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg flex items-center justify-between hover:bg-blue-700 transition-colors"
            >
              <span className="font-medium">
                {selectedArea || 'Seleccionar Área'}
              </span>
              <ChevronDown className={`w-5 h-5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                {areas.map((area) => (
                  <button
                    key={area}
                    onClick={() => handleAreaSelect(area)}
                    className="w-full text-left px-6 py-3 hover:bg-blue-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                  >
                    {area}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Competition Type */}
        <div className="mb-8">
          <span className="text-sm font-medium text-gray-700">Tipo de Competición: </span>
          <span className="text-gray-900">{competitionType}</span>
        </div>

        {/* Medal Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="px-6 py-4 text-left font-semibold">NIVEL</th>
                <th className="px-6 py-4 text-center font-semibold">Oro</th>
                <th className="px-6 py-4 text-center font-semibold">Plata</th>
                <th className="px-6 py-4 text-center font-semibold">Bronce</th>
                <th className="px-6 py-4 text-center font-semibold">Menciones</th>
              </tr>
            </thead>
            <tbody>
              {medalData.map((row, index) => (
                <tr 
                  key={row.nivel}
                  className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                >
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {row.nivel}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={row.oro}
                      onChange={(e) => handleInputChange(index, 'oro', e.target.value)}
                      className="w-16 text-center border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={row.plata}
                      onChange={(e) => handleInputChange(index, 'plata', e.target.value)}
                      className="w-16 text-center border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={row.bronce}
                      onChange={(e) => handleInputChange(index, 'bronce', e.target.value)}
                      className="w-16 text-center border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={row.menciones}
                      onChange={(e) => handleInputChange(index, 'menciones', e.target.value)}
                      className="w-16 text-center border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 px-8 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
          >
            <X className="w-5 h-5" />
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Save className="w-5 h-5" />
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default MedalleroParametrizar;
