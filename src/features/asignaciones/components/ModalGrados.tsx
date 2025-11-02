import React from 'react';
import { X, Save } from 'lucide-react';
import type { Grado } from '../types';

type ModalGradosProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (gradosSeleccionados: Set<number>) => void;
  niveles: Grado[];
  gradosSeleccionados: Set<number>;
  nombreNivel: string;
  isLoading?: boolean;
};

export function ModalGrados({
  isOpen,
  onClose,
  onSave,
  niveles,
  gradosSeleccionados,
  nombreNivel,
  isLoading = false,
}: ModalGradosProps) {
  const [gradosTemp, setGradosTemp] = React.useState<Set<number>>(new Set());

  React.useEffect(() => {
    if (isOpen) {
      setGradosTemp(new Set(gradosSeleccionados));
    }
  }, [isOpen, gradosSeleccionados]);

  const handleToggle = (id_grado: number) => {
    setGradosTemp((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id_grado)) {
        newSet.delete(id_grado);
      } else {
        newSet.add(id_grado);
      }
      return newSet;
    });
  };

  const handleSave = () => {
    if (gradosTemp.size === 0) {
      alert('Debe seleccionar al menos un grado de escolaridad.');
      return;
    }
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
                    const estaSeleccionado = gradosTemp.has(grado.id_grado);

                    return (
                      <tr
                        key={grado.id_grado}
                        className="even:bg-neutro-100 hover:bg-principal-50 transition-colors"
                      >
                        <td className="p-4 text-neutro-700 text-center">{index + 1}</td>
                        <td className="p-4 text-neutro-700 text-left">{grado.nombre}</td>
                        <td className="p-4 text-neutro-700 text-center">
                          <input
                            type="checkbox"
                            aria-label={`Seleccionar el grado: ${grado.nombre}`}
                            className="h-5 w-5 rounded border-gray-400 text-principal-600 focus:ring-principal-500 cursor-pointer"
                            checked={estaSeleccionado}
                            onChange={() => handleToggle(grado.id_grado)}
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
            <span>Cancelar</span>
          </button>

          <button
            onClick={handleSave}
            className="flex items-center justify-center gap-2 font-semibold py-2.5 px-6 rounded-lg bg-principal-500 text-blanco hover:bg-principal-600 transition-colors disabled:bg-principal-300 disabled:cursor-not-allowed"
          >
            <Save className="h-5 w-5" />
            <span>Guardar</span>
          </button>
        </footer>
      </div>
    </div>
  );
}