import { useEffect, type ReactNode } from 'react';

const SuccessIcon = () => (
  <svg className="h-16 w-16 text-exito-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ErrorIcon = () => (
  <svg className="h-16 w-16 text-acento-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const icons: Record<ModalType, ReactNode> = {
    success: <SuccessIcon />,
    error: <ErrorIcon />,
  };

  const buttonStyles: Record<ModalType, string> = {
    success: 'bg-principal-500 hover:bg-principal-600 focus:ring-principal-300',
    error: 'bg-acento-500 hover:bg-acento-600 focus:ring-acento-300',
  };

  return (
    <div 
      className="fixed inset-0 bg-negro/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div 
        className="bg-blanco rounded-xl shadow-2xl w-full max-w-md p-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {icons[type]}
        <h2 className="text-2xl font-bold text-neutro-800 mt-4">{title}</h2>
        <div className="text-neutro-600 mt-2 text-md">
          {children}
        </div>
        <button
          onClick={onClose}
          className={`mt-8 w-full py-3 px-6 rounded-lg text-blanco font-semibold transition-colors duration-200 focus:outline-none focus:ring-4 active:scale-[0.98] transform ${buttonStyles[type]}`}
        >
          Entendido
        </button>
      </div>
    </div>
  );
}