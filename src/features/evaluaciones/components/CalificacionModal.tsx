// src/features/evaluaciones/components/CalificacionModal.tsx

import { useState } from 'react';
import { X } from 'lucide-react';
import type { Competidor } from '../types/evaluacion.types';
import { validarCalificacion, validarObservaciones } from '../utils/validations';

interface CalificacionModalProps {
  competidor: Competidor;
  onClose: () => void;
  onSave: (idCompetidor: number, nota: number, observaciones?: string) => Promise<void>;
}

export const CalificacionModal = ({
  competidor,
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
        competidor.id_competidor,
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

        <h3 className="text-xl font-bold mb-4">
          {competidor.estado === 'Calificado' ? 'Editar Calificación' : 'Calificar Competidor'}
        </h3>

        <div className="mb-4 p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-600">Competidor</p>
          <p className="font-semibold">
            {competidor.nombres} {competidor.apellidos}
          </p>
          <p className="text-sm text-gray-500">CI: {competidor.ci}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

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
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
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
            disabled={loading}
            rows={4}
            maxLength={500}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:opacity-50"
            placeholder="Ingrese observaciones adicionales..."
          />
          <p className="text-xs text-gray-500 mt-1">
            {observaciones.length}/500 caracteres
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Guardando...
              </>
            ) : (
              'Guardar Calificación'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};