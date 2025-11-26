import { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type PaginationState,
  type OnChangeFn,
} from '@tanstack/react-table';
import {
  AlertCircle,
  LoaderCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import type { HistorialCambio, TipoAccion } from '../types';

interface TablaHistorialProps {
  data: HistorialCambio[];
  isLoading: boolean;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  rowCount: number;
}

const ActionBadge = ({ accion }: { accion: TipoAccion }) => {
  const config = {
    Calificar: 'bg-green-100 text-green-800 border-green-200',
    Modificar: 'bg-blue-100 text-blue-800 border-blue-200',
    Desclasificar: 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wide shadow-sm ${
        config[accion] || 'bg-gray-100 text-gray-800 border-gray-200'
      }`}
    >
      {accion}
    </span>
  );
};

export const TablaHistorial = ({ 
  data, 
  isLoading, 
  pagination, 
  onPaginationChange, 
  rowCount 
}: TablaHistorialProps) => {
  
  const columns = useMemo<ColumnDef<HistorialCambio>[]>(
    () => [
      {
        header: 'Nº',
        id: 'index',
        cell: (info) => {
          const { pageIndex, pageSize } = pagination;
          return (
            <span className="text-neutro-600 font-bold text-sm">
              {pageIndex * pageSize + info.row.index + 1}
            </span>
          );
        },
        size: 60,
      },
      {
        accessorKey: 'fecha_hora',
        header: 'FECHA Y HORA',
        cell: (info) => {
          const dateStr = info.getValue() as string;
          const fecha = new Date(dateStr).toLocaleDateString('es-BO', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          });
          const hora = new Date(dateStr).toLocaleTimeString('es-BO', {
            hour: '2-digit',
            minute: '2-digit',
          });
          return (
            <div className="flex flex-col items-center">
              <span className="font-semibold text-neutro-800 text-sm">
                {fecha}
              </span>
              <span className="text-xs text-neutro-500 font-mono">{hora}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'nombre_evaluador',
        header: 'EVALUADOR',
        cell: (info) => (
          <span className="font-medium text-neutro-700 text-sm whitespace-nowrap">
            {info.getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: 'nombre_olimpista',
        header: 'OLIMPISTA',
        cell: (info) => (
          <span className="font-medium text-neutro-700 text-sm whitespace-nowrap">
            {info.getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: 'area',
        header: 'ÁREA',
        cell: (info) => <span className="text-sm text-neutro-700">{info.getValue() as string}</span>,
      },
      {
        accessorKey: 'nivel',
        header: 'NIVEL',
        cell: (info) => (
          <span className="text-xs font-semibold bg-neutro-100 px-2 py-1 rounded text-neutro-600 border border-neutro-200 whitespace-nowrap">
            {info.getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: 'accion',
        header: 'ACCIÓN',
        cell: (info) => <ActionBadge accion={info.getValue() as TipoAccion} />,
      },
      {
        accessorKey: 'descripcion',
        header: 'DETALLE',
        cell: (info) => (
          <div
            className="max-w-xs text-sm text-neutro-600 leading-snug text-left mx-auto line-clamp-2 hover:line-clamp-none transition-all cursor-help"
            title={info.getValue() as string}
          >
            {info.getValue() as string}
          </div>
        ),
      },
      {
        accessorKey: 'observacion',
        header: 'OBSERVACIÓN',
        cell: (info) => {
          const obs = info.getValue() as string | null;
          return obs ? (
            <span 
              className="text-xs text-neutro-600 truncate block max-w-[150px] mx-auto cursor-help" 
              title={obs}
            >
              {obs}
            </span>
          ) : (
            <span className="text-neutro-300 text-xs italic">-</span>
          );
        },
      },
    ],
    [pagination]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    rowCount: rowCount,
    state: { pagination },
    onPaginationChange,
  });

  if (isLoading) {
    return (
      <div className="rounded-xl border border-neutro-200 bg-blanco p-12 flex flex-col items-center justify-center min-h-[400px]">
        <LoaderCircle className="animate-spin h-10 w-10 text-principal-500 mb-4" />
        <p className="font-medium text-neutro-500 animate-pulse">
          Cargando historial de calificaciones...
        </p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 bg-blanco rounded-xl border-2 border-dashed border-neutro-200 text-neutro-500 min-h-[400px]">
        <div className="bg-neutro-50 p-4 rounded-full mb-4">
          <AlertCircle size={40} className="text-neutro-400" />
        </div>
        <h3 className="text-lg font-bold text-neutro-700 mb-2">No se encontraron resultados</h3>
        <p className="text-sm text-center max-w-md leading-relaxed">
          No hay registros de cambios que coincidan con los filtros seleccionados.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <div className="rounded-xl border border-neutro-200 bg-blanco overflow-hidden shadow-sm">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-neutro-300 scrollbar-track-neutro-100">
          <table className="w-full text-left table-auto border-collapse">
            <thead className="sticky top-0 z-10 bg-principal-500 text-white shadow-md">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="p-4 text-xs font-bold tracking-wider uppercase text-center whitespace-nowrap"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="transition-colors even:bg-neutro-100 odd:bg-white hover:bg-principal-50 group"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="p-4 text-center align-middle border-none"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-2 py-2">
        <div className="flex items-center gap-4 text-sm text-neutro-600 bg-white px-4 py-2 rounded-lg border border-neutro-200 shadow-sm">
          <span className="font-medium">
            Página <span className="text-negro font-bold">{table.getState().pagination.pageIndex + 1}</span> de{' '}
            <span className="text-negro font-bold">{table.getPageCount()}</span>
          </span>
          <div className="h-4 w-px bg-neutro-300 mx-1" aria-hidden="true" />
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="border-none bg-transparent p-0 text-sm font-medium text-principal-600 focus:ring-0 cursor-pointer hover:text-principal-700"
            aria-label="Filas por página"
          >
            {[10, 20, 30, 50, 100].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Mostrar {pageSize}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-neutro-200 shadow-sm">
          <button
            className="p-2 rounded hover:bg-neutro-100 disabled:opacity-30 disabled:cursor-not-allowed text-neutro-600 transition-colors"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            title="Primera página"
            aria-label="Ir a la primera página"
          >
            <ChevronsLeft size={18} />
          </button>
          <button
            className="p-2 rounded hover:bg-neutro-100 disabled:opacity-30 disabled:cursor-not-allowed text-neutro-600 transition-colors"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            title="Página anterior"
            aria-label="Ir a la página anterior"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="mx-3 text-xs font-bold text-principal-700 bg-principal-50 px-3 py-1 rounded-md border border-principal-100">
            {rowCount} Registros
          </div>

          <button
            className="p-2 rounded hover:bg-neutro-100 disabled:opacity-30 disabled:cursor-not-allowed text-neutro-600 transition-colors"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            title="Página siguiente"
            aria-label="Ir a la página siguiente"
          >
            <ChevronRight size={18} />
          </button>
          <button
            className="p-2 rounded hover:bg-neutro-100 disabled:opacity-30 disabled:cursor-not-allowed text-neutro-600 transition-colors"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            title="Última página"
            aria-label="Ir a la última página"
          >
            <ChevronsRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};