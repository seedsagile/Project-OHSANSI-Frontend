import React, { useState } from "react";
import type { Nivel } from "../interface/interface";
import { crearParametroAPI } from "../service/service";

interface FormularioProps {
  nivel: Nivel;
  idArea: number;
  onCerrar: () => void;
  onMarcarEnviado: (idNivel: number) => void; // callback para marcar nivel como enviado
}

export const Formulario: React.FC<FormularioProps> = ({
  nivel,
  idArea,
  onCerrar,
  onMarcarEnviado,
}) => {
  const [notaMin, setNotaMin] = useState<number | "">("");
  const [notaMax, setNotaMax] = useState<number | "">("");
  const [cantMax, setCantMax] = useState<number | "">("");
  const [loading, setLoading] = useState(false);

  const handleGuardar = async () => {
    if (!notaMin || !notaMax || !cantMax) return;

    const payload = {
      Nota_minima_clasificacion: Number(notaMin),
      Nota_maxima_clasificacion: Number(notaMax),
      cantidad_maxima_de_clasificados: Number(cantMax),
      id_area: idArea,
      niveles: [nivel.id],
    };

    try {
      setLoading(true);
      await crearParametroAPI(payload); // enviamos al backend
      onMarcarEnviado(nivel.id); // marcamos como enviado en la tabla
      onCerrar(); // cerramos modal
    } catch (error) {
      console.error("Error al enviar parámetro:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0  bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Configurar parámetro de calificación: {nivel.nombre}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block mb-1 font-medium text-black">
              Nota mínima
            </label>
            <input
              type="number"
              value={notaMin}
              onChange={(e) => setNotaMin(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-black">
              Nota máxima
            </label>
            <input
              type="number"
              value={notaMax}
              onChange={(e) => setNotaMax(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-black">
              Cantidad máxima de competidores
            </label>
            <input
              type="number"
              value={cantMax}
              onChange={(e) => setCantMax(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onCerrar}
            className="px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={loading}
            className={`px-6 py-2 rounded-lg ${
              loading
                ? "bg-indigo-300"
                : "bg-principal-500 hover:bg-principal-700"
            } text-white`}
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
};
