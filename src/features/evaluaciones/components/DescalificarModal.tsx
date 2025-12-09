// src/features/evaluaciones/components/DescalificarModal.tsx
import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import type { Competidor } from '../types/evaluacion.types';

interface DescalificarModalProps {
  competidor: Competidor;
  onClose: () => void;
  onConfirm: (idCompetidor: number, observaciones: string) => Promise<void>;
}

export const DescalificarModal = ({
  competidor,
  onClose,
  onConfirm,
}: DescalificarModalProps) => {
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    if (!observaciones.trim()) {
      setError('Las observaciones son obligatorias para descalificar.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onConfirm(competidor.id_competidor, observaciones);
      onClose();
    } catch (e) {
      // El error ya se muestra a través de un toast en el hook
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div className="px-6 py-4 flex items-center justify-between border-b">
          <h3 className="text-xl font-bold text-gray-900">Descalificar Competidor</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            Estás a punto de descalificar a <span className="font-bold">{competidor.nombre} {competidor.apellido}</span> (CI: {competidor.ci}). Esta acción es irreversible.
          </p>
          <div className="mb-4">
            <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700 mb-1">
              Motivo / Observaciones <span className="text-red-500">*</span>
            </label>
            <textarea
              id="observaciones"
              value={observaciones}
              onChange={(e) => {
                setObservaciones(e.target.value);
                if (error) setError('');
              }}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 resize-none ${
                error ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="Especifique el motivo de la descalificación..."
            />
            {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || !observaciones.trim()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Descalificando...
              </>
            ) : (
              <>
                <AlertTriangle size={18} className="mr-2" />
                Confirmar Descalificación
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
