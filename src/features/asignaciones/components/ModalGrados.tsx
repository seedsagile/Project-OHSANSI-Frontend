import React from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import type { Grado } from '../types';

type ModalGradosProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (gradosSeleccionados: Set<number>) => void;
  niveles: Grado[];
  gradosSeleccionados: Set<number>;
  nombreNivel: string;
  isLoading?: boolean;
  procesoIniciado?: boolean;
};

export function ModalGrados({
  isOpen,
  onClose,
  onSave,
  niveles,
  gradosSeleccionados,
  nombreNivel,
  isLoading = false,
  procesoIniciado = false,
}: ModalGradosProps) {
  const [gradosTemp, setGradosTemp] = React.useState<Set<number>>(new Set());

  React.useEffect(() => {
    if (isOpen) {
      setGradosTemp(new Set(gradosSeleccionados));
    }
  }, [isOpen, gradosSeleccionados]);

  const handleToggle = (id_grado_escolaridad: number) => {
    // Si el proceso ha iniciado, no permitir cambios
    if (procesoIniciado) {
      return;
    }

    setGradosTemp((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id_grado_escolaridad)) {
        newSet.delete(id_grado_escolaridad);
      } else {
        newSet.add(id_grado_escolaridad);
      }
      return newSet;
    });
  };

  const handleSave = () => {
    // Si el proceso ha iniciado, solo cerrar el modal
    if (procesoIniciado) {
      onClose();
      return;
    }

    // Permite guardar incluso sin grados seleccionados
    onSave(gradosTemp);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-blanco rounded-xl shadow-sombra-3 w-full max-w-2xl mx-4 p-6">
        <header className="mb-6">
          <h2 className="text-2xl font-bold text-negro">
            Seleccionar Grados de Escolaridad
          </h2>
          <p className="text-sm text-neutro-600 mt-2">
            Nivel: <span className="font-semibold">{nombreNivel}</span>
          </p>

          {/* Mensaje de advertencia si el proceso ha iniciado */}
          {procesoIniciado && (
            <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-md">
              <div className="flex items-start">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-xs text-yellow-800">
                  Solo puede visualizar los grados previamente asignados. No se permiten cambios.
                </p>
              </div>
            </div>
          )}
        </header>

        <div className="rounded-lg border border-neutro-200 overflow-hidden mb-6">
          <div className="overflow-y-auto max-h-96">
            <table className="w-full text-left">
              <thead className="bg-principal-500 sticky top-0 z-10">
                <tr>
                  <th
                    scope="col"
                    className="p-4 text-sm font-bold text-blanco tracking-wider uppercase text-center"
                  >
                    NRO
                  </th>
                  <th
                    scope="col"
                    className="p-4 text-sm font-bold text-blanco tracking-wider uppercase text-center"
                  >
                    GRADO
                  </th>
                  <th
                    scope="col"
                    className="p-4 text-sm font-bold text-blanco tracking-wider uppercase text-center"
                  >
                    ASIGNADO
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutro-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={3} className="text-center p-10 text-neutro-400">
                      Cargando grados...
                    </td>
                  </tr>
                ) : niveles.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center p-10 text-neutro-500">
                      No hay grados disponibles para este nivel.
                    </td>
                  </tr>
                ) : (
                  niveles.map((grado: Grado, index: number) => {
                    const estaSeleccionado = gradosTemp.has(grado.id_grado_escolaridad);

                    return (
                      <tr
                        key={grado.id_grado_escolaridad}
                        className="even:bg-neutro-100 hover:bg-principal-50 transition-colors"
                      >
                        <td className="p-4 text-neutro-700 text-center">{index + 1}</td>
                        <td className="p-4 text-neutro-700 text-left">{grado.nombre}</td>
                        <td className="p-4 text-neutro-700 text-center">
                          <input
                            type="checkbox"
                            aria-label={`Seleccionar el grado: ${grado.nombre}`}
                            className={`h-5 w-5 rounded border-gray-400 text-principal-600 focus:ring-principal-500 ${
                              procesoIniciado
                                ? 'cursor-not-allowed opacity-60'
                                : 'cursor-pointer'
                            }`}
                            checked={estaSeleccionado}
                            onChange={() => handleToggle(grado.id_grado_escolaridad)}
                            disabled={procesoIniciado}
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <footer className="flex justify-end items-center gap-4">
          <button
            onClick={onClose}
            className="flex items-center justify-center gap-2 font-semibold py-2.5 px-6 rounded-lg bg-neutro-200 text-neutro-700 hover:bg-neutro-300 transition-colors"
          >
            <X className="h-5 w-5" />
            <span>{procesoIniciado ? 'Cerrar' : 'Cancelar'}</span>
          </button>

          {!procesoIniciado && (
            <button
              onClick={handleSave}
              className="flex items-center justify-center gap-2 font-semibold py-2.5 px-6 rounded-lg bg-principal-500 text-blanco hover:bg-principal-600 transition-colors disabled:bg-principal-300 disabled:cursor-not-allowed"
            >
              <Save className="h-5 w-5" />
              <span>Guardar</span>
            </button>
          )}

          {procesoIniciado && (
            <button
              disabled
              className="flex items-center justify-center gap-2 font-semibold py-2.5 px-6 rounded-lg bg-principal-300 text-blanco cursor-not-allowed"
            >
              <Save className="h-5 w-5" />
              <span>Guardar</span>
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}