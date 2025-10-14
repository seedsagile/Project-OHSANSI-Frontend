import React, { useState } from 'react';
import { IconoUpload } from './IconoUpload';
import type { CrearEvaluadorData } from '../tipos';

type FormularioEvaluadorProps = {
  onGuardar: (evaluador: CrearEvaluadorData) => void;
  onCancelar: () => void;
};

export const FormularioEvaluador = ({ onGuardar, onCancelar }: FormularioEvaluadorProps) => {
  const [formData, setFormData] = useState({
    name: '',
    emailStudent: '',
    ci: '',
    codigoAcceso: '',
  });
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImagenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagenPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGuardar = () => {
    // Validación básica
    if (!formData.name || !formData.emailStudent || !formData.ci || !formData.codigoAcceso) {
      alert('Por favor complete todos los campos');
      return;
    }

    const evaluadorData: CrearEvaluadorData = {
      ...formData,
      imagen: imagenPreview || undefined,
    };

    onGuardar(evaluadorData);
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Columna izquierda - Formulario */}
        <div className="space-y-6">
          <div>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Name"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-none text-gray-700 placeholder-gray-500 focus:outline-none focus:border-gray-400"
            />
          </div>

          <div>
            <input
              type="email"
              name="emailStudent"
              value={formData.emailStudent}
              onChange={handleChange}
              placeholder="Email Student"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-none text-gray-700 placeholder-gray-500 focus:outline-none focus:border-gray-400"
            />
          </div>

          <div>
            <input
              type="text"
              name="ci"
              value={formData.ci}
              onChange={handleChange}
              placeholder="CI"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-none text-gray-700 placeholder-gray-500 focus:outline-none focus:border-gray-400"
            />
          </div>

          <div>
            <input
              type="text"
              name="codigoAcceso"
              value={formData.codigoAcceso}
              onChange={handleChange}
              placeholder="codigo de acceso"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-none text-gray-700 placeholder-gray-500 focus:outline-none focus:border-gray-400"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-8">
            <button
              onClick={handleGuardar}
              className="flex items-center gap-2 font-semibold py-2.5 px-6 rounded-lg bg-principal-500 text-blanco hover:bg-principal-600 transition-colors"
            >
              Guardar
            </button>
            <button
              onClick={onCancelar}
              className="flex items-center gap-2 font-semibold py-2.5 px-6 rounded-lg bg-neutro-700 text-blanco hover:bg-gray-800 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>

        {/* Columna derecha - Área de imagen */}
        <div className="lg:pl-8">
          <div className="border-2 border-gray-300 h-80 flex items-center justify-center bg-gray-50 relative">
            {imagenPreview ? (
              <div className="relative w-full h-full">
                <img src={imagenPreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  onClick={() => setImagenPreview(null)}
                  className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="text-center">
                <IconoUpload />
                <p className="text-gray-400 mt-2 text-sm">Click para subir imagen</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImagenChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
