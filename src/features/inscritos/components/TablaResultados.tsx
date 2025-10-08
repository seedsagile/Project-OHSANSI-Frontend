import { useState } from 'react';
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from '@tanstack/react-table';
import type { FilaProcesada } from '../types/indexInscritos';

type TooltipState = { visible: boolean; content: string; x: number; y: number };

type TablaResultadosProps = {
    data: FilaProcesada[];
    columns: ColumnDef<FilaProcesada>[];
    invalidHeaders: string[];
};

export function TablaResultados({ data, columns, invalidHeaders }: TablaResultadosProps) {
    const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });
    const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, content: '', x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent, fila: FilaProcesada) => {
        if (fila.esValida || !fila.errores) return;
        const content = `Fila ${fila.numeroDeFila} - Errores:\n` +
            Object.entries(fila.errores)
                .map(([key, value]) => `• ${key}: ${value}`)
                .join('\n');
        setTooltip({ visible: true, content: content, x: e.clientX + 15, y: e.clientY + 15 });
    };
    const handleMouseLeave = () => setTooltip({ visible: false, content: '', x: 0, y: 0 });

    const showHeader = columns.length > 0;

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
                <div className="w-full overflow-auto max-h-96" onMouseLeave={handleMouseLeave}>
                    <table className="text-left table-auto">
                        {showHeader && (
                            <thead className="sticky top-0 z-10 bg-principal-500">
                                {table.getHeaderGroups().map(headerGroup => (
                                    <tr key={headerGroup.id}>
                                        {headerGroup.headers.map(header => {
                                            const headerText = String(header.column.columnDef.header);
                                            const isInvalid = invalidHeaders.includes(headerText);
                                            return (
                                                <th
                                                    key={header.id}
                                                    title={isInvalid ? `La columna "${headerText}" no es válida.` : ''}
                                                    className={`p-4 text-sm font-bold text-blanco tracking-wider uppercase text-center whitespace-nowrap transition-colors min-w-[180px] ${
                                                        isInvalid ? 'bg-acento-700 cursor-help' : 'bg-principal-500'
                                                    }`}
                                                >
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                </th>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </thead>
                        )}
                        <tbody className="divide-y divide-neutro-200">
                            {!showHeader ? (
                                <tr><td><div className="flex items-center justify-center p-10 text-neutro-400">Aún no se han cargado datos.</div></td></tr>
                            ) : table.getRowModel().rows.length === 0 ? (
                                <tr><td colSpan={columns.length} className="text-center p-10 text-neutro-400">El archivo no contiene filas de datos para mostrar.</td></tr>
                            ) : (
                                table.getRowModel().rows.map(row => (
                                    <tr
                                        key={row.id}
                                        onMouseMove={(e) => handleMouseMove(e, row.original)}
                                        className={`transition-colors ${!row.original.esValida ? 'bg-acento-100/50 cursor-help' : 'even:bg-neutro-50 hover:bg-principal-50'}`}
                                    >
                                        {row.getVisibleCells().map(cell => {
                                            const headerText = String(cell.column.columnDef.header);
                                            const isInvalidColumn = invalidHeaders.includes(headerText);
                                            const cellKey = cell.column.id;
                                            const hasCellError = row.original.errores && row.original.errores[cellKey];
                                            return (
                                                <td key={cell.id} className={`p-4 text-neutro-700 text-center whitespace-nowrap transition-colors ${
                                                    isInvalidColumn ? 'bg-acento-200/50' : hasCellError ? 'bg-acento-200 font-medium' : ''
                                                }`}>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </td>
                                            );
                                        })}
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