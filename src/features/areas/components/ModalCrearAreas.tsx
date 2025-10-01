import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Save, AlertCircle } from 'lucide-react';
import { crearAreaEsquema, type CrearAreaFormData } from '../utils/esquemas';
//import { restringirCaracteres } from '../../responsables/utils/formUtils';

type ModalCrearAreaProps = {
    isOpen: boolean;
    onClose: () => void;
    onGuardar: (data: CrearAreaFormData) => void;
    loading?: boolean;
};

export const ModalCrearArea = ({ 
    isOpen, 
    onClose, 
    onGuardar, 
    loading = false,
}: ModalCrearAreaProps) => {
    const { register, handleSubmit, formState: { errors }, reset, clearErrors } = useForm<CrearAreaFormData>({
        resolver: zodResolver(crearAreaEsquema),
        mode: 'onSubmit',
    });

    useEffect(() => {
        if (isOpen) {
            reset({ nombre: '' });
            clearErrors();
        }
    }, [isOpen, reset, clearErrors]);

    const handleCancelar = () => {
        reset({ nombre: '' });
        clearErrors();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-negro/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div 
                className="bg-white rounded-lg shadow-lg border-2 border-black w-full max-w-md p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-xl font-semibold text-center mb-6">Crear Área</h2>
                
                <form onSubmit={handleSubmit(onGuardar)}>
                    <div className="mb-4">
                        <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                            Nombre del Área: <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="nombre"
                            type="text"
                            placeholder="Ingrese el nombre del área"
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                                errors.nombre 
                                    ? 'border-red-500 focus:ring-red-500' 
                                    : 'border-gray-300 focus:ring-blue-500'
                            }`}
                            autoFocus
                            disabled={loading}
                            maxLength={30}
                            onKeyPress={(e) => {
                                const char = e.key;
                                const isValid = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]$/.test(char);
                                if (!isValid) {
                                    e.preventDefault();
                                }
                            }}
                            onPaste={(e) => {
                                e.preventDefault();
                                const texto = e.clipboardData.getData('text');
                                const textoLimpio = texto.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
                                const input = e.target as HTMLInputElement;
                                const inicio = input.selectionStart || 0;
                                const fin = input.selectionEnd || 0;
                                const valorActual = input.value;
                                const nuevoValor = valorActual.substring(0, inicio) + textoLimpio + valorActual.substring(fin);
                                input.value = nuevoValor;
                                input.setSelectionRange(inicio + textoLimpio.length, inicio + textoLimpio.length);
                                input.dispatchEvent(new Event('input', { bubbles: true }));
                            }}
                            {...register('nombre')}
                        />
                        <div className="h-6 mt-1">
                            {errors.nombre && (
                                <div className="flex items-center gap-1 text-red-600 text-sm">
                                    <AlertCircle size={15} />
                                    <span>{errors.nombre.message}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-4 justify-center mt-8">
                        <button
                            type="button"
                            onClick={handleCancelar}
                            disabled={loading}
                            className='flex items-center gap-2 font-semibold py-2.5 px-6 rounded-lg bg-neutro-200 text-neutro-700 hover:bg-neutro-300 transition-colors'
                        >
                            <X className="w-5 h-5" />
                            <span>Cancelar</span>
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 font-semibold py-2.5 px-6 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    <span>Guardar</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}