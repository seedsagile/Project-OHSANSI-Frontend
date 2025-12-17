import { useState, useEffect } from 'react';
import { X, FileSignature, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { HoldButton } from './ui/HoldButton';

interface ModalAvalarProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
  competenciaNombre: string;
  isProcessing: boolean;
}

export const ModalAvalarCompetencia = ({
  isOpen,
  onClose,
  onConfirm,
  competenciaNombre,
  isProcessing
}: ModalAvalarProps) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError('');
      setShowPassword(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleHoldComplete = () => {
    if (!password.trim()) {
      setError('La contraseña es obligatoria para firmar el acta.');
      return;
    }
    setError('');
    onConfirm(password);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden flex flex-col border border-purple-100">
        
        {/* Header */}
        <div className="bg-purple-50 border-b border-purple-100 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg shadow-sm">
              <FileSignature size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800 leading-tight">Avalar Competencia</h2>
              <p className="text-xs text-purple-600 font-medium">Firma Digital de Actas</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            disabled={isProcessing}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-purple-100 rounded-full"
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          
          <div className="text-sm text-gray-600">
            <p>
              Está a punto de cerrar oficialmente la competencia:
            </p>
            <p className="font-bold text-gray-800 text-base mt-1 mb-3">
              "{competenciaNombre}"
            </p>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-r-md flex gap-3 items-start">
              <AlertTriangle size={18} className="text-yellow-600 shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-800 leading-snug">
                <strong>Acción Irreversible:</strong> Se generarán las actas finales, se congelarán las notas y se publicarán los resultados oficiales.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm space-y-2">
            <h4 className="font-bold text-gray-700 text-xs uppercase tracking-wide mb-2 border-b border-gray-200 pb-1">
              Resumen de Cierre
            </h4>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Estado Actual:</span> 
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-bold">Concluida</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Evaluaciones:</span> 
              <span className="font-medium text-gray-900">100% Completado</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 flex justify-between">
              Contraseña de Confirmación
              {error && <span className="text-red-500 text-xs font-normal animate-pulse">{error}</span>}
            </label>
            <div className="relative group">
              <input 
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if(error) setError('');
                }}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:outline-none transition-all pr-10 ${
                  error 
                    ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-purple-200 focus:border-purple-500'
                }`}
                placeholder="Ingrese su contraseña"
                disabled={isProcessing}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-800 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            
            <HoldButton
              type="button"
              label="Avalar y Cerrar (Mantener)"
              onHoldComplete={handleHoldComplete}
              disabled={isProcessing || !password}
              loading={isProcessing}
              className={`
                px-6 py-2.5 text-sm font-bold text-white rounded-lg shadow-md flex items-center justify-center gap-2 min-w-[200px]
                ${!password 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-purple-600 hover:bg-purple-700 hover:shadow-lg active:scale-95'
                }
              `}
            />
          </div>

        </div>
      </div>
    </div>
  );
};