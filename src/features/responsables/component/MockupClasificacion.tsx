import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ModalClasificacion } from "./ModalClasificacion";

export const MockupClasificacion: React.FC = () => {
  const [openDropdown, setOpenDropdown] = useState(false);
  const [modalClasificacionOpen, setModalClasificacionOpen] = useState(false);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="relative w-80">
        {/* Botón principal */}
        <button
          onClick={() => setOpenDropdown(!openDropdown)}
          className="w-full flex items-center justify-between px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
        >
          Añadir estándares de clasificación
          {openDropdown ? (
            <ChevronUp size={20} className="ml-2" />
          ) : (
            <ChevronDown size={20} className="ml-2" />
          )}
        </button>

        {/* Dropdown */}
        {openDropdown && (
          <div className="absolute left-0 right-0 mt-2 bg-gray-100 rounded-lg shadow-lg overflow-hidden">
            <button
              onClick={() => setModalClasificacionOpen(true)}
              className="w-full text-left px-4 py-3 hover:bg-gray-200 transition-colors font-medium"
            >
              PARAMETRO PARA CLASIFICAR
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      <ModalClasificacion
        isOpen={modalClasificacionOpen}
        onClose={() => setModalClasificacionOpen(false)}
        tipo="nota" // o "cantidad", según quieras
      />
    </div>
  );
};
