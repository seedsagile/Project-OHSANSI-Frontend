// src/features/evaluaciones/components/ModificarNotaModal.tsx

import { useState } from 'react';
import { X, Save } from 'lucide-react';
import type { Competidor } from '../types/evaluacion.types';
import { validarCalificacion, validarObservaciones } from '../utils/validations';

interface ModificarNotaModalProps {
  competidor: Competidor;
  areaSeleccionada: string;
  nivelSeleccionado: string;
  onClose: () => void;
  onSave: (ci: string, nota: number, justificacion: string) => Promise<void>;
}

export const ModificarNotaModal = ({
  competidor,
  areaSeleccionada,
  nivelSeleccionado,
  onClose,
  onSave,
}: ModificarNotaModalProps) => {
  const [calificacion, setCalificacion] = useState(
    competidor.calificacion?.toString() || ''
  );
  const [justificacion, setJustificacion] = useState('');
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

    // Validar justificación (OBLIGATORIA)
    if (!justificacion.trim()) {
      setError('La justificación es obligatoria para modificar la nota');
      return;
    }

    if (justificacion && !validarObservaciones(justificacion)) {
      setError('La justificación no puede exceder 500 caracteres');
      return;
    }

    try {
      setLoading(true);
      await onSave(
        competidor.ci,
        parseFloat(calificacion),
        justificacion.trim()
      );
      onClose();
    } catch (error) {
      setError('Error al modificar la evaluación. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Modificar Nota</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Área y Nivel - Lado a lado */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Área</label>
              <input
                type="text"
                value={areaSeleccionada}
                readOnly
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nivel</label>
              <input
                type="text"
                value={nivelSeleccionado}
                readOnly
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 text-sm"
              />
            </div>
          </div>

          {/* Nombre del Competidor */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Competidor
            </label>
            <input
              type="text"
              value={competidor.nombre}
              readOnly
              placeholder="Ej: Pepito"
              className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 text-sm"
            />
          </div>

          {/* Apellido del Competidor */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Apellido del Competidor
            </label>
            <input
              type="text"
              value={competidor.apellido}
              readOnly
              placeholder="Ej: Perez"
              className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 text-sm"
            />
          </div>

          {/* CI */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">CI</label>
            <input
              type="text"
              value={competidor.ci}
              readOnly
              placeholder="Ej: 9379539"
              className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 text-sm"
            />
          </div>

          {/* Nota Anterior (solo muestra) */}
          <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <label className="block text-sm font-medium text-yellow-800 mb-1">
              Nota Anterior
            </label>
            <p className="text-lg font-bold text-yellow-900">
              {competidor.calificacion?.toFixed(2) || '0.00'}
            </p>
          </div>

          {/* Nueva Nota */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nueva Nota <span className="text-red-500">*</span>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-sm"
            />
          </div>

          {/* Justificación - OBLIGATORIO */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Justificación <span className="text-red-500">*</span>
            </label>
            <textarea
              value={justificacion}
              onChange={(e) => setJustificacion(e.target.value)}
              disabled={loading}
              rows={4}
              maxLength={500}
              placeholder="Explique el motivo de la modificación de la nota (obligatorio)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:opacity-50 text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              {justificacion.length}/500 caracteres - Campo obligatorio
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
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
                Guardar Modificación
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};