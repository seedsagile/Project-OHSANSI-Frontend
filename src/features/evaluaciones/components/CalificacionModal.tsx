// src/features/evaluaciones/components/CalificacionModal.tsx

import { useState } from 'react';
import { X, Save } from 'lucide-react';
import type { Competidor } from '../types/evaluacion.types';
import { 
  validarFormularioCalificacion,
  validarCalificacion,
  validarObservacionesCalificacion
} from '../utils/validations';
import { ModalConfirmacion } from '@/features/areas/components/ModalConfirmacion';

interface CalificacionModalProps {
  competidor: Competidor;
  areaSeleccionada: string;
  nivelSeleccionado: string;
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
  const [errores, setErrores] = useState<Record<string, string>>({});
  
  // Estados para modales de confirmación
  const [modalExito, setModalExito] = useState(false);
  const [modalError, setModalError] = useState(false);
  const [mensajeError, setMensajeError] = useState('');

  const handleSave = async () => {
    setErrores({});

    // Validación completa del formulario
    const validacion = validarFormularioCalificacion({
      nota: calificacion,
      observaciones: observaciones || undefined,
    });

    if (!validacion.valido && validacion.errores) {
      setErrores(validacion.errores);
      return;
    }

    // Validación adicional por campo
    const validacionNota = validarCalificacion(calificacion);
    if (!validacionNota.valido) {
      setErrores({ nota: validacionNota.mensaje || 'Calificación inválida' });
      return;
    }

    // Solo validar observaciones si hay contenido
    if (observaciones && observaciones.trim().length > 0) {
      const validacionObs = validarObservacionesCalificacion(observaciones);
      if (!validacionObs.valido) {
        setErrores({ observaciones: validacionObs.mensaje || 'Observaciones inválidas' });
        return;
      }
    }

    try {
      setLoading(true);
      await onSave(
        competidor.ci,
        parseFloat(calificacion),
        observaciones.trim() || undefined
      );
      
      // Mostrar modal de éxito
      setModalExito(true);
      
      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        setModalExito(false);
        onClose();
      }, 2000);
    } catch (error: any) {
      setLoading(false);
      const errorMsg = error?.response?.data?.message || 'Error al guardar la evaluación. Intente nuevamente.';
      setMensajeError(errorMsg);
      setModalError(true);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">Registrar Evaluación</h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              <X size={24} />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-4">
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

            {/* Nota del competidor */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nota del competidor <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={calificacion}
                onChange={(e) => {
                  setCalificacion(e.target.value);
                  if (errores.nota) {
                    setErrores(prev => {
                      const newErrores = { ...prev };
                      delete newErrores.nota;
                      return newErrores;
                    });
                  }
                }}
                disabled={loading}
                placeholder="Ej: 100"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 disabled:opacity-50 text-sm ${
                  errores.nota 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {errores.nota && (
                <p className="mt-1 text-sm text-red-600">{errores.nota}</p>
              )}
            </div>

            {/* Observaciones */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observaciones <span className="text-gray-400 text-xs">(Opcional)</span>
              </label>
              <textarea
                value={observaciones}
                onChange={(e) => {
                  setObservaciones(e.target.value);
                  if (errores.observaciones) {
                    setErrores(prev => {
                      const newErrores = { ...prev };
                      delete newErrores.observaciones;
                      return newErrores;
                    });
                  }
                }}
                disabled={loading}
                rows={3}
                maxLength={300}
                placeholder="Ej: escriba aquí las observaciones"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 resize-none disabled:opacity-50 text-sm ${
                  errores.observaciones 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {errores.observaciones && (
                <p className="mt-1 text-sm text-red-600">{errores.observaciones}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {observaciones.length}/300 caracteres
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
                  Guardar
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Modal de éxito */}
      <ModalConfirmacion
        isOpen={modalExito}
        onClose={() => {}}
        title="Registro exitoso"
        type="success"
      >
        Se ha registrado la calificación del estudiante exitosamente.
      </ModalConfirmacion>

      {/* Modal de error */}
      <ModalConfirmacion
        isOpen={modalError}
        onClose={() => setModalError(false)}
        title="Error al guardar"
        type="error"
      >
        {mensajeError}
      </ModalConfirmacion>
    </>
  );
};