import { useState, useEffect } from 'react';
import { IconoPlus } from '../componentes/IconoPlus';
import { ModalCrearArea } from '../componentes/ModalCrearAreas';
import { areasService } from '../servicios/areasService';
import type { Area, CrearAreaData } from '../tipos';
import { MockupNiveles } from '../../niveles/componentes/MockupNiveles';

export function PaginaAreas() {
    const [areas, setAreas] = useState<Area[]>([]);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
    
            setModalAbierto(false);//nos lo cierra el modal
            
            // Recargar la lista completa desde la base de datos
            await cargarAreas();
            
            alert(`Área "${nuevaArea.nombre}" creada exitosamente`);
        } catch (error) {
            console.error('Error al crear área:', error);
            setError('Error al crear el área. Por favor intente nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen p-6">
            
            <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">{/* este es para Título principal centrado */}
                Áreas y Niveles
            </h1>
            
            <div className="max-w-7xl mx-auto relative"> {/* Contenedor principal con dos columnas, ojito aqui esta la línea divisoria */}
                {/* Línea divisoria vertical */}
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300 transform -translate-x-1/2 z-10"></div>
                
                <div className="grid grid-cols-2 gap-8">
                    {/* Columna izquierda: Áreas */}
                    <div className="p-4 pr-8">
                        <h2 className="text-xl font-semibold text-gray-700 text-center mb-4">
                            Lista de Áreas
                        </h2>
                        
                        {/* Mostrar error si existe */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-red-600 text-sm">{error}</p>
                                <button 
                                    onClick={cargarAreas}
                                    className="mt-2 text-xs text-red-800 underline hover:no-underline"
                                >
                                    Reintentar
                                </button>
                            </div>
                        )}

                        {/* Tabla de áreas */}
                        <div className="mb-4">
                            <table className="w-full border border-blue-500 rounded-lg overflow-hidden">
                                <thead>
                                    <tr className="bg-blue-500 text-white">
                                        <th className="text-left py-3 px-4 font-semibold">NRO</th>
                                        <th className="text-left py-3 px-4 font-semibold">ÁREA</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {areas.length === 0 ? (
                                        <>
                                            <tr className="bg-gray-100">
                                                <td className="py-4 px-4"></td>
                                                <td className="py-4 px-4"></td>
                                            </tr>
                                            <tr className="bg-white">
                                                <td className="py-4 px-4"></td>
                                                <td className="py-4 px-4"></td>
                                            </tr>
                                        </>
                                    ) : (
                                        areas.map((area, index) => (
                                            <tr 
                                                key={area.id_area} 
                                                className={`border-b border-blue-300 hover:bg-blue-50 transition-colors ${
                                                    index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                                                }`}
                                            >
                                                <td className="py-3 px-4">{area.id_area}</td>
                                                <td className="py-3 px-4">{area.nombre}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Botón Nueva Área alineado a la derecha */}
                        <div className="flex justify-end">
                            <button
                                onClick={() => setModalAbierto(true)}
                                disabled={loading}
                                className="inline-flex items-center gap-2 px-6 py-2 font-semibold rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <IconoPlus />
                                Nueva Área
                            </button>
                        </div>
                    </div>
                    
                    {/* Columna derecha: Mockup de Niveles */}
                    <div className="pl-8">
                        <MockupNiveles />
                    </div>
                </div>
            </div>

            {/* Modal */}
            <ModalCrearArea
                isOpen={modalAbierto}
                onClose={() => setModalAbierto(false)}
                onGuardar={handleCrearArea}
                loading={loading}
            />
        </div>
    );
}