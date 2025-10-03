// src/features/inscritos/components/TablaResultados.tsx

import { useState } from 'react';
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from '@tanstack/react-table';
import type { FilaProcesada } from '../types/indexInscritos';

type TooltipState = {
    visible: boolean;
    content: string;
    x: number;
    y: number;
};

type TablaResultadosProps = {
    data: FilaProcesada[];
    columns: ColumnDef<FilaProcesada>[];
};

export function TablaResultados({ data, columns }: TablaResultadosProps) {
    const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });
    const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, content: '', x: 0, y: 0 });

    const handleMouseLeave = () => {
        setTooltip(prev => ({ ...prev, visible: false }));
    };

    const handleMouseMove = (e: React.MouseEvent, fila: FilaProcesada) => {
        if (fila.esValida || !fila.errores) return;

        const content = `Fila ${fila.numeroDeFila} - Errores:\n` +
            Object.entries(fila.errores)
                .map(([key, value]) => `• ${key}: ${value}`)
                .join('\n');

        setTooltip({ visible: true, content, x: e.clientX + 15, y: e.clientY + 15 });
    };

    return (
        <>
            {tooltip.visible && (
                <div
                    className="fixed bg-negro text-blanco text-sm rounded-md p-3 shadow-lg z-50 max-w-xs"
                    style={{ top: tooltip.y, left: tooltip.x, whiteSpace: 'pre-line' }}
                >
                    {tooltip.content}
                </div>
            )}
            <div className="rounded-lg border border-neutro-200 bg-blanco overflow-hidden">
                <div className="overflow-auto max-h-96" onMouseLeave={handleMouseLeave}>
                    <table className="text-left table-auto w-full">
                        {/* --- INICIO DE LA CORRECCIÓN --- */}
                        {/* Este es el bloque que faltaba */}
                        <thead className="bg-principal-500 sticky top-0 z-10">
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th key={header.id} className="p-4 text-sm font-bold text-blanco tracking-wider uppercase text-center whitespace-nowrap">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        {/* --- FIN DE LA CORRECCIÓN --- */}
                        <tbody className="divide-y divide-neutro-200">
                            {table.getRowModel().rows.length === 0 ? (
                                <tr><td colSpan={columns.length} className="text-center p-10 text-neutro-400">Aún no se han cargado datos.</td></tr>
                            ) : (
                                table.getRowModel().rows.map(row => (
                                    <tr
                                        key={row.id}
                                        onMouseMove={(e) => handleMouseMove(e, row.original)}
                                        onMouseLeave={handleMouseLeave}
                                        className={`transition-colors ${!row.original.esValida ? 'bg-acento-100 cursor-help' : 'even:bg-neutro-50 hover:bg-principal-50'}`}
                                    >
                                        {row.getVisibleCells().map(cell => (
                                            <td key={cell.id} className="p-4 text-neutro-700 text-center whitespace-nowrap">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}