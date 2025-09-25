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
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-4xl mx-auto">
                {/* Botón Nueva Área */}
                <div className="mb-6">
                    <button
                        onClick={() => setModalAbierto(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
                    >
                        <IconoPlus />
                        Nueva Área
                    </button>
                </div>

                {/* Título */}
                <h1 className="text-xl font-medium text-gray-800 mb-6">Lista de áreas</h1>

                {/* Tabla */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-4 px-6 text-gray-600 font-medium">
                                    Nro
                                </th>
                                <th className="text-left py-4 px-6 text-gray-600 font-medium">
                                    Nombre de Área
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {areas.length === 0 ? (
                                <tr>
                                    <td colSpan={2} className="py-12 px-6 text-center text-gray-500">
                                        No hay áreas registradas
                                    </td>
                                </tr>
                            ) : (
                                areas.map((area, index) => (
                                    <tr key={area.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-4 px-6 text-gray-800">
                                            {index + 1}
                                        </td>
                                        <td className="py-4 px-6 text-gray-800">
                                            {area.nombre}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
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