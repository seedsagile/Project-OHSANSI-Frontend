// src/features/evaluaciones/components/CalificacionModal.tsx

import { useState } from 'react';
import { X, Save } from 'lucide-react';
import type { Competidor } from '../types/evaluacion.types';
import { validarCalificacion, validarObservaciones } from '../utils/validations';

interface CalificacionModalProps {
  competidor: Competidor;
  areaSeleccionada: string; // Nombre del área seleccionada
  nivelSeleccionado: string; // Nombre del nivel seleccionado
  onClose: () => void;
  onSave: (ci: string, nota: number, observaciones?: string) => Promise<void>;
}

export const CalificacionModal = ({
  competidor,
  areaSeleccionada,
  nivelSeleccionado,
  onClose,
  onSave,
}: CalificacionModalProps) => {
  const [calificacion, setCalificacion] = useState(
    competidor.calificacion?.toString() || ''
  );
  const [observaciones, setObservaciones] = useState(competidor.observaciones || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSave = async () => {
    setError('');

    // Validar calificación
    const validacion = validarCalificacion(calificacion);
    if (!validacion.valido) {
      setError(validacion.mensaje || 'Calificación inválida');
      return;
    }

    // Validar observaciones
    if (observaciones && !validarObservaciones(observaciones)) {
      setError('Las observaciones no pueden exceder 500 caracteres');
      return;
    }

    try {
      setLoading(true);
      await onSave(
        competidor.ci,
        parseFloat(calificacion),
        observaciones.trim() || undefined
      );
      onClose();
    } catch (error) {
      setError('Error al guardar la evaluación. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          disabled={loading}
        >
          <X size={24} />
        </button>

        <h3 className="text-2xl font-bold mb-6 text-center">Registrar Evaluación</h3>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Área - Solo lectura */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Área</label>
          <input
            type="text"
            value={areaSeleccionada}
            readOnly
            className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
          />
        </div>

        {/* Nivel - Solo lectura */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Nivel</label>
          <input
            type="text"
            value={nivelSeleccionado}
            readOnly
            className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
          />
        </div>

        {/* Nombre del Competidor - Solo lectura */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre del Competidor
          </label>
          <input
            type="text"
            value={competidor.nombre}
            readOnly
            placeholder="Ej: Pepito"
            className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
          />
        </div>

        {/* Apellido del Competidor - Solo lectura */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Apellido del Competidor
          </label>
          <input
            type="text"
            value={competidor.apellido}
            readOnly
            placeholder="Ej: Perez"
            className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
          />
        </div>

        {/* CI - Solo lectura */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">CI</label>
          <input
            type="text"
            value={competidor.ci}
            readOnly
            placeholder="Ej: 9379539"
            className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
          />
        </div>

        {/* Nota del competidor - Editable */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nota del competidor
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={calificacion}
            onChange={(e) => setCalificacion(e.target.value)}
            disabled={loading}
            placeholder="Ej: 100"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>

        {/* Observaciones - Editable */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Observaciones
          </label>
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            disabled={loading}
            rows={3}
            maxLength={500}
            placeholder="Ej: escriba aqui las observaciones"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:opacity-50"
          />
        </div>

        {/* Botón Guardar */}
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center font-medium"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Guardando...
            </>
          ) : (
            <>
              <Save size={20} className="mr-2" />
              Guardar
            </>
          )}
        </button>
      </div>
    </div>
  );
};