// src/features/examenes/components/ModalCrearExamen.tsx
import { useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import type { CrearExamenData } from '../types';

type ModalCrearExamenProps = {
  isOpen: boolean;
  onClose: () => void;
  onGuardar: (data: CrearExamenData) => void;
  loading?: boolean;
};

export const ModalCrearExamen = ({
  isOpen,
  onClose,
  onGuardar,
  loading = false,
}: ModalCrearExamenProps) => {
  const [nombre, setNombre] = useState('');
  const [ponderacion, setPonderacion] = useState<number>(0);
  const [maximaNota, setMaximaNota] = useState<number>(100);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleGuardar = () => {
    setError('');

    // Validaciones
    if (!nombre.trim()) {
      setError('Por favor ingrese el nombre del examen');
      return;
    }

    if (ponderacion <= 0 || ponderacion > 100) {
      setError('La ponderación debe ser mayor a 0 y menor o igual a 100');
      return;
    }

    if (maximaNota <= 0) {
      setError('La nota máxima debe ser mayor a 0');
      return;
    }

    onGuardar({
      nombre: nombre.trim(),
      ponderacion,
      maxima_nota: maximaNota,
    });

    // Limpiar formulario
    limpiarFormulario();
  };

  const limpiarFormulario = () => {
    setNombre('');
    setPonderacion(0);
    setMaximaNota(100);
    setError('');
  };

  const handleCancelar = () => {
    limpiarFormulario();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleCancelar}
    >
      <div
        className="bg-white rounded-xl shadow-2xl border border-gray-900 w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 border-b pb-3">
          <h2 className="text-2xl font-bold text-gray-800">
            Crear Nuevo Examen
          </h2>
          <button
            onClick={handleCancelar}
            className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {/* Nombre del Examen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Examen: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => {
                setNombre(e.target.value);
                setError('');
              }}
              placeholder="Ej: Examen Teórico"
              disabled={loading}
              className="w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-4 transition-colors text-lg shadow-inner border-gray-300 focus:ring-blue-100 focus:border-blue-500"
            />
          </div>

          {/* Ponderación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ponderación (%): <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={ponderacion || ''}
              onChange={(e) => {
                setPonderacion(Number(e.target.value));
                setError('');
              }}
              placeholder="Ej: 60"
              min="1"
              max="100"
              disabled={loading}
              className="w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-4 transition-colors text-lg shadow-inner border-gray-300 focus:ring-blue-100 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Valor entre 1 y 100
            </p>
          </div>

          {/* Nota Máxima */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nota Máxima: <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={maximaNota || ''}
              onChange={(e) => {
                setMaximaNota(Number(e.target.value));
                setError('');
              }}
              placeholder="Ej: 100"
              min="1"
              disabled={loading}
              className="w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-4 transition-colors text-lg shadow-inner border-gray-300 focus:ring-blue-100 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Nota máxima que puede obtener un estudiante
            </p>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-4 justify-end pt-4 mt-6">
          <button
            type="button"
            onClick={handleCancelar}
            disabled={loading}
            className="flex items-center gap-2 font-semibold py-2.5 px-6 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
          >
            <X className="w-5 h-5" />
            <span>Cancelar</span>
          </button>
          <button
            type="button"
            onClick={handleGuardar}
            disabled={
              loading ||
              !nombre.trim() ||
              ponderacion <= 0 ||
              maximaNota <= 0
            }
            className="flex items-center gap-2 font-semibold py-2.5 px-8 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-300/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Guardar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};