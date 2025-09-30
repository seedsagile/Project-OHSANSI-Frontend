import { useState, useEffect } from "react";
import { z } from "zod";

type ModalCrearNivelProps = {
  isOpen: boolean;
  onClose: () => void;
  onGuardar: (data: {
    nombre: string;
    descripcion: null;
    orden: number;
  }) => void;
  idArea: number | null;
  loading?: boolean;
};

// 📌 Schema de validación con Zod
const nombreSchema = z
  .string()
  .min(1, "El campo Nombre del nivel es obligatorio.")
  .max(50, "El campo Nombre del nivel tiene un límite máximo de 50 caracteres.")
  .regex(
    /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/,
    "El campo Nombre del nivel solo permite letras y espacios."
  );

export const ModalCrearNivel = ({
  isOpen,
  onClose,
  onGuardar,
  idArea,
  loading = false,
}: ModalCrearNivelProps) => {
  const [nombre, setNombre] = useState("");
  const [errores, setErrores] = useState<string[]>([]);

  // ✅ Validación automática en tiempo real
  useEffect(() => {
    if (nombre === "") {
      setErrores([]);
      return;
    }

    const result = nombreSchema.safeParse(nombre);
    if (!result.success) {
      setErrores(result.error.errors.map((err) => err.message));
    } else {
      setErrores([]);
    }
  }, [nombre]);

  const handleGuardar = () => {
    const result = nombreSchema.safeParse(nombre);
    if (!result.success) {
      setErrores(result.error.errors.map((err) => err.message));
      return;
    }

    if (!idArea) {
      alert("Debes seleccionar un área antes de crear un nivel.");
      return;
    }

    onGuardar({
      nombre: nombre.trim(),
      descripcion: null, // siempre null
      orden: idArea,
    });

    setNombre("");
    setErrores([]);
  };

  const handleCancelar = () => {
    setNombre("");
    setErrores([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 pointer-events-auto">
        <h2 className="text-xl font-semibold text-center mb-6">Crear Nivel</h2>

        {/* Nombre */}
        <div className="mb-4">
          <div className="flex gap-2">
            <label className="flex items-center text-sm font-medium text-gray-700 ">
              Nombre del Nivel:
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className={`w-[250px] px-3 items-center border rounded-md focus:outline-none focus:ring-2 ${
                errores.length > 0
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              autoFocus
              disabled={loading}
            />
          </div>
          {errores.length > 0 && (
            <ul className="text-red-500 text-sm mt-1 list-disc list-inside">
              {errores.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Botones */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleCancelar}
            disabled={loading}
            className="font-semibold py-2.5 px-6 rounded-lg bg-gray-200 text-black hover:bg-blue-600 hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={loading}
            className="font-semibold py-2.5 px-6 rounded-lg bg-blue-500 text-white hover:bg-blue-700 transition-colors"
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
};
