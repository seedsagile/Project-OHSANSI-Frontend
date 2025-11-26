import { useState } from 'react';
import { X, Save } from 'lucide-react';
import type { Competidor } from '../types/evaluacion.types';
import { 
  validarFormularioModificacion,
  validarCalificacion,
  validarObservacionesModificacion
} from '../utils/validations';
import { ModalConfirmacion } from '@/features/areas/components/ModalConfirmacion';

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
  const [justificacion, setJustificacion] = useState(competidor.observaciones || '');
  const [loading, setLoading] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
  
  // Estados para modales de confirmación
  const [modalExito, setModalExito] = useState(false);
  const [modalError, setModalError] = useState(false);
  const [mensajeError, setMensajeError] = useState('');

  // ➡️ Lógica de manejo de entrada para la nota (punto, máximo 2 decimales, máximo 100)
  const handleCalificacionChange = (value: string) => {
    // 1. FILTRO INICIAL: Reemplazar comas (,) por puntos (.) y eliminar caracteres no válidos
    let valorLimpio = value.replace(/,/g, '.').replace(/[^\d.]/g, '');

    // 2. RESTRICCIÓN DE PUNTOS Y DECIMALES
    
    // a) Evitar que el punto sea el primer carácter (lo convierte en "0.")
    if (valorLimpio.startsWith('.')) {
        valorLimpio = `0${valorLimpio}`;
    }

    // b) Dividir la cadena en partes (entera y decimal)
    const partes = valorLimpio.split('.');

    // c) Asegurar que solo haya una parte decimal (un solo punto)
    if (partes.length > 2) {
        valorLimpio = `${partes[0]}.${partes[1]}`;
    }

    // d) BLOQUEAR MÁS DE DOS DECIMALES
    if (partes.length === 2 && partes[1].length > 2) {
        // Cortamos la cadena para dejar solo los primeros dos decimales.
        valorLimpio = `${partes[0]}.${partes[1].substring(0, 2)}`;
    }
    
    // 3. RESTRICCIÓN DE RANGO (Solo la parte entera, para evitar entradas como 101)
    if (partes[0].length > 3) {
        valorLimpio = valorLimpio.substring(0, 3);
    }
    
    const valorNumerico = parseFloat(valorLimpio);

    // Si la nota supera 100, la forzamos a 100 o 100.00
    if (!isNaN(valorNumerico) && valorNumerico > 100) {
        if (valorLimpio.includes('.')) {
            valorLimpio = '100.00';
        } else {
            valorLimpio = '100';
        }
    }

    setCalificacion(valorLimpio);
    
    // Limpiar error al escribir
    if (errores.nota) {
      setErrores(prev => {
        const newErrores = { ...prev };
        delete newErrores.nota;
        return newErrores;
      });
    }
  };

  const handleSave = async () => {
    setErrores({});

    // Validación completa del formulario
    const validacion = validarFormularioModificacion({
      nota: calificacion,
      observaciones: justificacion,
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

    const validacionObs = validarObservacionesModificacion(justificacion);
    if (!validacionObs.valido) {
      setErrores({ observaciones: validacionObs.mensaje || 'Justificación inválida' });
      return;
    }

    try {
      setLoading(true);
      await onSave(
        competidor.ci,
        parseFloat(calificacion),
        justificacion.trim()
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
      const errorMsg = error?.response?.data?.message || 'Error al modificar la evaluación. Intente nuevamente.';
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
            <h3 className="text-xl font-bold text-gray-900">Modificar Evaluacion</h3>
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
                type="text" // ⬅️ Cambiado de "number" a "text" para controlar mejor la entrada decimal
                min="0"
                max="100"
                step="0.01"
                value={calificacion}
                onChange={(e) => handleCalificacionChange(e.target.value)} // ⬅️ Usando el nuevo handler
                disabled={loading}
                placeholder="Ej: 100.00"
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

            {/* Justificación - OBLIGATORIO */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observaciones <span className="text-red-500">*</span>
              </label>
              <textarea
                value={justificacion}
                onChange={(e) => {
                  setJustificacion(e.target.value);
                  if (errores.observaciones) {
                    setErrores(prev => {
                      const newErrores = { ...prev };
                      delete newErrores.observaciones;
                      return newErrores;
                    });
                  }
                }}
                disabled={loading}
                rows={4}
                maxLength={300}
                placeholder="Explique el motivo de la modificación de la nota (obligatorio)"
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
                {justificacion.length}/300 caracteres - Campo obligatorio
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

      {/* Modal de éxito */}
      <ModalConfirmacion
        isOpen={modalExito}
        onClose={() => {}}
        title="Modificación exitosa"
        type="success"
      >
        La calificación del estudiante ha sido actualizada correctamente.
      </ModalConfirmacion>

      {/* Modal de error */}
      <ModalConfirmacion
        isOpen={modalError}
        onClose={() => setModalError(false)}
        title="Error al modificar"
        type="error"
      >
        {mensajeError}
      </ModalConfirmacion>
    </>
  );
};