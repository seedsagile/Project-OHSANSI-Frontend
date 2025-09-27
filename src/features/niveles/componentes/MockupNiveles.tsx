import { useState, useEffect } from "react";
import { IconoPlus } from "../../areas/componentes/IconoPlus";
import { ModalCrearNivel } from "./ModalCrearNivel";
import type { Area } from "../../areas/tipos";
import type { Nivel } from "../interface/interfaceNivel";
import { getNiveles, createNivel } from "../service/nivelService";

interface MockupNivelesProps {
  areaSeleccionada: Area | null;
}

export const MockupNiveles = ({ areaSeleccionada }: MockupNivelesProps) => {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [niveles, setNiveles] = useState<Nivel[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargar niveles cuando cambie el área seleccionada
  useEffect(() => {
    if (areaSeleccionada) {
      cargarNiveles(areaSeleccionada.id_area);
    } else {
      setNiveles([]);
    }
  }, [areaSeleccionada]);

  const cargarNiveles = async (idArea: number) => {
    try {
      setLoading(true);
      const todosNiveles = await getNiveles();
      // Filtramos solo los niveles de esta área
      setNiveles(todosNiveles.filter((n) => n.orden === idArea));
    } catch (error) {
      console.error("Error al cargar niveles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCrearNivel = async (data: {
    nombre: string;
    descripcion?: string;
    orden: number;
  }) => {
    try {
      setLoading(true);
      const nuevo = await createNivel(data);
      // Actualizamos la lista de niveles
      setNiveles((prev) => [...prev, nuevo]);
      setModalAbierto(false);
    } catch (error) {
      console.error("Error al crear nivel:", error);
      alert("No se pudo crear el nivel.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <div className="bg-gray-300 text-center py-2 px-4 rounded mb-4">
            <span className="font-semibold">
              Área:{" "}
              {areaSeleccionada
                ? areaSeleccionada.nombre
                : "Ninguna seleccionada"}
            </span>
          </div>

          <h2 className="text-xl font-semibold text-gray-700 text-center mb-4">
            Lista de Niveles
          </h2>

          <div className="mb-4">
            <table className="w-full border border-blue-500 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-blue-500 text-white">
                  <th className="text-left py-3 px-4 font-semibold">NRO</th>
                  <th className="text-left py-3 px-4 font-semibold">NIVEL</th>
                </tr>
              </thead>
              <tbody>
                {niveles.length === 0 ? (
                  <tr className="bg-gray-200">
                    <td className="py-4 px-4 text-center" colSpan={2}>
                      {loading ? "Cargando..." : "No hay niveles aún"}
                    </td>
                  </tr>
                ) : (
                  niveles.map((nivel, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                    >
                      <td className="py-4 px-4">{nivel.orden}</td>
                      <td className="py-4 px-4">{nivel.nombre}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setModalAbierto(true)}
              className="inline-flex items-end gap-2 px-6 py-2 font-semibold rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              disabled={!areaSeleccionada}
            >
              <IconoPlus />
              Nuevo Nivel
            </button>
          </div>
        </div>
      </div>

      <ModalCrearNivel
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        idArea={areaSeleccionada ? areaSeleccionada.id_area : null}
        loading={loading}
        onGuardar={handleCrearNivel}
      />
    </>
  );
};
