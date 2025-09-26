//EDITAR AL GUSTA DE NIVEL
import { useState } from 'react';

type ModalCrearNivelProps = {
    isOpen: boolean;
    onClose: () => void;
    onGuardar: (data: { nombre: string, descripcion?: string, id_area: number }) => void;
    loading?: boolean;
};

export const ModalCrearNivel = ({ isOpen, onClose, onGuardar, loading = false }: ModalCrearNivelProps) => {
    const [nombre, setNombre] = useState('');

    if (!isOpen) return null;

    const handleGuardar = () => {
        if (nombre.trim()) {
            onGuardar({ nombre: nombre.trim(), id_area: 1 }); 
            setNombre('');
        }
    };

    const handleCancelar = () => {
        setNombre('');
        onClose();
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 pointer-events-auto">
                <h2 className="text-xl font-semibold text-center mb-6">Crear Nivel</h2>
                
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre del Nivel:
                    </label>
                    <input
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        placeholder="Ingrese el nombre del nivel"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        autoFocus
                        disabled={loading}
                    />
                </div>

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
                        disabled={loading || !nombre.trim()}
                        className="font-semibold py-2.5 px-6 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                    >
                        {loading ? "Guardando..." : 'Guardar'}
                    </button>
                </div>
            </div>
        </div>
    );
};