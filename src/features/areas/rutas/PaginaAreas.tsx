import { useState } from 'react';
import { IconoPlus } from '../componentes/IconoPlus';
import { ModalCrearArea } from '../componentes/ModalCrearAreas';
import type { Area } from '../tipos';

export function PaginaAreas() {
    const [areas, setAreas] = useState<Area[]>([]);
    const [modalAbierto, setModalAbierto] = useState(false);

    const handleCrearArea = (nombre: string) => {
        const nuevaArea: Area = {
            id: areas.length + 1,
            nombre
        };
        setAreas([...areas, nuevaArea]);
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
                            className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
                        >
                            <IconoPlus />
                            Nueva Área
                        </button>
                    </div>

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
                                    areas.map((area, index) => (
                                        <tr key={area.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4 text-gray-800">{index + 1}</td>
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
            />
        </div>
    );
}
