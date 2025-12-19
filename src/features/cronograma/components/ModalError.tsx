import { Modal1 } from '@/components/ui/Modal1';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

export const ModalError = ({ isOpen, onClose, message }: Props) => {
  return (
    <Modal1 
      isOpen={isOpen} 
      onClose={onClose} 
      title="¡Atención!"
      type="error"
      understoodText="Entendido, cerrar"
    >
      <div className="flex flex-col items-center text-center space-y-2">
        <p className="text-gray-600 font-medium">
          {message}
        </p>
      </div>
    </Modal1>
  );
};