import { useState, useEffect } from 'react';
import { IconoPlus } from '../componentes/IconoPlus';
import { ModalCrearArea } from '../componentes/ModalCrearAreas';
import { areasService } from '../servicios/areasService';
import type { Area, CrearAreaData } from '../tipos';

export function PaginaAreas() {
    const [areas, setAreas] = useState<Area[]>([]);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Cargar áreas al montar el componente
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
            
            // Agregar la nueva área a la lista
            setAreas(prevAreas => [...prevAreas, nuevaArea]);
            setModalAbierto(false);
            
            // Opcional: mostrar mensaje de éxito
            alert(`Área "${nuevaArea.nombre}" creada exitosamente`);
            
        } catch (error) {
            console.error('Error al crear área:', error);
            setError('Error al crear el área. Por favor intente nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex p-4">
            {/* Contenedor horizontal principal */}
            <div className="flex w-full max-w-6xl gap-4 h-screen mx-auto">
                
                {/* Mitad izquierda: botón, título y tabla */}
                <div className="w-1/2 flex flex-col">
                    
                    {/* Botón alineado a la derecha */}
                    <div className="flex justify-end mb-2">
                        <button
                            onClick={() => setModalAbierto(true)}
                            disabled={loading}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <IconoPlus />
                            Nueva Área
                        </button>
                    </div>

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

                    {/* Título centrado */}
                    <h1 className="text-xl font-medium text-gray-800 mb-4 text-center">
                        Lista de áreas
                    </h1>

                    {/* Tabla ocupa todo el espacio restante */}
                    <div className="flex-1 overflow-auto">
                        <table className="w-full border border-gray-200 rounded-lg">
                            <thead>
                                <tr className="bg-gray-100 border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-medium text-gray-600">Nro</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-600">Nombre de Área</th>
                                </tr>
                            </thead>
                            <tbody>
                                {areas.length === 0 ? (
                                    <tr>
                                        <td colSpan={2} className="py-12 px-4 text-center text-gray-500">
                                            No hay áreas registradas
                                        </td>
                                    </tr>
                                ) : (
                                    areas.map((area) => (
                                        <tr key={area.id_area} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4 text-gray-800">{area.id_area}</td>
                                            <td className="py-3 px-4 text-gray-800">{area.nombre}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                {/* Mitad derecha: espacio vacío para otra tabla */}
                <div className="w-1/2"></div>
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