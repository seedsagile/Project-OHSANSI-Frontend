//src/features/components/ModalCrearAareas.tsx
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Save, AlertCircle } from 'lucide-react';
import { crearAreaEsquema, type CrearAreaFormData } from '../utils/esquemas';

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
    const { 
        register, 
        handleSubmit, 
        formState: { errors }, 
        reset, 
        setValue, 
        watch 
    } = useForm<CrearAreaFormData>({
        resolver: zodResolver(crearAreaEsquema),
        mode: 'onChange',
    });

    const [errorTiempoReal, setErrorTiempoReal] = useState<string>('');
    const [touched, setTouched] = useState(false);
    const valorNombre = watch('nombre');

    useEffect(() => {
        if (isOpen) {
            reset({ nombre: '' });
            setErrorTiempoReal('');
            setTouched(false);
        }
    }, [isOpen, reset]);

    // Validación en tiempo real para caracteres no permitidos
    useEffect(() => {
        if (valorNombre && valorNombre.length > 0) {
            const tieneNumeros = /\d/.test(valorNombre);
            const tieneCaracteresEspeciales = /[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/.test(valorNombre);
            
            if (tieneNumeros) {
                setErrorTiempoReal('El campo Nombre del Área contiene caracteres numéricos. Sólo se aceptan letras y espacios.');
            } else if (tieneCaracteresEspeciales) {
                setErrorTiempoReal('El campo Nombre del Área contiene caracteres especiales. Solo se permiten letras y espacios.');
            } else {
                setErrorTiempoReal('');
            }
        } else {
            setErrorTiempoReal('');
        }
    }, [valorNombre]);

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const input = document.getElementById('nombre') as HTMLInputElement;
        const valorActual = input?.value || '';
        
        // Validación 2: Si solo contiene espacios
        if (valorActual.trim() === '') {
            setValue('nombre', '', { shouldValidate: true });
            setTouched(true);
            return;
        }
        
        // Validación 12: No permitir guardar con datos inválidos
        const tieneNumeros = /\d/.test(valorActual);
        const tieneCaracteresEspeciales = /[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/.test(valorActual);
        
        if (tieneNumeros || tieneCaracteresEspeciales) {
            return; // No permitir el envío
        }
        
        // Validación 13: Si pasa todas las validaciones, continuar
        handleSubmit(onGuardar)(e);
    };

    const handleCancelar = () => {
        reset({ nombre: '' });
        setErrorTiempoReal('');
        setTouched(false);
        onClose();
    };

    const handleClickOutside = () => {
        // Mostrar error inmediatamente si el campo está vacío al hacer clic fuera
        setTouched(true);
        if (!valorNombre || valorNombre.trim() === '') {
            setValue('nombre', '', { shouldValidate: true });
        }
    };

    const handleBlur = () => {
        // Marcar como tocado y validar cuando el usuario sale del campo
        setTouched(true);
        if (!valorNombre || valorNombre.trim() === '') {
            setValue('nombre', '', { shouldValidate: true });
        }
    };

    if (!isOpen) return null;

    // Mostrar error de validación en tiempo real o error de react-hook-form
    const mensajeError = errorTiempoReal || (touched && errors.nombre?.message) || errors.nombre?.message;

    return (
        <div 
            className="fixed inset-0 bg-negro/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={handleClickOutside}
        >
            <div 
                className="bg-white rounded-lg shadow-lg border-2 border-black w-full max-w-md p-6"
                onClick={(e) => {
                    e.stopPropagation();
                    // Si se hace clic en cualquier parte del modal (no en el input)
                    const target = e.target as HTMLElement;
                    if (target.tagName !== 'INPUT') {
                        setTouched(true);
                        if (!valorNombre || valorNombre.trim() === '') {
                            setValue('nombre', '', { shouldValidate: true });
                        }
                    }
                }}
            >
                <h2 className="text-xl font-semibold text-center mb-6">Crear Área</h2>
                
                <form onSubmit={handleFormSubmit}>
                    <div className="mb-4">
                        <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                            Nombre del Área: <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="nombre"
                            type="text"
                            placeholder="Ingrese el nombre del área"
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                                mensajeError
                                    ? 'border-red-500 focus:ring-red-500' 
                                    : 'border-gray-300 focus:ring-blue-500'
                            }`}
                            autoFocus
                            disabled={loading}
                            maxLength={30}
                            {...register('nombre', {
                                onBlur: handleBlur
                            })}
                        />
                        <div className="h-12 mt-1">
                            {mensajeError && (
                                <div className="flex items-start gap-1 text-red-600 text-sm">
                                    <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
                                    <span>{mensajeError}</span>
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
                            className="flex items-center gap-2 font-semibold py-2.5 px-6 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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