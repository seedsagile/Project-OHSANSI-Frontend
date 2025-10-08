import React, { useState } from "react";
import { crearParametroAPI } from "../service/service";
import type { ParametroClasificacion } from "../interface/interface";

export const FormularioParametro = () => {
  const [formData, setFormData] = useState<ParametroClasificacion>({
    nota_minima_clasificacion: 0,
    cantidad_maxima_de_clasificados: 0,
  });

  const [mensaje, setMensaje] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id === "nota-minima"
        ? "nota_minima_clasificacion"
        : "cantidad_maxima_de_clasificados"]: Number(value),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await crearParametroAPI(formData);

      // Mostrar mensaje temporal
      setMensaje("✅ Datos guardados correctamente");

      // Limpiar campos
      setFormData({
        nota_minima_clasificacion: 0,
        cantidad_maxima_de_clasificados: 0,
      });

      // Ocultar después de 3s
      setTimeout(() => {
        setMensaje(null);
      }, 3000);
    } catch (error) {
      console.error("Error al guardar:", error);
      setMensaje("❌ Error al guardar los datos");
      setTimeout(() => {
        setMensaje(null);
      }, 3000);
    }
  };

  return (
    <div className="bg-neutro-100 min-h-screen flex items-center justify-center p-6 font-display relative">
      <main className="bg-blanco w-full max-w-3xl rounded-2xl shadow-sombra-3 p-10 border border-neutro-200">
        <header className="flex justify-center items-center mb-12">
          <h1 className="text-4xl font-extrabold text-negro tracking-tight text-center">
            Ingrese parámetro de clasificación
          </h1>
        </header>

        {/* Mensaje flotante */}
        {mensaje && (
          <div className="absolute top-6 right-6 bg-principal-500 text-blanco px-4 py-2 rounded-lg shadow-lg animate-fade-in">
            {mensaje}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="nota-minima"
              className="text-lg font-semibold text-negro"
            >
              Nota mínima
            </label>
            <input
              id="nota-minima"
              value={formData.nota_minima_clasificacion || ""}
              onChange={handleChange}
              placeholder="51"
              className="w-full border border-neutro-300 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-principal-400 transition-all"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="max-competidores"
              className="text-lg font-semibold text-negro"
            >
              Cantidad máxima de competidores
            </label>
            <input
              id="max-competidores"
              value={formData.cantidad_maxima_de_clasificados || ""}
              onChange={handleChange}
              placeholder="100"
              className="w-full border border-neutro-300 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-principal-400 transition-all"
            />
          </div>

          <footer className="flex justify-end items-center gap-6 mt-14">
            <button
              type="button"
              className="flex items-center gap-2 font-medium py-2.5 px-6 rounded-lg bg-neutro-200 text-neutro-700 hover:bg-neutro-300 hover:shadow transition-all"
              onClick={() =>
                setFormData({
                  nota_minima_clasificacion: 0,
                  cantidad_maxima_de_clasificados: 0,
                })
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              <span>Cancelar</span>
            </button>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 w-48 font-semibold py-2.5 px-6 rounded-lg bg-principal-500 text-blanco hover:bg-principal-600 hover:shadow transition-all disabled:bg-principal-300 disabled:cursor-not-allowed"
            >
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24"
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
                <span>Guardar</span>
              </>
            </button>
          </footer>
        </form>
      </main>
    </div>
  );
};
