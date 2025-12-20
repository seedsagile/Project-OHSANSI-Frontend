import { Modal1 } from './Modal1';
import { extractErrorMessage } from '@/utils/apiErrorUtils';
import { AlertCircle } from 'lucide-react';

interface ModalErrorProps {
  isOpen: boolean;
  onClose: () => void;
  error: unknown; // Aceptamos cualquier cosa (AxiosError, null, string...)
  title?: string; // Opcional: Para sobreescribir el título automático
}

export const ModalError = ({ isOpen, onClose, error, title: customTitle }: ModalErrorProps) => {
  // Usamos nuestra utilidad para sacar la información limpia
  const { title: autoTitle, details } = extractErrorMessage(error);
  
  const displayTitle = customTitle || autoTitle;

  return (
    <Modal1
      isOpen={isOpen}
      onClose={onClose}
      title={displayTitle}
      type="error"
      confirmText="Entendido"
      // Quitamos botón cancelar porque es solo informativo
      cancelText="" 
    >
      <div className="text-left w-full space-y-3">
        {/* Si hay múltiples errores (ej: validación), mostramos lista */}
        {details.length > 1 ? (
          <div className="bg-red-50 p-4 rounded-lg border border-red-100">
            <h4 className="text-sm font-bold text-red-800 mb-2 flex items-center gap-2">
              <AlertCircle size={16} />
              Se encontraron los siguientes problemas:
            </h4>
            <ul className="list-disc list-inside space-y-1">
              {details.map((msg, index) => (
                <li key={index} className="text-sm text-red-700">{msg}</li>
              ))}
            </ul>
          </div>
        ) : (
          // Si es solo un error, lo mostramos simple
          <p className="text-gray-600 text-center text-lg">{details[0]}</p>
        )}
      </div>
    </Modal1>
  );
};