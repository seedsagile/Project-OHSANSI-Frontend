import { type ReactNode } from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

type ModalType = 'success' | 'error' | 'info' | 'warning';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    type: ModalType;
};

const iconMap: Record<ModalType, ReactNode> = {
    success: <CheckCircle className="h-16 w-16 text-exito-500 mx-auto" />,
    error: <XCircle className="h-16 w-16 text-acento-500 mx-auto" />,
    info: <Info className="h-16 w-16 text-principal-500 mx-auto" />,
    warning: <AlertTriangle className="h-16 w-16 text-advertencia-500 mx-auto" />,
};

const buttonStyles: Record<ModalType, string> = {
    success: 'bg-exito-500 hover:bg-exito-600',
    error: 'bg-acento-500 hover:bg-acento-600',
    info: 'bg-principal-500 hover:bg-principal-600',
    warning: 'bg-advertencia-500 hover:bg-advertencia-600',
};

export function ModalInformativo({ isOpen, onClose, title, children, type }: Props) {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-negro/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div 
                className="bg-blanco rounded-xl shadow-2xl w-full max-w-md p-8 text-center flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {iconMap[type]}
                <h2 className="text-2xl font-bold text-neutro-800 mt-4">{title}</h2>
                
                {/* --- MEJORA CON SCROLL HORIZONTAL Y VERTICAL --- */}
                <div className="text-neutro-600 mt-2 text-sm text-left max-h-60 overflow-auto border border-neutro-200 bg-neutro-50 p-2 rounded-md">
                    <pre className="whitespace-pre-wrap break-words font-sans">
                        {children}
                    </pre>
                </div>

                <div className="mt-8 flex justify-center">
                    <button
                        onClick={onClose}
                        className={`font-semibold py-2.5 px-6 rounded-lg text-blanco transition-colors w-40 ${buttonStyles[type]}`}
                    >
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    );
}