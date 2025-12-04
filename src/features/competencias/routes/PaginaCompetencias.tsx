
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

type AreaNivelTabla = {
  nro: number;
  area: string;
  nivel: string;
  id_area_nivel: number;
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

  const columns = useMemo<ColumnDef<AreaNivelTabla>[]>(
    () => [
      {
        accessorKey: 'nro',
        header: 'NRO',
        cell: (info) => (
          <span className="font-medium text-gray-700">{info.getValue() as number}</span>
        ),
      },
      {
        accessorKey: 'area',
        header: 'ÁREA',
        cell: (info) => (
          <span className="font-medium text-gray-800">{info.getValue() as string}</span>
        ),
      },
      {
        accessorKey: 'nivel',
        header: 'NIVEL',
        cell: (info) => (
          <span className="text-gray-700">{info.getValue() as string}</span>
        ),
      },
    ],
    []
  );

  const filasTabla = useMemo(() => {
    if (!areasConNiveles || areasConNiveles.length === 0) {
      return [];
    }

    const filas: AreaNivelTabla[] = [];
    let contador = 1;

    areasConNiveles.forEach((area) => {
      area.niveles?.forEach((nivel) => {
        filas.push({
          nro: contador++,
          area: area.area,
          nivel: nivel.nombre,
          id_area_nivel: nivel.id_area_nivel,
        });
      });
    });

    return filas;
  }, [areasConNiveles]);

  const table = useReactTable({
    data: filasTabla,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="min-h-screen p-4 sm:p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-6 sm:mb-8">
          Registrar Competencia
        </h1>

        {/* Tabla de áreas y niveles del responsable */}
        <div className="mb-4 overflow-hidden rounded-lg shadow-md border border-gray-200">
          <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
            <table className="w-full">
              <thead className="sticky top-0 bg-blue-500 text-white z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} className="text-left py-3 px-4 font-semibold text-sm uppercase tracking-wide">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {isLoadingAreas ? (
                  <tr>
                    <td colSpan={columns.length} className="text-center py-10">
                      <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                        <span className="text-gray-500 font-medium">Cargando áreas y niveles...</span>
                      </div>
                    </td>
                  </tr>
                ) : filasTabla.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="text-center py-10">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-gray-400 text-lg">📋</span>
                        <span className="text-gray-500 font-medium">No hay áreas asignadas</span>
                        <span className="text-gray-400 text-sm">Contacta al administrador para asignar áreas</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row, index) => (
                    <tr
                      key={row.id}
                      className={`${
                        index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                      } hover:bg-blue-50 transition-colors`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="py-3 px-4 text-sm">
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

        {/* Información y botón */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-600">
            {filasTabla.length > 0 && (
              <span>
                Mostrando <span className="font-semibold">{filasTabla.length}</span> área{filasTabla.length !== 1 ? 's' : ''} y nivel{filasTabla.length !== 1 ? 'es' : ''}
              </span>
            )}
          </div>
          
          <button
            onClick={abrirModalCrear}
            disabled={isLoadingAreas || filasTabla.length === 0}
            className="inline-flex items-center gap-2 px-6 py-2.5 font-semibold rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base shadow-md hover:shadow-lg transform hover:scale-105"
            title={filasTabla.length === 0 ? 'No hay áreas disponibles para crear competencias' : 'Crear nueva competencia'}
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