//PUEDES EDITAR TODO LO NECESARIO Y DESCHAER SI ES POSIBLE
import { useState } from 'react';
import { IconoPlus } from '../../areas/componentes/IconoPlus';
import { ModalCrearNivel } from './ModalCrearNivel';

export const MockupNiveles = () => {
    const [modalAbierto, setModalAbierto] = useState(false);

    const handleCrearNivel = (data: { nombre: string, descripcion?: string, id_area: number }) => {
        console.log('Crear nivel:', data);
        alert(`Nivel "${data.nombre}" sería creado (mockup)`);
        setModalAbierto(false);
    };

    return (
        <>
            <div className="bg-white rounded-lg shadow-md p-6">
                {/* Header con selector de área */}
                <div className="mb-6">
                    <div className="bg-gray-300 text-center py-2 px-4 rounded mb-4">
                        <span className="font-semibold">Área:</span>
                    </div>
                    
                    <h2 className="text-xl font-semibold text-gray-700 text-center mb-4">
                        Lista de Niveles
                    </h2>

                    {/* Tabla de niveles (mockup) */}
                    <div className="mb-4">
                        <table className="w-full border border-blue-500 rounded-lg overflow-hidden">
                            <thead>
                                <tr className="bg-blue-500 text-white">
                                    <th className="text-left py-3 px-4 font-semibold">NRO</th>
                                    <th className="text-left py-3 px-4 font-semibold">NIVEL</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Filas vacías para mockup */}
                                <tr className="bg-gray-200">
                                    <td className="py-4 px-4"></td>
                                    <td className="py-4 px-4"></td>
                                </tr>
                                <tr className="bg-gray-200">
                                    <td className="py-4 px-4"></td>
                                    <td className="py-4 px-4"></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Botón Nuevo Nivel */}
                    <div className="flex justify-center">
                        <button
                            onClick={() => setModalAbierto(true)}
                            className="inline-flex items-center gap-2 px-6 py-2 font-semibold rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                        >
                            <IconoPlus />
                            Nuevo Nivel
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal para crear nivel */}
            <ModalCrearNivel
                isOpen={modalAbierto}
                onClose={() => setModalAbierto(false)}
                onGuardar={handleCrearNivel}
            />
        </>
    );
};