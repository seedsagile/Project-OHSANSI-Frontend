import { useState } from 'react';
import { 
  useReactTable, 
  getCoreRowModel, 
  getPaginationRowModel, 
  flexRender, 
  type ColumnDef 
} from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import type { FilaProcesada } from '../types/indexInscritos';
import { reverseHeaderMapping } from '../utils/csvProcessor';

type TooltipState = { visible: boolean; content: string; x: number; y: number };

type TablaResultadosProps = {
  data: FilaProcesada[];
  columns: ColumnDef<FilaProcesada>[];
  invalidHeaders: string[];
};

export function TablaResultados({ data, columns, invalidHeaders }: TablaResultadosProps) {
  const table = useReactTable({ 
    data, 
    columns, 
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 50,
      },
    },
  });

  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, content: '', x: 0, y: 0 });

  const handleMouseEnter = (e: React.MouseEvent, fila: FilaProcesada) => {
    if (fila.esValida || !fila.errores) return;

    const content =
      `Fila ${fila.numeroDeFila} - Errores:\n` +
      Object.entries(fila.errores)
        .map(([key, value]) => {
          const mappingKey = key as keyof typeof reverseHeaderMapping;
          const displayName =
            reverseHeaderMapping[mappingKey] || key.charAt(0).toUpperCase() + key.slice(1);
          return `• ${displayName}: ${value}`;
        })
        .join('\n');

    const x = e.clientX + 15;
    const y = e.clientY + 15;

    setTooltip({ visible: true, content, x, y });
  };

  const handleMouseLeave = () => setTooltip({ visible: false, content: '', x: 0, y: 0 });

  const showTable = columns.length > 0;

  return (
    <>
      {tooltip.visible && (
        <div
          className="fixed bg-negro text-blanco text-sm rounded-md p-3 shadow-lg z-50 max-w-xs whitespace-pre-line pointer-events-none"
          /* webhint-disable-next-line no-inline-styles */
          style={{ top: tooltip.y, left: tooltip.x }}
        >
          {tooltip.content}
        </div>
      )}
      
      {/* SOLUCIÓN TÉCNICA:
         Usamos 'grid' y 'grid-cols-1' con 'min-w-0'. 
         Esto obliga al contenedor a respetar el ancho del padre (la tarjeta blanca)
         y fuerza a los hijos (la tabla) a hacer scroll si no caben.
      */}
      <div className="grid grid-cols-1 gap-4 w-full min-w-0">
        
        <div className="rounded-lg border border-neutro-200 bg-blanco shadow-sm w-full overflow-hidden">
          {!showTable ? (
            <div className="flex items-center justify-center h-40 p-10 text-neutro-400">
              Aún no se han cargado datos.
            </div>
          ) : (
            // Wrapper de scroll: overflow-x-auto ESENCIAL aquí
            <div 
              className="w-full overflow-x-auto overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-principal-200 scrollbar-track-transparent"
              onMouseLeave={handleMouseLeave}
            >
              <table className="text-left border-collapse w-full">
                <thead className="sticky top-0 z-20 bg-principal-500 shadow-md">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        const headerText = String(header.column.columnDef.header);
                        const isInvalid = invalidHeaders.includes(headerText);
                        return (
                          <th
                            key={header.id}
                            title={isInvalid ? `La columna "${headerText}" no es válida.` : ''}
                            // Mantenemos min-w para legibilidad, pero ahora el scroll funcionará
                            className={`p-4 text-sm font-bold text-blanco tracking-wider uppercase text-center whitespace-nowrap transition-colors min-w-[150px] ${
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
                <tbody className="divide-y divide-neutro-200 bg-blanco">
                  {table.getRowModel().rows.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length} className="text-center p-10 text-neutro-400">
                        No se encontraron registros en esta página.
                      </td>
                    </tr>
                  ) : (
                    table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        onMouseEnter={(e) => handleMouseEnter(e, row.original)}
                        onMouseLeave={handleMouseLeave}
                        className={`transition-colors ${
                          !row.original.esValida 
                            ? 'bg-acento-100/50 cursor-help' 
                            : 'even:bg-neutro-50 hover:bg-principal-50'
                        }`}
                      >
                        {row.getVisibleCells().map((cell) => {
                          const headerText = String(cell.column.columnDef.header);
                          const isInvalidColumn = invalidHeaders.includes(headerText);
                          const cellKey = String(cell.column.columnDef.id).split('.').pop() || '';
                          const hasCellError = row.original.errores && row.original.errores[cellKey];

                          return (
                            <td
                              key={cell.id}
                              className={`p-4 text-neutro-700 text-center whitespace-nowrap transition-colors border-r border-transparent hover:border-neutro-200 ${
                                isInvalidColumn
                                  ? 'bg-acento-200/50'
                                  : hasCellError
                                    ? 'bg-acento-200 font-medium'
                                    : ''
                              }`}
                            >
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
          )}
        </div>

        {/* Controles de Paginación */}
        {showTable && data.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-neutro-50 rounded-lg border border-neutro-200 w-full">
            <div className="text-sm text-neutro-600 text-center sm:text-left">
              Página <span className="font-bold text-principal-700">{table.getState().pagination.pageIndex + 1}</span> de{' '}
              <span className="font-bold text-principal-700">{table.getPageCount()}</span>
              <span className="mx-2 text-neutro-400">|</span>
              Total: <span className="font-bold">{data.length}</span> registros
            </div>

            <div className="flex items-center gap-2 overflow-x-auto max-w-full py-1">
              <button
                aria-label="Ir a primera página"
                className="p-1.5 rounded-md hover:bg-white hover:shadow-sm border border-transparent hover:border-neutro-300 disabled:opacity-30 disabled:hover:shadow-none text-neutro-600 flex-shrink-0"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronsLeft size={18} />
              </button>
              <button
                aria-label="Ir a página anterior"
                className="p-1.5 rounded-md hover:bg-white hover:shadow-sm border border-transparent hover:border-neutro-300 disabled:opacity-30 disabled:hover:shadow-none text-neutro-600 flex-shrink-0"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft size={18} />
              </button>
              
              <label htmlFor="page-input" className="text-sm px-2 flex items-center gap-2 cursor-pointer text-neutro-600 flex-shrink-0">
                Ir a:
                <input
                  id="page-input"
                  type="number"
                  min={1}
                  max={table.getPageCount()}
                  aria-label="Número de página"
                  defaultValue={table.getState().pagination.pageIndex + 1}
                  onChange={e => {
                    const page = e.target.value ? Number(e.target.value) - 1 : 0
                    table.setPageIndex(page)
                  }}
                  className="w-16 p-1 text-center border border-neutro-300 rounded focus:ring-1 focus:ring-principal-500 focus:outline-none bg-white"
                />
              </label>

              <button
                aria-label="Ir a página siguiente"
                className="p-1.5 rounded-md hover:bg-white hover:shadow-sm border border-transparent hover:border-neutro-300 disabled:opacity-30 disabled:hover:shadow-none text-neutro-600 flex-shrink-0"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight size={18} />
              </button>
              <button
                aria-label="Ir a última página"
                className="p-1.5 rounded-md hover:bg-white hover:shadow-sm border border-transparent hover:border-neutro-300 disabled:opacity-30 disabled:hover:shadow-none text-neutro-600 flex-shrink-0"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <ChevronsRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}