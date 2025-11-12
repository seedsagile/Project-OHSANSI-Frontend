interface SuccessModalProps {
  isOpen: boolean;
  areaName: string;
}

export const SuccessModal = ({ isOpen, areaName }: SuccessModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 shadow-xl max-w-md mx-4 animate-fade-in">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Registro Exitoso
          </h3>
          <p className="text-sm text-gray-600">
            Se parametrizó el medallero para los niveles del área <strong>{areaName}</strong>
          </p>
        </div>
      </div>
    </div>
  );
};