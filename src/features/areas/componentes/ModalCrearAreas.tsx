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
                setErrores({ nombre: 'El nombre del área es obligatorio' });
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
        
        // Limitar a 30 caracteres
        if (valorLimpio.length <= 30) {
            setNombre(valorLimpio);
        }

        // Limpiar errores mientras escribe
        if (errores.nombre) {
            setErrores(prev => ({ ...prev, nombre: undefined }));
        }
    };

    const handleGuardar = () => {
        if (validarFormulario()) {
            onGuardar({ nombre: nombre.trim() });
        }
    };

    const handleCancelar = () => {
        setNombre('');
        setErrores({});
        onClose();
    };

    const caracteresRestantes = 30 - nombre.length;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 pointer-events-auto">
                <h2 className="text-xl font-semibold text-center mb-6">Crear Área</h2>
                
                <div className="mb-6">
                    <div className="flex items-center gap-4 mb-2">
                        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                            Nombre del Área: <span className="text-red-500">*</span>
                        </label>
                        <div className="flex-1">
                            <input
                                type="text"
                                value={nombre}
                                onChange={(e) => handleNombreChange(e.target.value)}
                                placeholder="Ingrese el nombre del área"
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                                    errores.nombre 
                                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                }`}
                                autoFocus
                                disabled={loading}
                                maxLength={30}
                            />
                        </div>
                    </div>
                    
                    {/* Contador de caracteres */}
                    <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                        <span></span>
                        <span className={`${caracteresRestantes < 5 ? 'text-orange-500' : ''}`}>
                            {caracteresRestantes} caracteres restantes
                        </span>
                    </div>

                    {/* Mostrar errores */}
                    {errores.nombre && (
                        <div className="flex items-center gap-2 text-red-600 text-sm">
                            <AlertCircle size={16} />
                            <span>{errores.nombre}</span>
                        </div>
                    )}

                    {errores.general && (
                        <div className="flex items-center gap-2 text-red-600 text-sm">
                            <AlertCircle size={16} />
                            <span>{errores.general}</span>
                        </div>
                    )}
                </div>

                <div className="flex gap-4 justify-center">
                    <button
                        onClick={handleCancelar}
                        disabled={loading}
                        className="flex items-center gap-2 font-semibold py-2.5 px-6 rounded-lg bg-gray-700 text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                        <X size={20} className='flex-shrink-0'/>
                        <span>Cancelar</span>
                    </button>
                    <button
                        onClick={handleGuardar}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 font-semibold py-2.5 px-6 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save size={20} className="flex-shrink-0"/>
                        <span>{loading ? "Guardando..." : "Guardar"}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};