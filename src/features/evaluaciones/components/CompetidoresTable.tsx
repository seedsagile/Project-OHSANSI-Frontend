// src/features/evaluaciones/components/CompetidoresTable.tsx

import type { Competidor } from '../types/evaluacion.types';

interface CompetidoresTableProps {
  competidores: Competidor[];
  onCalificar: (competidor: Competidor) => void;
  loading?: boolean;
}

export const CompetidoresTable = ({
  competidores,
  onCalificar,
  loading = false,
}: CompetidoresTableProps) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="ml-4 text-gray-500">Cargando competidores...</p>
        </div>
      </div>
    );
  }

  if (competidores.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">No se encontraron competidores para esta área y nivel</p>
        <p className="text-sm text-gray-400 mt-2">
          Seleccione un área y nivel para ver los competidores disponibles
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">NRO</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">NOMBRE</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">APELLIDO</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">CI</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">ESTADO</th>
              <th className="px-4 py-3 text-center text-sm font-semibold">CALIFICACIÓN</th>
            </tr>
          </thead>
          <tbody>
            {competidores.map((competidor, index) => (
              <tr
                key={competidor.ci}
                className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
              >
                <td className="px-4 py-3 text-sm">{index + 1}</td>
                <td className="px-4 py-3 text-sm">{competidor.nombre}</td>
                <td className="px-4 py-3 text-sm">{competidor.apellido}</td>
                <td className="px-4 py-3 text-sm">{competidor.ci}</td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      competidor.estado === 'Calificado'
                        ? 'bg-gray-200 text-gray-700'
                        : competidor.estado === 'En calificacion'
                        ? 'bg-gray-200 text-gray-700'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {competidor.estado || 'Pendiente'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {competidor.estado === 'Calificado' ? (
                    <button
                      onClick={() => onCalificar(competidor)}
                      className="px-4 py-1.5 rounded text-sm font-medium transition-colors bg-gray-500 text-white hover:bg-gray-600"
                    >
                      Calificado
                    </button>
                  ) : competidor.estado === 'En calificacion' ? (
                    <span className="text-sm font-semibold text-gray-600">
                      En proceso...
                    </span>
                  ) : (
                    <button
                      onClick={() => onCalificar(competidor)}
                      className="px-4 py-1.5 rounded text-sm font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Calificar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Total de competidores: <span className="font-semibold">{competidores.length}</span>
        </p>
      </div>
    </div>
  );
};