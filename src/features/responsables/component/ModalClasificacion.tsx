import React, { useState } from "react";
import {
  crearFase,
  type ParametroClasificacion,
} from "../service/serviceFaces";

type ModalClasificacionProps = {
  isOpen: boolean;
  onClose: () => void;
  tipo: "nota" | "cantidad"; // nota mínima o cantidad máxima
};

export const ModalClasificacion: React.FC<ModalClasificacionProps> = ({
  isOpen,
  onClose,
  tipo,
}) => {
  const [valor, setValor] = useState("");
  const [nombre, setNombre] = useState("");
  const [orden, setOrden] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const label =
    tipo === "nota" ? "Nota mínima" : "Cantidad máxima a clasificar";

  const handleGuardar = async () => {
    // Validar campos básicos
    if (!valor || !nombre || !orden) {
      alert("Por favor completa todos los campos obligatorios.");
      return;
    }

    const nuevaFase: ParametroClasificacion = {
      valor: Number(valor),
      nombre,
      orden: Number(orden),
      descripcion: descripcion || undefined,
    };

    try {
      setLoading(true);
      const creado = await crearFase(nuevaFase);

      // Mostrar alert de confirmación
      alert(
        `Fase enviada al backend correctamente:\n${JSON.stringify(
          creado,
          null,
          2
        )}`
      );

      // Limpiar campos después de guardar
      setValor("");
      setNombre("");
      setOrden("");
      setDescripcion("");

      onClose();
    } catch (error) {
      console.error("Error al crear la fase:", error);
      alert("Ocurrió un error al guardar la fase.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <h2 className="text-xl font-semibold text-center mb-6">
          Añadir {label}
        </h2>

        <div className="space-y-4">
          <div>
            <input
              type="number"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder={label}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-500"
            />
          </div>

          <div>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-500"
            />
          </div>

          <div>
            <input
              type="number"
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
              placeholder="Orden"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-500"
            />
          </div>

          <div>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-500"
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-700"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={loading}
            className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
};
