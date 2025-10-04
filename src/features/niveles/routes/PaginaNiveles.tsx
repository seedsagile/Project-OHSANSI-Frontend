import { useMemo } from 'react';
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from '@tanstack/react-table';
import { IconoPlus } from '../../areas/components/IconoPlus';
import { useGestionNiveles } from '../hooks/useGestionNiveles';
import type { Nivel } from '../types';
import { ModalCrearNivel } from '../components/ModalCrearNivel';
import { ModalConfirmacion } from '../../areas/components/ModalConfirmacion';

export function PaginaNiveles() {
    const {
        niveles,
        isLoading,
        isCreating,
        modalCrearAbierto,
        confirmationModal,
        abrirModalCrear,
        cerrarModalCrear,
        cerrarModalConfirmacion,
        handleGuardarNivel,
    } = useGestionNiveles();

    const columns = useMemo<ColumnDef<Nivel>[]>(() => [
        { id: 'nro', header: 'NRO', cell: info => info.row.index + 1 },
        { accessorKey: 'nombre', header: 'NIVEL' },
    ], []);

    const table = useReactTable({ data: niveles, columns, getCoreRowModel: getCoreRowModel() });

    return (
        <div className="bg-neutro-100 min-h-screen flex items-center justify-center p-4 md:p-8 font-display">
            <main className="bg-blanco w-full max-w-4xl rounded-xl shadow-sombra-3 p-6 md:p-8">
                <header className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-negro tracking-tighter">
                        Niveles
                    </h1>
                </header>
                
                <div className="rounded-lg border border-neutro-200 overflow-hidden relative h-96">
                    <div className="absolute inset-0 overflow-y-auto">
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
                                    <tr><td colSpan={columns.length} className="text-center p-10 text-neutro-400">Cargando niveles...</td></tr>
                                ) : table.getRowModel().rows.length === 0 ? (
                                    <tr><td colSpan={columns.length} className="text-center p-10 text-neutro-400">No hay niveles registrados.</td></tr>
                                ) : (
                                    table.getRowModel().rows.map(row => (
                                        <tr key={row.id} className="even:bg-neutro-100 hover:bg-principal-50 transition-colors">
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

                <footer className="flex justify-end mt-6">
                    <button onClick={abrirModalCrear} disabled={isLoading} className="inline-flex items-center gap-2 px-6 py-2.5 font-semibold rounded-lg bg-principal-500 text-white hover:bg-principal-600 transition-colors disabled:opacity-50">
                        <IconoPlus />
                        Nuevo Nivel
                    </button>
                </footer>
            </main>

            <ModalCrearNivel isOpen={modalCrearAbierto} onClose={cerrarModalCrear} onGuardar={handleGuardarNivel} loading={isCreating} />
            
            <ModalConfirmacion 
                isOpen={confirmationModal.isOpen} 
                onClose={cerrarModalConfirmacion} 
                onConfirm={confirmationModal.onConfirm} 
                title={confirmationModal.title} 
                type={confirmationModal.type} 
                loading={isCreating}
            >
                {confirmationModal.message}
            </ModalConfirmacion>
        </div>
    );
}