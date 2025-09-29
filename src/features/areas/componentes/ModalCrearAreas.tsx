// src/features/areas/componentes/ModalCrearAreas.tsx
import { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { crearAreaEsquema, validarNombreUnico } from '../validaciones/esquemas';
import type { ErroresValidacion } from '../validaciones/esquemas';
import type { Area } from '../tipos';

type ModalCrearAreaProps = {
    isOpen: boolean;
    onClose: () => void;
    onGuardar: (data: { nombre: string, descripcion?: string }) => void;
    loading?: boolean;
    areasExistentes?: Area[];
};

export const ModalCrearArea = ({ 
    isOpen, 
    onClose, 
    onGuardar, 
    loading = false,
    areasExistentes = []
}: ModalCrearAreaProps) => {
    const [nombre, setNombre] = useState('');
    const [errores, setErrores] = useState<ErroresValidacion>({});

    // Limpiar formulario cuando se abre/cierra el modal
    useEffect(() => {
        if (isOpen) {
            setNombre('');
            setErrores({});
        }
    }, [isOpen]);

    const validarFormulario = (): boolean => {
        try {
            // Validar espacios en blanco
            if (nombre.trim() === '') {
                setErrores({ nombre: 'No se permiten espacios en blanco. Por favor ingrese un nombre válido' });
                return false;
            }

            // Validar con Zod
            crearAreaEsquema.parse({ nombre });
            
            // Validar nombre único
            if (!validarNombreUnico(nombre, areasExistentes)) {
                setErrores({ nombre: 'Ya existe un área con este nombre' });
                return false;
            }

            setErrores({});
            return true;
        } catch (error) {
            // Manejo simple de errores sin any
            if (nombre.trim() === '') {
                setErrores({ nombre: 'No se permiten espacios en blanco. Por favor ingrese un nombre válido' });
            } else if (nombre.length > 30) {
                setErrores({ nombre: 'El nombre no puede exceder 30 caracteres' });
            } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(nombre)) {
                setErrores({ nombre: 'Solo se permiten letras, espacios y acentos' });
            } else {
                setErrores({ nombre: 'Datos inválidos' });
            }
            return false;
        }
    };

    const handleNombreChange = (valor: string) => {
        // Permitir solo caracteres válidos en tiempo real
        const valorLimpio = valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
        
        // Limitar a 30 caracteres (no permitir escribir más)
        if (valorLimpio.length <= 30) {
            setNombre(valorLimpio);
            // Limpiar errores mientras escribe
            if (errores.nombre) {
                setErrores(prev => ({ ...prev, nombre: undefined }));
            }
        }
        // Si intenta escribir más de 30, simplemente no lo permite (sin mostrar error)
    };

    const handleGuardar = () => {
        if (validarFormulario()) {
            // Enviar el nombre tal cual fue escrito (sin normalizar)
            onGuardar({ nombre: nombre.trim() });
            // Limpiar el campo después de guardar (mantener errores si los hay)
            setNombre('');
        } else {
            // Si la validación falla, limpiar el campo pero mantener el error
            setNombre('');
        }
    };

    const handleCancelar = () => {
        setNombre('');
        setErrores({});
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none">
            <div className="bg-white rounded-lg shadow-lg border-2 border-black w-full max-w-md p-4 sm:p-6 pointer-events-auto">
                <h2 className="text-lg sm:text-xl font-semibold text-center mb-4 sm:mb-6">Crear Area</h2>
                
                <div className="mb-4 sm:mb-6">
                    <div className="mb-2 flex items-center gap-3">
                        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                            Nombre del Area: <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={nombre}
                            onChange={(e) => handleNombreChange(e.target.value)}
                            //placeholder="Ingrese el nombre del área"
                            className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                                errores.nombre 
                                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                            }`}
                            autoFocus
                            disabled={loading}
                            maxLength={30}
                        />
                    </div>

                    {/* Contenedor de altura fija para errores */}
                    <div className="h-10 flex items-start">
                        {errores.nombre && (
                            <div className="flex items-start gap-2 text-red-600 text-sm">
                                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                                <span className="leading-tight">{errores.nombre}</span>
                            </div>
                        )}

                        {errores.general && (
                            <div className="flex items-start gap-2 text-red-600 text-sm">
                                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                                <span className="leading-tight">{errores.general}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-row gap-3 sm:gap-4 justify-center">
                    <button
                        onClick={handleCancelar}
                        disabled={loading}
                        //className="flex items-center justify-center gap-2 font-semibold py-2.5 px-4 sm:px-6 rounded-lg bg-gray-400 text-white hover:bg-gray-800 transition-colors disabled:opacity-50 text-sm sm:text-base"
                        className='flex items-center gap-2 font-semibold py-2.5 px-6 rounded-lg bg-neutro-200 text-neutro-700 hover:bg-neutro-300 transition-colors'
                    >
                        <X size={20} className='flex-shrink-0'/>
                        <span>Cancelar</span>
                    </button>
                    <button
                        onClick={handleGuardar}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 font-semibold py-2.5 px-4 sm:px-6 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                        <Save size={20} className="flex-shrink-0"/>
                        <span>{loading ? "Guardando..." : "Guardar"}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};