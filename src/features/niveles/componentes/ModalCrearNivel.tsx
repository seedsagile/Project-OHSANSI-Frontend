import { useState } from "react";

type ModalCrearNivelProps = {
  isOpen: boolean;
  onClose: () => void;
  onGuardar: (data: {
    nombre: string;
    descripcion?: string;
    orden: number;
  }) => void;
  idArea: number | null;
  loading?: boolean;
};

export const ModalCrearNivel = ({
  isOpen,
  onClose,
  onGuardar,
  idArea,
  loading = false,
}: ModalCrearNivelProps) => {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [errores, setErrores] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const validarNombre = (value: string) => {
    const msgs: string[] = [];
    if (!value.trim()) msgs.push("El campo Nombre del nivel es obligatorio.");
    if (/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/.test(value))
      msgs.push(
        "El campo Nombre del nivel no permite caracteres numéricos o especiales."
      );
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*$/.test(value))
      msgs.push("El campo Nombre del nivel solo permite letras y espacios.");
    if (value.length > 50)
      msgs.push(
        "El campo Nombre del nivel tiene un límite máximo de 50 caracteres."
      );
    return msgs;
  };

  // Validación en tiempo real
  const handleNombreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNombre(value);
    if (!submitted) {
      // Solo mostrar errores de formato en tiempo real, no obligatorio
      const msgs = validarNombre(value).filter(
        (msg) => msg !== "El campo Nombre del nivel es obligatorio."
      );
      setErrores(msgs);
    }
  };

  const handleGuardar = () => {
    setSubmitted(true);
    const msgs = validarNombre(nombre);
    if (msgs.length > 0) {
      setErrores(msgs);
      return;
    }

    if (!idArea) {
      alert("Debes seleccionar un área antes de crear un nivel.");
      return;
    }

    onGuardar({
      nombre: nombre.trim(),
      descripcion: descripcion.trim() || undefined,
      orden: idArea,
    });

    // limpiar
    setNombre("");
    setDescripcion("");
    setErrores([]);
    setSubmitted(false);
  };

  const handleCancelar = () => {
    setNombre("");
    setDescripcion("");
    setErrores([]);
    setSubmitted(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 pointer-events-auto">
        <h2 className="text-xl font-semibold text-center mb-6">Crear Nivel</h2>

        {/* Nombre */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre del Nivel:
          </label>
          <input
            type="text"
            value={nombre}
            onChange={handleNombreChange}
            placeholder="Ingrese el nombre del nivel"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errores.length > 0
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
            autoFocus
            disabled={loading}
          />
          {errores.length > 0 && (
            <ul className="text-red-500 text-sm mt-1 list-disc list-inside">
              {errores.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Descripción */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción:
          </label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Ingrese una descripción (opcional)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            disabled={loading}
          />
        </div>

        {/* Botones */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleCancelar}
            disabled={loading}
            className="font-semibold py-2.5 px-6 rounded-lg bg-gray-700 text-white hover:bg-gray-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={loading}
            className="font-semibold py-2.5 px-6 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
};
