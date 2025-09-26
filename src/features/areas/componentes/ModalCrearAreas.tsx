import { useState } from 'react';
import { X, Save } from 'lucide-react';

type ModalCrearAreaProps = {
    isOpen: boolean;
    onClose: () => void;
    onGuardar: (data:{nombre: string, descripcion?: string}) => void;
    loading?: boolean;
};

export const ModalCrearArea = ({ isOpen, onClose, onGuardar, loading=false }: ModalCrearAreaProps) => {
    const [nombre, setNombre] = useState('');

    if (!isOpen) return null;

    const handleGuardar = () => {
        if (nombre.trim()) {
            onGuardar({nombre:nombre.trim()});
            setNombre('');
            //onClose();
        }
    };

    const handleCancelar = () => {
        setNombre('');
        onClose();
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 pointer-events-auto">
                <h2 className="text-xl font-semibold text-center mb-6">Crear Área</h2>
                
                
                <div className="mb-6 flex items-center gap-4">
                    <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                        Nombre del Área:
                    </label>
                    <input
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        placeholder="Ingrese el nombre del área"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        autoFocus
                        disabled={loading}
                    />
                </div>

                <div className="flex gap-4 justify-center">
                    <button
                        onClick={handleCancelar}
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-2 font-semibold py-2.5 px-6 rounded-lg bg-neutro-700 text-blanco hover:bg-neutro-800 transition-colors disabled:opacity-50"
                    >
                        <X size={18} className='flex-shink-0'/>
                        Cancelar
                    </button>
                    <button
                        onClick={handleGuardar}
                        disabled={loading}
                        className="inline-flex intems-center justify-center gap-2 font-semibold py-2.5 px-6 rounded-lg bg-principal-500 text-blanco hover:bg-principal-600 transition-colors disabled:opacity-50"
                    >
                        <Save size={18} />
                        {loading ? "Guardando..." : 'Guardar'}
                    </button>
                </div>
            </div>
        </div>
    );
};