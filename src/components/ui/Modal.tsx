import { type ReactNode, useEffect } from 'react';
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
    success: { icon: CheckCircle, className: 'text-exito-500', buttonClass: 'bg-exito-500 hover:bg-exito-600' },
    error: { icon: XCircle, className: 'text-acento-500', buttonClass: 'bg-acento-500 hover:bg-acento-600' },
    warning: { icon: AlertTriangle, className: 'text-advertencia-500', buttonClass: 'bg-advertencia-500 hover:bg-advertencia-600' },
    info: { icon: Info, className: 'text-principal-500', buttonClass: 'bg-principal-500 hover:bg-principal-600' },
    confirmation: { icon: AlertTriangle, className: 'text-advertencia-500', buttonClass: 'bg-principal-500 hover:bg-principal-600' },
};

export function Modal({
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

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    const { icon: IconComponent, className, buttonClass } = typeConfig[type];

    const needsActionButtons = type === 'confirmation';

    return (
        <div
            className="fixed inset-0 bg-negro/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div
                className="bg-blanco rounded-xl shadow-2xl w-full max-w-md p-8 text-center"
                onClick={(e) => e.stopPropagation()}
            >
                <IconComponent className={`h-16 w-16 mx-auto ${className}`} />
                
                <h2 id="modal-title" className="text-2xl font-bold text-neutro-800 mt-4">{title}</h2>
                
                <div className="text-neutro-600 mt-2 text-md">{children}</div>
                {needsActionButtons && (
                    <div className="mt-8 flex justify-center gap-4">
                        {/* Botón de Cancelar (solo para confirmación) */}
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 font-semibold py-2.5 px-6 rounded-lg bg-neutro-200 text-neutro-700 hover:bg-neutro-300 transition-colors"
                        >
                            <X className="h-5 w-5" />
                            <span>{cancelText}</span>
                        </button>
                        
                        {/* Botón Principal (solo para confirmación, el "Entendido" se quita explícitamente) */}
                        <button
                            onClick={onConfirm}
                            disabled={loading}
                            className={`flex items-center justify-center gap-2 font-semibold py-2.5 px-6 rounded-lg text-blanco transition-colors w-40 ${buttonClass}`}
                        >
                            {loading ? (
                                <LoaderCircle className="animate-spin h-5 w-5" />
                            ) : (
                                <>
                                    <Check className="h-5 w-5" />
                                    <span>{confirmText}</span>
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}