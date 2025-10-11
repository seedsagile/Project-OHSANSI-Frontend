import React, { type PropsWithChildren } from 'react';
import { IconAlert, IconCheck, IconClose, IconInfo, IconWarning } from '../icons';

type ModalType = 'success' | 'error' | 'warning' | 'info' | 'confirmation';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    type?: ModalType;
    footer?: React.ReactNode;
}

const modalIcons: Record<ModalType, React.ReactNode> = {
    success: <IconCheck className="h-10 w-10 text-green-500" />,
    error: <IconAlert className="h-10 w-10 text-red-500" />,
    warning: <IconWarning className="h-10 w-10 text-yellow-500" />,
    info: <IconInfo className="h-10 w-10 text-blue-500" />,
    confirmation: <IconInfo className="h-10 w-10 text-gray-500" />,
};

export const Modal: React.FC<PropsWithChildren<ModalProps>> = ({
    isOpen,
    onClose,
    title,
    type,
    footer,
    children,
}) => {

    if (!isOpen) {
        return null;
    }

    return (

        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 transition-opacity duration-300"
            onClick={onClose}
        >
            {/* Contenedor principal del modal */}
            <div
                className="relative w-full max-w-md transform rounded-xl bg-white p-6 shadow-2xl transition-all duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Botón para cerrar en la esquina superior derecha */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    aria-label="Cerrar modal"
                >
                    <IconClose className="h-6 w-6" />
                </button>

                <div className="flex flex-col items-center text-center">
                    {/* Icono: se muestra si se especifica un 'type' */}
                    {type && modalIcons[type] && (
                        <div className="mb-4">
                            {modalIcons[type]}
                        </div>
                    )}

                    {/* Título del modal */}
                    <h3 className="text-xl font-bold text-gray-900" id="modal-title">
                        {title}
                    </h3>

                    {/* Contenido principal (hijos): Aquí va el mensaje o el formulario */}
                    <div className="mt-2 w-full text-base text-gray-600">
                        {children}
                    </div>
                </div>

                {/* Footer: Espacio para los botones de acción */}
                {footer && (
                    <div className="mt-6 flex justify-center gap-4">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};