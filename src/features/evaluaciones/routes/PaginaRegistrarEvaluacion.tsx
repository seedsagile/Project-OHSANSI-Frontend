import { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';

// ============ TYPES ============
interface Competidor {
  nro: number;
  nombres: string;
  apellidos: string;
  ci: string;
  estado: 'Pendiente' | 'En calificacion' | 'Calificado';
  calificacion?: number;
  observaciones?: string;
}

interface Area {
  id: string;
  nombre: string;
}

interface Nivel {
  id: string;
  nombre: string;
}

interface CalificacionData {
  competidorId: string;
  calificacion: number;
  observaciones?: string;
  fecha: string;
}

// ============ MOCK DATA ============
const mockAreas: Area[] = [
  { id: '1', nombre: 'Matemáticas' },
  { id: '2', nombre: 'Ciencias' },
  { id: '3', nombre: 'Literatura' },
  { id: '4', nombre: 'Artes' }
];

const mockNiveles: Nivel[] = [
  { id: '1', nombre: 'Inicial' },
  { id: '2', nombre: 'Intermedio' },
  { id: '3', nombre: 'Avanzado' }
];

const mockCompetidores: Competidor[] = [
  { nro: 1, nombres: 'Juan Carlos', apellidos: 'Pérez López', ci: '12345678', estado: 'Pendiente' },
  { nro: 2, nombres: 'María Elena', apellidos: 'González Ruiz', ci: '23456789', estado: 'En calificacion' },
  { nro: 3, nombres: 'Pedro José', apellidos: 'Martínez Silva', ci: '34567890', estado: 'Pendiente' },
  { nro: 4, nombres: 'Ana María', apellidos: 'Rodríguez Castro', ci: '45678901', estado: 'Pendiente' },
  { nro: 5, nombres: 'Luis Alberto', apellidos: 'Fernández Mora', ci: '56789012', estado: 'Calificado', calificacion: 85 },
  { nro: 6, nombres: 'Carmen Rosa', apellidos: 'Sánchez Vega', ci: '67890123', estado: 'Pendiente' },
  { nro: 7, nombres: 'Roberto Carlos', apellidos: 'Torres Mendoza', ci: '78901234', estado: 'Pendiente' },
  { nro: 8, nombres: 'Patricia Isabel', apellidos: 'Ramírez Flores', ci: '89012345', estado: 'Pendiente' }
];

// ============ COMPONENTS ============
const AreaNivelSelector = ({ 
  selectedArea, 
  selectedNivel, 
  onAreaChange, 
  onNivelChange 
}: {
  selectedArea: string;
  selectedNivel: string;
  onAreaChange: (area: string) => void;
  onNivelChange: (nivel: string) => void;
}) => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Seleccione una Área
        </label>
        <div className="relative">
          <select
            value={selectedArea}
            onChange={(e) => onAreaChange(e.target.value)}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar Área</option>
            {mockAreas.map(area => (
              <option key={area.id} value={area.id}>{area.nombre}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white pointer-events-none" size={20} />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Seleccione una Nivel
        </label>
        <div className="relative">
          <select
            value={selectedNivel}
            onChange={(e) => onNivelChange(e.target.value)}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar Nivel</option>
            {mockNiveles.map(nivel => (
              <option key={nivel.id} value={nivel.id}>{nivel.nombre}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white pointer-events-none" size={20} />
        </div>
      </div>
    </div>
  );
};

const SearchBar = ({ 
  searchTerm, 
  onSearchChange 
}: {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}) => {
  return (
    <div className="flex gap-3 mb-6">
      <div className="flex-1 relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Nombre Completo del competidor"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
        Buscar
      </button>
    </div>
  );
};

const CalificacionModal = ({ 
  competidor, 
  onClose, 
  onSave 
}: {
  competidor: Competidor;
  onClose: () => void;
  onSave: (data: CalificacionData) => void;
}) => {
  const [calificacion, setCalificacion] = useState(competidor.calificacion?.toString() || '');
  const [observaciones, setObservaciones] = useState(competidor.observaciones || '');

  const handleSave = () => {
    if (!calificacion || parseFloat(calificacion) < 0 || parseFloat(calificacion) > 100) {
      alert('Por favor ingrese una calificación válida entre 0 y 100');
      return;
    }

    onSave({
      competidorId: competidor.ci,
      calificacion: parseFloat(calificacion),
      observaciones: observaciones.trim() || undefined,
      fecha: new Date().toISOString()
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold mb-4">Calificar Competidor</h3>
        
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-600">Competidor</p>
          <p className="font-semibold">{competidor.nombres} {competidor.apellidos}</p>
          <p className="text-sm text-gray-500">CI: {competidor.ci}</p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Calificación (0-100) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={calificacion}
            onChange={(e) => setCalificacion(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ingrese la calificación"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Observaciones (opcional)
          </label>
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Ingrese observaciones adicionales..."
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Guardar Calificación
          </button>
        </div>
      </div>
    </div>
  );
};

const CompetidoresTable = ({ 
  competidores, 
  onCalificar 
}: {
  competidores: Competidor[];
  onCalificar: (competidor: Competidor) => void;
}) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">NRO</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">NOMBRES</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">APELLIDOS</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">CI</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">ESTADOS</th>
              <th className="px-4 py-3 text-center text-sm font-semibold">CALIFICACIÓN</th>
            </tr>
          </thead>
          <tbody>
            {competidores.map((competidor, index) => (
              <tr key={competidor.ci} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="px-4 py-3 text-sm">{competidor.nro}</td>
                <td className="px-4 py-3 text-sm">{competidor.nombres}</td>
                <td className="px-4 py-3 text-sm">{competidor.apellidos}</td>
                <td className="px-4 py-3 text-sm">{competidor.ci}</td>
                <td className="px-4 py-3 text-sm font-medium">{competidor.estado}</td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => onCalificar(competidor)}
                    disabled={competidor.estado === 'Calificado'}
                    className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                      competidor.estado === 'Calificado'
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    Calificar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============ MAIN COMPONENT ============
export function PaginaRegistrarEvaluacion() {
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedNivel, setSelectedNivel] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [competidores, setCompetidores] = useState<Competidor[]>(mockCompetidores);
  const [selectedCompetidor, setSelectedCompetidor] = useState<Competidor | null>(null);

  const filteredCompetidores = competidores.filter(c => {
    const fullName = `${c.nombres} ${c.apellidos}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  const handleSaveCalificacion = (data: CalificacionData) => {
    setCompetidores(prev => prev.map(c => 
      c.ci === data.competidorId 
        ? { ...c, calificacion: data.calificacion, observaciones: data.observaciones, estado: 'Calificado' as const }
        : c
    ));
    setSelectedCompetidor(null);
  };

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold mb-8 text-gray-900">Registrar Evaluación</h1>
      
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Fase 1</h2>
        
        <AreaNivelSelector
          selectedArea={selectedArea}
          selectedNivel={selectedNivel}
          onAreaChange={setSelectedArea}
          onNivelChange={setSelectedNivel}
        />
        
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      </div>

      <CompetidoresTable
        competidores={filteredCompetidores}
        onCalificar={setSelectedCompetidor}
      />

      {selectedCompetidor && (
        <CalificacionModal
          competidor={selectedCompetidor}
          onClose={() => setSelectedCompetidor(null)}
          onSave={handleSaveCalificacion}
        />
      )}
    </div>
  );
}