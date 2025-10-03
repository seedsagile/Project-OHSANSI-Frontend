import { useMemo } from 'react';
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from '@tanstack/react-table';
import { IconoPlus } from '../../areas/components/IconoPlus';
import { useGestionNiveles } from '../hooks/useGestionNiveles';
import type { Area } from '../../areas/types';
import type { Nivel } from '../types';
import { ModalCrearNivel } from './ModalCrearNivel';
import { ModalConfirmacion } from '../../areas/components/ModalConfirmacion';

type Props = {
    areaSeleccionada?: Area;
}

export function GestionNiveles({ areaSeleccionada }: Props) {
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
        <div className="flex flex-col h-full">
            <div className="mb-4 p-3 bg-neutro-100 rounded-lg text-center">
                <span className="font-semibold text-neutro-700">Área Seleccionada: </span>
                <span className="font-bold text-principal-600">
                    {areaSeleccionada ? areaSeleccionada.nombre : 'Ninguna'}
                </span>
            </div>

            <h2 className="text-xl font-semibold text-gray-700 text-center mb-4">
                Lista de Niveles
            </h2>
            
            <div className="rounded-lg border border-neutro-200 overflow-hidden flex-grow relative">
                <div className="h-100 overflow-y-auto">
                    <table className="w-full text-left">
                        <thead className="bg-principal-500 sticky top-0 z-10">
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th key={header.id} className="p-4 text-sm font-bold text-blanco tracking-wider uppercase text-center">
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="divide-y divide-neutro-200">
                            {!areaSeleccionada ? (
                                <tr><td colSpan={columns.length} className="text-center p-10 text-neutro-400">Seleccione un área para ver sus niveles.</td></tr>
                            ) : isLoading ? (
                                <tr><td colSpan={columns.length} className="text-center p-10 text-neutro-400">Cargando niveles...</td></tr>
                            ) : table.getRowModel().rows.length === 0 ? (
                                <tr><td colSpan={columns.length} className="text-center p-10 text-neutro-400">Esta área no tiene niveles registrados.</td></tr>
                            ) : (
                                table.getRowModel().rows.map(row => (
                                    <tr key={row.id} className="even:bg-neutro-100 hover:bg-principal-100 transition-colors">
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

            <div className="flex justify-end mt-4">
                <button
                    onClick={abrirModalCrear}
                    disabled={!areaSeleccionada || isLoading}
                    className="inline-flex items-center gap-2 px-6 py-2.5 font-semibold rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <IconoPlus />
                    Nuevo Nivel
                </button>
            </div>

            <ModalCrearNivel
                isOpen={modalCrearAbierto}
                onClose={cerrarModalCrear}
                onGuardar={handleGuardarNivel}
                loading={isCreating}
            />

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