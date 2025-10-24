// src/components/ui/Modal.tsx
import React, { type ReactNode, useEffect } from 'react'; // Import React
import { AlertTriangle, CheckCircle, Info, XCircle, X, Check, LoaderCircle } from 'lucide-react';

export type ModalType = 'success' | 'error' | 'warning' | 'info' | 'confirmation';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  type: ModalType;
  onConfirm?: () => void;
  loading?: boolean;
  confirmText?: string;
  cancelText?: string;
}

const typeConfig = {
  success: {
    icon: CheckCircle,
    className: 'text-exito-500',
    buttonClass: 'bg-exito-500 hover:bg-exito-600',
  },
  error: {
    icon: XCircle,
    className: 'text-acento-500',
    buttonClass: 'bg-acento-500 hover:bg-acento-600',
  },
  warning: {
    icon: AlertTriangle,
    className: 'text-advertencia-500',
    buttonClass: 'bg-advertencia-500 hover:bg-advertencia-600',
  },
  info: {
    icon: Info,
    className: 'text-principal-500',
    buttonClass: 'bg-principal-500 hover:bg-principal-600',
  },
  confirmation: {
    icon: AlertTriangle,
    className: 'text-advertencia-500', // Mantenido amarillo para confirmación
    buttonClass: 'bg-principal-500 hover:bg-principal-600', // Botón principal azul
  },
};

export function Modal1({
  isOpen,
  onClose,
  title,
  children,
  type,
  onConfirm,
  loading = false,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    // Limpiar listener al desmontar o cerrar
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // No renderizar nada si no está abierto
  if (!isOpen) {
    return null;
  }

  const { icon: IconComponent, className, buttonClass } = typeConfig[type];
  const needsActionButtons = type === 'confirmation';
  // NUEVO: Determinar si se necesita el botón "Entendido"
  const needsUnderstoodButton = !needsActionButtons && type !== 'success'; // No mostrar en éxito o confirmación

  return (
    <div
      // NUEVO: Añadida clase animate-fadeIn para el fondo
      className="fixed inset-0 bg-negro/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={onClose} // Cerrar al hacer clic en el fondo
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* NUEVO: Añadida clase animate-scaleIn para el contenido */}
      <div
        className="bg-blanco rounded-xl shadow-2xl w-full max-w-md p-6 sm:p-8 text-center animate-scaleIn" // Ajustado padding
        onClick={(e) => e.stopPropagation()} // Evitar que el clic dentro cierre el modal
      >
        <IconComponent className={`h-16 w-16 mx-auto ${className}`} aria-hidden="true" />

        <h2 id="modal-title" className="text-xl sm:text-2xl font-bold text-neutro-800 mt-4">
          {title}
        </h2>

        {/* Asegurar que children tenga estilo adecuado */}
        <div className="text-neutro-600 mt-2 text-sm sm:text-base leading-relaxed">{children}</div>

        {/* Botones de Acción (Confirmación) */}
        {needsActionButtons && (
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <button
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto order-2 sm:order-1 flex items-center justify-center gap-2 font-semibold py-2.5 px-6 rounded-lg bg-neutro-200 text-neutro-700 hover:bg-neutro-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="h-5 w-5" />
              <span>{cancelText}</span>
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`w-full sm:w-auto order-1 sm:order-2 flex items-center justify-center gap-2 font-semibold py-2.5 px-6 rounded-lg text-blanco transition-colors min-w-[140px] ${buttonClass} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <LoaderCircle className="animate-spin h-5 w-5" />
              ) : (
                <Check className="h-5 w-5" />
              )}
              <span>{loading ? 'Procesando...' : confirmText}</span>
            </button>
          </div>
        )}

        {/* Botón "Entendido" (Info, Error, Warning) */}
        {needsUnderstoodButton && (
           <div className="mt-6 sm:mt-8 flex justify-center">
             <button
              onClick={onClose}
              // Usar buttonClass correspondiente al tipo (ej. rojo para error)
              className={`font-semibold py-2.5 px-8 rounded-lg text-blanco transition-colors ${buttonClass}`}
             >
               Entendido
             </button>
           </div>
        )}
        {/* El tipo 'success' no muestra botones por defecto (se cierra solo o el padre decide) */}

      </div>
       {/* NUEVO: Estilos para las animaciones (si no están ya globales en index.css) */}
       <style>{`
          @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
          }
          @keyframes scaleIn {
              from { transform: scale(0.9); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
          }
          .animate-fadeIn {
              animation: fadeIn 0.2s ease-out forwards;
          }
          .animate-scaleIn {
              animation: scaleIn 0.3s ease-out forwards;
          }
        `}</style>
    </div>
  );
}