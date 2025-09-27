// src/evaluadores/components/ModalFeedback.tsx

import type { ReactNode } from 'react';

const SuccessIcon = () => (
  <svg className="h-16 w-16 text-exito-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ErrorIcon = () => (
  <svg className="h-16 w-16 text-acento-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

type ModalType = 'success' | 'error';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  type: ModalType;
  title: string;
  children: ReactNode;
};

export function ModalFeedback({ isOpen, onClose, type, title, children }: Props) {
  if (!isOpen) return null;

  const icons: Record<ModalType, ReactNode> = {
    success: <SuccessIcon />,
    error: <ErrorIcon />,
  };

  const buttonStyles: Record<ModalType, string> = {
    success: 'bg-principal-500 hover:bg-principal-600',
    error: 'bg-acento-500 hover:bg-acento-600',
  };

  return (
    // Fondo oscuro semi-transparente
    <div className="fixed inset-0 bg-negro bg-opacity-60 flex items-center justify-center z-50 transition-opacity">
      {/* Contenedor del Modal */}
      <div className="bg-blanco rounded-xl shadow-sombra-3 w-full max-w-md p-8 text-center animate-fade-in-up">
        {icons[type]}
        <h2 className="text-3xl font-bold text-negro mt-4">{title}</h2>
        <div className="text-neutro-500 mt-2 text-lg">
          {children}
        </div>
        <button
          onClick={onClose}
          className={`mt-8 w-full py-3 px-6 rounded-lg text-blanco font-semibold transition-colors ${buttonStyles[type]}`}
        >
          Entendido
        </button>
      </div>
    </div>
  );
}