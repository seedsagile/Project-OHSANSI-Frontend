// src/features/competencias/routes/PaginaCompetencias.tsx
import { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { ModalCrearCompetencia } from '../components/ModalCrearCompetencia';
import { ModalConfirmacion } from '../components/ModalConfirmacion';
import { useGestionCompetencias } from '../hooks/useGestionCompetencias';

type CompetenciaTabla = {
  id: number;
  area: string;
};

export function PaginaCompetencias() {
  const {
    areasConNiveles,
    isLoadingAreas,
    isCreating,
    modalCrearAbierto,
    confirmationModal,
    abrirModalCrear,
    cerrarModalCrear,
    cerrarModalConfirmacion,
    handleGuardarCompetencia,
  } = useGestionCompetencias();

  const columns = useMemo<ColumnDef<CompetenciaTabla>[]>(
    () => [
      {
        id: 'nro',
        header: 'NRO',
        cell: (info) => info.row.original.id || '',
      },
      {
        accessorKey: 'area',
        header: 'ÁREA',
      },
    ],
    []
  );

  // Tabla vacía por ahora con 5 filas
  const filasVacias = useMemo(() => {
    return Array(5).fill({
      id: 0,
      area: '',
    });
  }, []);

  const table = useReactTable({
    data: filasVacias,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="min-h-screen p-4 sm:p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-3xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-6 sm:mb-8">
          Registrar Competencia
        </h1>

        {/* Tabla de competencias (vacía por ahora) */}
        <div className="mb-4 overflow-hidden rounded-lg shadow-md">
          <div className="overflow-y-auto" style={{ maxHeight: '384px' }}>
            <table className="w-full">
              <thead className="sticky top-0 bg-blue-500 text-white z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} className="text-left py-3 px-4 font-semibold">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {isLoadingAreas ? (
                  <tr>
                    <td colSpan={columns.length} className="text-center py-10 text-gray-400">
                      Cargando...
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row, index) => (
                    <tr
                      key={row.id}
                      className={index % 2 === 0 ? 'bg-gray-50' : 'bg-gray-100'}
                      style={{ height: '64px' }}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="py-3 px-4">
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

        {/* Botón Nueva Competencia */}
        <div className="flex justify-end">
          <button
            onClick={abrirModalCrear}
            disabled={isLoadingAreas}
            className="inline-flex items-center gap-2 px-6 py-2 font-semibold rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base shadow-md hover:shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Nueva Competencia
          </button>
        </div>
      </div>

      <ModalCrearCompetencia
        isOpen={modalCrearAbierto}
        onClose={cerrarModalCrear}
        onGuardar={handleGuardarCompetencia}
        areasConNiveles={areasConNiveles}
        loading={isCreating}
      />

      <ModalConfirmacion
        isOpen={confirmationModal.isOpen}
        onClose={cerrarModalConfirmacion}
        title={confirmationModal.title}
        type={confirmationModal.type}
        loading={isCreating}
      >
        {confirmationModal.message}
      </ModalConfirmacion>
    </div>
  );
}