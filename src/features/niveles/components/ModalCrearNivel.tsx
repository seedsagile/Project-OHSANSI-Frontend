// src/features/niveles/components/ModalCrearNivel.tsx

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Save, AlertCircle } from 'lucide-react';
import { crearNivelEsquema, type CrearNivelFormData } from '../utils/esquemas';
import { restringirCaracteres } from '../../responsables/utils/formUtils';

type ModalCrearNivelProps = {
    isOpen: boolean;
    onClose: () => void;
    onGuardar: (data: CrearNivelFormData) => void;
    loading?: boolean;
};

export const ModalCrearNivel = ({ isOpen, onClose, onGuardar, loading = false }: ModalCrearNivelProps) => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm<CrearNivelFormData>({
        resolver: zodResolver(crearNivelEsquema),
        mode: 'onBlur',
    });

    useEffect(() => {
        if (isOpen) {
            reset({ nombre: '' });
        }
    }, [isOpen, reset]);

    const handleCancelar = () => {
        reset({ nombre: '' });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-negro/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div 
                className="bg-blanco rounded-xl shadow-2xl w-full max-w-md p-8"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-xl font-semibold text-center mb-6">Crear Nuevo Nivel</h2>
                
                <form onSubmit={handleSubmit(onGuardar)}>
                    <div className="mb-4">
                        <label htmlFor="nombreNivel" className="block text-sm font-medium text-gray-700 mb-2">
                            Nombre del Nivel: <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="nombreNivel"
                            type="text"
                            placeholder="Ej: Secundaria, Bachillerato, etc."
                            maxLength={30}
                            onKeyPress={(e) => {restringirCaracteres(e, /^[a-zA-Z\s\u00C0-\u017F]+$/);}}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                                errors.nombre ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                            }`}
                            autoFocus
                            disabled={loading}
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
};