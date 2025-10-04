// src/features/areas/rutas/PaginaAreas.tsx
import { useState, useEffect } from 'react';
import { IconoPlus } from '../componentes/IconoPlus';
import { ModalCrearArea } from '../componentes/ModalCrearAreas';
import { areasService } from '../servicios/areasService';
import type { Area, CrearAreaData } from '../tipos';

// Componente para mostrar mensajes de éxito
const MensajeExito = ({ mensaje, onClose }: { mensaje: string; onClose: () => void }) => (
    <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md shadow-lg z-50 max-w-md">
        <div className="flex items-center justify-between">
            <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                    />
                </svg>
                <span className="font-medium">{mensaje}</span>
            </div>
            <button onClick={onClose} className="ml-4 text-green-500 hover:text-green-700">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>
        </div>
    </div>
);

export function PaginaAreas() {
    const [areas, setAreas] = useState<Area[]>([]);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mensajeExito, setMensajeExito] = useState<string | null>(null);

    useEffect(() => {
        cargarAreas();
    }, []);

    const cargarAreas = async () => {
        try {
            setError(null);
            const areasData = await areasService.obtenerAreas();
            setAreas(areasData);
        } catch (error) {
            console.error('Error al cargar áreas:', error);
            setError('Error al cargar las áreas. Verifique que el servidor esté funcionando.');
        }
    };

    const handleCrearArea = async (data: CrearAreaData) => {
        try {
            setLoading(true);
            setError(null);
            const nuevaArea = await areasService.crearArea(data);
            setModalAbierto(false);
            await cargarAreas();
            const nombreCreada = nuevaArea?.nombre || data.nombre;
            setMensajeExito(`Área "${nombreCreada}" creada exitosamente`);
            setTimeout(() => setMensajeExito(null), 5000);
        } catch (error) {
            console.error('Error al crear área:', error);
            let mensajeError = 'Error al crear el área. Por favor intente nuevamente.';
            if (error instanceof Error) {
                if (error.message.toLowerCase().includes('existe')) {
                    mensajeError = 'Ya existe un área con este nombre. Por favor ingrese un nombre diferente.';
                } else if (
                    error.message.toLowerCase().includes('inválidos') ||
                    error.message.toLowerCase().includes('válidos')
                ) {
                    mensajeError = 'Los datos ingresados no son válidos. Verifique la información.';
                } else {
                    mensajeError = error.message;
                }
            }
            setError(mensajeError);
            setTimeout(() => setError(null), 8000);
        } finally {
            setLoading(false);
        }
    };

    const cerrarMensajeExito = () => setMensajeExito(null);

    const filasParaMostrar = [...areas];
    while (filasParaMostrar.length < 5) {
        filasParaMostrar.push({
            id_area: 0,
            nombre: '',
            activo: 0,
            created_at: '',
            update_ad: '',
        } as Area);
    }

    return (
        <div className="min-h-screen p-4 sm:p-6 flex flex-col items-center justify-center">
            <div className="w-full max-w-3xl">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-6 sm:mb-8">
                    Registrar Áreas de Olimpiada 
                </h1>

                {/* Mostrar error si existe */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <div className="flex items-center">
                            <svg
                                className="w-5 h-5 text-red-400 mr-2 flex-shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                        <button
                            onClick={cargarAreas}
                            className="mt-2 text-xs text-red-800 underline hover:no-underline"
                        >
                            Reintentar
                        </button>
                    </div>
                )}

                {/* Tabla de áreas */}
                <div className="mb-4 overflow-hidden rounded-lg shadow-md">
                    <div className="overflow-y-auto" style={{ maxHeight: '384px' }}>
                        <table className="w-full">
                            <thead className="sticky top-0 bg-blue-500 text-white z-10">
                                <tr>
                                    <th className="text-left py-3 px-4 font-semibold">NRO</th>
                                    <th className="text-left py-3 px-4 font-semibold">ÁREA</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filasParaMostrar.map((area, index) => (
                                    <tr
                                        key={area.id_area || `empty-${index}`}
                                        className={`${
                                            index % 2 === 0 ? 'bg-gray-50' : 'bg-neutro-200'
                                        } ${area.nombre ? 'hover:bg-blue-50 transition-colors' : ''}`}
                                        style={{ height: '64px' }}
                                    >
                                        <td className="py-3 px-4">{area.id_area || ''}</td>
                                        <td className="py-3 px-4">{area.nombre || ''}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Botón Nueva Área */}
                <div className="flex justify-end">
                    <button
                        onClick={() => setModalAbierto(true)}
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-6 py-2 font-semibold rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                        <IconoPlus />
                        Nueva Área
                    </button>
                </div>
            </div>

            {/* Modal */}
            <ModalCrearArea
                isOpen={modalAbierto}
                onClose={() => setModalAbierto(false)}
                onGuardar={handleCrearArea}
                loading={loading}
                areasExistentes={areas}
            />

            {/* Mensaje de éxito */}
            {mensajeExito && <MensajeExito mensaje={mensajeExito} onClose={cerrarMensajeExito} />}
        </div>
    );
}
