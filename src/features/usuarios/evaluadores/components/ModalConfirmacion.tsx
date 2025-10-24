//src/features/evaluadores/components/ModalConfirmacion.tsx
import { type ReactNode, useEffect } from 'react';
import { AlertTriangle, Info, X, CheckCircle } from 'lucide-react';

type ModalType = 'confirmation' | 'error' | 'info' | 'success';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  children: ReactNode;
  type: ModalType;
  loading?: boolean;
  autoClose?: boolean;
  autoCloseDelay?: number;
};

const iconMap: Record<ModalType, ReactNode> = {
  confirmation: <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto" />,
  error: <X className="h-16 w-16 text-red-500 mx-auto" />,
  info: <Info className="h-16 w-16 text-blue-500 mx-auto" />,
  success: <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />,
};

const buttonStyles: Record<ModalType, string> = {
  confirmation: 'bg-principal-500 hover:bg-principal-600',
  error: 'bg-red-500 hover:bg-red-600',
  info: 'bg-blue-500 hover:bg-blue-600',
  success: 'bg-green-500 hover:bg-green-600',
};

export function ModalConfirmacion({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  type,
  loading = false,
  autoClose = false,
  autoCloseDelay = 3000,
}: Props) {
  // Auto-cierre para modales de éxito
  useEffect(() => {
    if (isOpen && autoClose && type === 'success') {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, type, autoCloseDelay, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={type === 'error' || type === 'info' ? onClose : undefined}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 text-center animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {iconMap[type]}
        <h2 className="text-2xl font-bold text-gray-800 mt-4">{title}</h2>
        <div className="text-gray-600 mt-2 text-md whitespace-pre-line">{children}</div>

        {/* Botones solo para modales que NO son auto-close success */}
        {!(autoClose && type === 'success') && (
          <div className="mt-8 flex justify-center gap-4">
            {type === 'confirmation' && (
              <button
                onClick={onClose}
                disabled={loading}
                className="font-semibold py-2.5 px-6 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
            )}
            <button
              onClick={type === 'confirmation' ? onConfirm : onClose}
              disabled={loading}
              className={`font-semibold py-2.5 px-6 rounded-lg text-white transition-colors w-32 ${buttonStyles[type]}`}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
              ) : type === 'confirmation' ? (
                'Confirmar'
              ) : (
                'Entendido'
              )}
            </button>
          </div>
        )}

        {/* Indicador de auto-cierre para modales de éxito 
                {autoClose && type === 'success' && (
                    <div className="mt-6">
                        <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden">
                            <div 
                                className="h-full bg-green-500 animate-shrink"
                                style={{ animationDuration: `${autoCloseDelay}ms` }}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Cerrando automáticamente...</p>
                    </div>
                )}*/}
      </div>

      <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                @keyframes shrink {
                    from { width: 100%; }
                    to { width: 0%; }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
                .animate-scaleIn {
                    animation: scaleIn 0.3s ease-out;
                }
                .animate-shrink {
                    animation: shrink linear;
                }
            `}</style>
    </div>
  );
}
