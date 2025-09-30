// src/features/areas/routes/PaginaAreas.tsx
import { useMemo } from 'react';
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from '@tanstack/react-table';
import { IconoPlus } from '../components/IconoPlus';
import { ModalCrearArea } from '../components/ModalCrearAreas';
import { ModalConfirmacion } from '../components/ModalConfirmacion';
import { useGestionAreas } from '../hooks/useGestionAreas';
import type { Area } from '../types'; 
import { GestionNiveles } from '../../niveles/components/GestionNiveles';

export function PaginaAreas() {
    const {
        areas,
        isLoading,
        isCreating,
        modalCrearAbierto,
        confirmationModal,
        areaSeleccionada,
        setAreaSeleccionada,
        abrirModalCrear,
        cerrarModalCrear,
        cerrarModalConfirmacion,
        handleGuardarArea,
    } = useGestionAreas();

    const columns = useMemo<ColumnDef<Area>[]>(() => [
        { accessorKey: 'id_area', header: 'NRO' },
        { accessorKey: 'nombre', header: 'ÁREA' },
    ], []);

    const table = useReactTable({ data: areas, columns, getCoreRowModel: getCoreRowModel() });

    return (
        <div className="bg-neutro-100 min-h-screen flex items-center justify-center p-4 font-display">
            <main className="bg-blanco w-full max-w-7xl rounded-xl shadow-sombra-3 p-8">
                <header className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-negro tracking-tighter">
                        Gestión de Áreas y Niveles
                    </h1>
                </header>
                
                <div className="grid grid-cols-2 gap-8">
                    {/* Columna izquierda: Áreas */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-700 text-center mb-4">
                            Lista de Áreas
                        </h2>
                        <div className="rounded-lg border border-neutro-200 overflow-hidden">
                            <div className="max-h-96 overflow-y-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-principal-500 sticky top-0 z-10">
                                        {table.getHeaderGroups().map(headerGroup => (
                                            <tr key={headerGroup.id}>
                                                {headerGroup.headers.map(header => <th key={header.id} className="p-4 text-sm font-bold text-blanco tracking-wider uppercase text-center">{flexRender(header.column.columnDef.header, header.getContext())}</th>)}
                                            </tr>
                                        ))}
                                    </thead>
                                    <tbody className="divide-y divide-neutro-200">
                                        {isLoading ? (
                                            <tr><td colSpan={columns.length} className="text-center p-10 text-neutro-400">Cargando...</td></tr>
                                        ) : table.getRowModel().rows.length === 0 ? (
                                            <tr><td colSpan={columns.length} className="text-center p-10 text-neutro-400">No hay áreas registradas.</td></tr>
                                        ) : (
                                            table.getRowModel().rows.map(row => (
                                                <tr 
                                                    key={row.id} 
                                                    onClick={() => setAreaSeleccionada(row.original)} // <-- Hacemos la fila clickeable
                                                    className={`cursor-pointer transition-colors ${
                                                        areaSeleccionada?.id_area === row.original.id_area
                                                            ? 'bg-principal-100' // Estilo para la fila seleccionada
                                                            : 'even:bg-neutro-100 hover:bg-principal-50'
                                                    }`}
                                                >
                                                    {row.getVisibleCells().map(cell => (
                                                        <td key={cell.id} className="p-4 text-neutro-700 text-center">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                                                    ))}
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="flex justify-end mt-6">
                            <button onClick={abrirModalCrear} disabled={isLoading} className="inline-flex items-center gap-2 px-6 py-2.5 font-semibold rounded-lg bg-principal-500 text-white hover:bg-principal-600 transition-colors disabled:opacity-50">
                                <IconoPlus />
                                Nueva Área
                            </button>
                        </div>
                    </div>
                    
                    {/* Columna derecha: Gestión de Niveles */}
                    <div>
                        <GestionNiveles areaSeleccionada={areaSeleccionada} />
                    </div>
                </div>
            </main>

            <ModalCrearArea isOpen={modalCrearAbierto} onClose={cerrarModalCrear} onGuardar={handleGuardarArea} loading={isCreating} />
            <ModalConfirmacion isOpen={confirmationModal.isOpen} onClose={cerrarModalConfirmacion} onConfirm={confirmationModal.onConfirm} title={confirmationModal.title} type={confirmationModal.type} loading={isCreating}>
                {confirmationModal.message}
            </ModalConfirmacion>
        </div>
    );
}