//src/features/components/ModalConfirmacion.tsx
import { type ReactNode } from 'react';
import { AlertTriangle, Info, X } from 'lucide-react';

type ModalType = 'confirmation' | 'error' | 'info';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm?: () => void;
    title: string;
    children: ReactNode;
    type: ModalType;
    loading?: boolean;
};

const iconMap: Record<ModalType, ReactNode> = {
    confirmation: <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto" />,
    error: <X className="h-16 w-16 text-red-500 mx-auto" />,
    info: <Info className="h-16 w-16 text-blue-500 mx-auto" />,
};

const buttonStyles: Record<ModalType, string> = {
    confirmation: 'bg-principal-500 hover:bg-principal-600',
    error: 'bg-acento-500 hover:bg-acento-600',
    info: 'bg-principal-500 hover:bg-principal-600',
};

export function ModalConfirmacion({ isOpen, onClose, onConfirm, title, children, type, loading = false }: Props) {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-negro/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div 
                className="bg-blanco rounded-xl shadow-2xl w-full max-w-md p-8 text-center"
                onClick={(e) => e.stopPropagation()}
            >
                {iconMap[type]}
                <h2 className="text-2xl font-bold text-neutro-800 mt-4">{title}</h2>
                <div className="text-neutro-600 mt-2 text-md">{children}</div>

                <div className="mt-8 flex justify-center gap-4">
                    {type === 'confirmation' && (
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="font-semibold py-2.5 px-6 rounded-lg bg-neutro-200 text-neutro-700 hover:bg-neutro-300 transition-colors"
                        >
                            Cancelar
                        </button>
                    )}
                    <button
                        onClick={type === 'confirmation' ? onConfirm : onClose}
                        disabled={loading}
                        className={`font-semibold py-2.5 px-6 rounded-lg text-blanco transition-colors w-32 ${buttonStyles[type]}`}
                    >
                        {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div> : (type === 'confirmation' ? 'Confirmar' : 'Entendido')}
                    </button>
                </div>
            </div>
        </div>
    );
}