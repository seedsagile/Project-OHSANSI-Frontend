//src/features/evaluadores/components/ModalAsignarNivel.tsx
import { useState, useEffect } from 'react';
import type { Area, Nivel } from '../types/IndexEvaluador';

interface ModalAsignarNivelProps {
  isOpen: boolean;
  onClose: () => void;
  area: Area;
  niveles: Nivel[];
  nivelesPreseleccionados?: number[];
  onConfirmar: (niveles: Nivel[]) => void;
  loading?: boolean;
}

export const ModalAsignarNivel = ({
  isOpen,
  onClose,
  //area,
  niveles,
  nivelesPreseleccionados = [],
  onConfirmar,
  loading = false,
}: ModalAsignarNivelProps) => {
  const [selectedNiveles, setSelectedNiveles] = useState<number[]>([]);

  useEffect(() => {
    if (isOpen && nivelesPreseleccionados.length > 0) {
      setSelectedNiveles(nivelesPreseleccionados);
    }
  }, [isOpen, nivelesPreseleccionados]);

  const handleCerrar = () => {
    setSelectedNiveles([]);
    onClose();
  };

  const handleToggleNivel = (nivelId: number) => {
    setSelectedNiveles((prev) => {
      if (prev.includes(nivelId)) {
        return prev.filter((id) => id !== nivelId);
      } else {
        return [...prev, nivelId];
      }
    });
  };

  const handleConfirmarNiveles = () => {
    const nivelesSeleccionados = niveles.filter((n) => selectedNiveles.includes(n.id_nivel));
    onConfirmar(nivelesSeleccionados);
    handleCerrar();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl border-2 border-black">
        <div className="mb-4">
          <label className="text-sm font-semibold text-black mb-2 block">Nivel</label>
          <button
            type="button"
            className="w-full bg-[#0076FF] text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
          >
            Asignar Nivel
          </button>
        </div>

        <div className="w-full border rounded-md p-2 border-neutro-400 bg-neutro-50 h-[180px] overflow-y-auto text-sm mb-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-2">
                <svg
                  className="animate-spin h-8 w-8 text-blue-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <p className="text-gray-500 text-sm">Cargando niveles...</p>
              </div>
            </div>
          ) : niveles.length > 0 ? (
            <ul className="space-y-1">
              {niveles.map((nivel, index) => (
                <li
                  key={nivel.id_nivel}
                  onClick={() => handleToggleNivel(nivel.id_nivel)}
                  className={`flex justify-between items-center rounded-md px-2 py-2 transition-colors cursor-pointer hover:bg-neutro-200 ${
                    index % 2 === 0 ? 'bg-[#E5E7EB]' : 'bg-[#F3F4F6]'
                  }`}
                >
                  <span>{nivel.nombre}</span>
                  <input
                    type="checkbox"
                    checked={selectedNiveles.includes(nivel.id_nivel)}
                    readOnly
                    className="ml-2"
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-neutro-500 italic">No hay niveles disponibles</p>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handleCerrar}
            className="flex items-center gap-2 px-6 py-2.5 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirmarNiveles}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#0076FF] text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};
