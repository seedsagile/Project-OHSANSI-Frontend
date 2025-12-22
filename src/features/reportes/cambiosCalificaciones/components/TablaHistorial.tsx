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
  LoaderCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  AlertCircle,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Minus,
  GraduationCap,
  School,
  User
} from 'lucide-react';
import type { HistorialCambio, TipoAccion } from '../types';

const ActionBadge = ({ accion }: { accion: TipoAccion }) => {
  const config = {
    Calificar: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Modificar: 'bg-blue-100 text-blue-800 border-blue-200',
    Desclasificar: 'bg-rose-100 text-rose-800 border-rose-200',
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

interface TablaHistorialProps {
  data: HistorialCambio[];
  isLoading: boolean;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  rowCount: number;
}

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
        accessorKey: 'index',
        header: 'Nº',
        cell: (info) => {
          const { pageIndex, pageSize } = pagination;
          return (
            <span className="text-neutro-500 font-mono text-xs">
              {(pageIndex * pageSize + info.row.index + 1).toString().padStart(2, '0')}
            </span>
          );
        },
        size: 60,
      },
      {
        accessorKey: 'fecha_hora',
        header: 'FECHA',
        cell: (info) => {
          const dateStr = info.getValue() as string;
          if (!dateStr) return '-';
          const date = new Date(dateStr);
          return (
            <div className="flex flex-col items-center">
              <span className="font-bold text-neutro-700 text-sm">
                {date.toLocaleDateString('es-BO', { day: '2-digit', month: 'short' })}
              </span>
              <span className="text-xs text-neutro-400 font-mono">
                {date.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        },
        size: 100,
      },
      {
        header: 'OLIMPISTA',
        accessorKey: 'nombre_olimpista',
        cell: ({ row }) => (
          <div className="flex items-center gap-2 min-w-[200px]">
            <div className="p-1.5 rounded-full bg-principal-50 text-principal-600">
               <User size={14} />
            </div>
            <span className="font-bold text-neutro-800 text-sm" title={row.original.nombre_olimpista}>
              {row.original.nombre_olimpista}
            </span>
          </div>
        ),
      },
      {
        header: 'INSTITUCIÓN',
        accessorKey: 'institucion',
        cell: ({ row }) => (
          <div className="flex items-center gap-2 min-w-[180px]">
            <School size={14} className="text-neutro-400" />
            <span className="text-sm font-semibold text-neutro-600 uppercase tracking-tight truncate" title={row.original.institucion}>
               {row.original.institucion}
            </span>
          </div>
        ),
      },
      {
        header: 'GRADO',
        accessorKey: 'grado_escolaridad',
        cell: ({ row }) => (
          <div className="flex items-center justify-center gap-1.5 min-w-[140px]">
             <GraduationCap size={14} className="text-neutro-400" />
             <span className="text-sm text-neutro-600" title={row.original.grado_escolaridad}>
                {row.original.grado_escolaridad}
             </span>
          </div>
        ),
      },
      {
        header: 'ÁREA/NIVEL',
        accessorKey: 'area',
        cell: ({ row }) => (
          <div className="flex flex-col items-center min-w-[120px]">
             <span className="text-xs font-bold text-principal-700 uppercase tracking-wide bg-principal-50 px-2 py-0.5 rounded border border-principal-100 whitespace-nowrap">
                {row.original.area}
             </span>
             <span className="text-[10px] text-neutro-500 mt-1" title={row.original.nivel}>
                {row.original.nivel}
             </span>
          </div>
        ),
      },
      {
        accessorKey: 'accion',
        header: 'ACCIÓN',
        cell: (info) => <ActionBadge accion={info.getValue() as TipoAccion} />,
        size: 110,
      },
      {
        header: 'IMPACTO EN NOTA',
        id: 'impacto',
        cell: ({ row }) => {
          const { nota_anterior, nota_nueva, diferencia } = row.original;
          
          let diffColor = 'text-neutro-400';
          let bgDiff = 'bg-neutro-100';
          let Icon = Minus;

          if (diferencia > 0) {
            diffColor = 'text-emerald-600';
            bgDiff = 'bg-emerald-50';
            Icon = TrendingUp;
          } else if (diferencia < 0) {
            diffColor = 'text-rose-600';
            bgDiff = 'bg-rose-50';
            Icon = TrendingDown;
          }

          return (
            <div className="flex items-center justify-center gap-2 min-w-[160px]">
               <div className="flex flex-col items-center w-8">
                  <span className="text-[9px] text-neutro-400 uppercase">Ant</span>
                  <span className="text-xs font-mono text-neutro-500 line-through decoration-rose-300">
                    {nota_anterior}
                  </span>
               </div>

               <ArrowRight size={12} className="text-neutro-300" />

               <div className="flex flex-col items-center w-8">
                  <span className="text-[9px] text-neutro-400 uppercase">New</span>
                  <span className="text-sm font-bold font-mono text-neutro-800">
                    {nota_nueva}
                  </span>
               </div>

               <div className={`ml-1 flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold border border-transparent ${bgDiff} ${diffColor}`}>
                  <Icon size={10} />
                  <span>{diferencia > 0 ? '+' : ''}{diferencia}</span>
               </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'nombre_evaluador',
        header: 'EVALUADOR',
        cell: (info) => (
          <div className="flex flex-col items-center min-w-[150px]">
            <span className="text-xs font-medium text-neutro-600">
              {info.getValue() as string}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'descripcion', 
        header: 'DETALLE',
        cell: ({ row }) => {
          const obs = row.original.observacion;
          const desc = row.original.descripcion;
          
          return (
            <div className="relative text-left min-w-[350px]">
               <p className="text-xs text-neutro-600 font-medium leading-relaxed">
                 {desc}
               </p>
               {obs && (
                 <p className="text-[11px] text-neutro-400 italic mt-1 border-l-2 border-neutro-200 pl-2">
                   Obs: {obs}
                 </p>
               )}
            </div>
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
      <div className="grid grid-cols-1 gap-4 w-full min-w-0 animate-pulse">
        <div className="rounded-lg border border-neutro-200 bg-white p-20 flex flex-col items-center justify-center h-[400px]">
          <LoaderCircle className="animate-spin h-10 w-10 text-principal-500 mb-4" />
          <p className="font-medium text-neutro-500">
            Auditando historial...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 w-full min-w-0 animate-fade-in">
      
      <div className="rounded-lg border border-neutro-200 bg-blanco shadow-sm w-full overflow-hidden">
        {data.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-64 p-10 text-neutro-400">
              <div className="bg-neutro-50 p-4 rounded-full mb-3">
                <AlertCircle size={32} className="text-neutro-400" />
              </div>
              <p>No se encontraron registros de auditoría.</p>
           </div>
        ) : (
          <div className="w-full overflow-x-auto overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-principal-200 scrollbar-track-transparent">
            <table className="text-left border-collapse w-full">
              <thead className="sticky top-0 z-20 bg-principal-500 shadow-md">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="p-4 text-sm font-bold text-blanco tracking-wider uppercase text-center whitespace-nowrap transition-colors bg-principal-500"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>

              <tbody className="divide-y divide-neutro-200 bg-blanco">
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="transition-colors even:bg-neutro-50 hover:bg-principal-50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="p-4 text-neutro-700 text-center whitespace-nowrap transition-colors border-r border-transparent hover:border-neutro-200 align-middle"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {data.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-neutro-50 rounded-lg border border-neutro-200 w-full shadow-sm">
          <div className="text-sm text-neutro-600 text-center sm:text-left flex flex-col sm:flex-row gap-1 sm:gap-0">
             <span>
               Página <span className="font-bold text-principal-700">{table.getState().pagination.pageIndex + 1}</span> de{' '}
               <span className="font-bold text-principal-700">{table.getPageCount()}</span>
             </span>
             <span className="hidden sm:inline mx-2 text-neutro-400">|</span>
             <span>
               Total: <span className="font-bold">{rowCount}</span> registros
             </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto max-w-full py-1">
            <button
              aria-label="Ir a primera página"
              className="p-1.5 rounded-md hover:bg-white hover:shadow-sm border border-transparent hover:border-neutro-300 disabled:opacity-30 disabled:hover:shadow-none text-neutro-600 flex-shrink-0 transition-all"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft size={18} />
            </button>
            <button
              aria-label="Ir a página anterior"
              className="p-1.5 rounded-md hover:bg-white hover:shadow-sm border border-transparent hover:border-neutro-300 disabled:opacity-30 disabled:hover:shadow-none text-neutro-600 flex-shrink-0 transition-all"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft size={18} />
            </button>
            
            <label htmlFor="page-input-historial" className="text-sm px-2 flex items-center gap-2 cursor-pointer text-neutro-600 flex-shrink-0 select-none">
              Ir a:
              <input
                id="page-input-historial"
                type="number"
                min={1}
                max={table.getPageCount()}
                value={table.getState().pagination.pageIndex + 1}
                onChange={e => {
                  const page = e.target.value ? Number(e.target.value) - 1 : 0;
                  if (page >= 0 && page < table.getPageCount()) {
                    table.setPageIndex(page);
                  }
                }}
                className="w-16 p-1 text-center border border-neutro-300 rounded focus:ring-2 focus:ring-principal-500 focus:outline-none bg-white font-semibold text-principal-700 transition-shadow"
              />
            </label>

            <button
              aria-label="Ir a página siguiente"
              className="p-1.5 rounded-md hover:bg-white hover:shadow-sm border border-transparent hover:border-neutro-300 disabled:opacity-30 disabled:hover:shadow-none text-neutro-600 flex-shrink-0 transition-all"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight size={18} />
            </button>
            <button
              aria-label="Ir a última página"
              className="p-1.5 rounded-md hover:bg-white hover:shadow-sm border border-transparent hover:border-neutro-300 disabled:opacity-30 disabled:hover:shadow-none text-neutro-600 flex-shrink-0 transition-all"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight size={18} />
            </button>
            
            <div className="ml-2 pl-2 border-l border-neutro-300">
              <select
                value={table.getState().pagination.pageSize}
                onChange={e => {
                  table.setPageSize(Number(e.target.value));
                }}
                className="p-1 text-sm border-none bg-transparent focus:ring-0 text-neutro-600 font-medium cursor-pointer hover:text-principal-700"
                aria-label="Registros por página"
              >
                {[10, 20, 50, 100].map(pageSize => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize} / pág
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};