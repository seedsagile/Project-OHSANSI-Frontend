import { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table';
import { Plus, ArrowLeft } from 'lucide-react';
import { ModalCrearExamen } from '../components/ModalCrearExamen';
import { ModalConfirmacion } from '../../competencias/components/ModalConfirmacion';
import { useGestionExamenes } from '../hooks/useGestionExamens';
import type { ExamenTabla } from '../types';

export function PaginaExamenes() {
  const {
    examenes,
    isLoadingExamenes,
    isCreating,
    modalCrearAbierto,
    confirmationModal,
    idCompetencia,
    abrirModalCrear,
    cerrarModalCrear,
    cerrarModalConfirmacion,
    handleGuardarExamen,
  } = useGestionExamenes();

  const columns = useMemo<ColumnDef<ExamenTabla>[]>(
    () => [
      {
        accessorKey: 'nro',
        header: 'NRO',
        cell: (info) => (
          <span className="font-medium text-gray-700">
            {info.getValue() as number}
          </span>
        ),
      },
      {
        accessorKey: 'nombre',
        header: 'NOMBRE DEL EXAMEN',
        cell: (info) => (
          <span className="font-medium text-gray-800">
            {info.getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: 'ponderacion',
        header: 'PONDERACIÓN (%)',
        cell: (info) => (
          <span className="text-gray-700">{info.getValue() as number}%</span>
        ),
      },
      {
        accessorKey: 'maxima_nota',
        header: 'NOTA MÁXIMA',
        cell: (info) => (
          <span className="text-gray-700">{info.getValue() as number}</span>
        ),
      },
    ],
    []
  );
  const filasTabla = useMemo(() => {
    if (!examenes || examenes.length === 0) {
      return [];
    }

    return examenes.map((examen, index) => ({
      nro: index + 1,
      nombre: examen.nombre,
      ponderacion: examen.ponderacion,
      maxima_nota: examen.maxima_nota,
    }));
  }, [examenes]);

  const table = useReactTable({
    data: filasTabla,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="min-h-screen p-4 sm:p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-5xl">
        {/* Encabezado con botón de regreso */}
        <div className="mb-6">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver a Competencias
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                Registrar Exámenes
              </h1>
              {idCompetencia && (
                <p className="text-sm text-gray-600 mt-1">
                  Competencia ID: <span className="font-semibold">{idCompetencia}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Alerta si no hay ID de competencia */}
        {!idCompetencia && (
          <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-yellow-600 text-2xl">⚠️</span>
              <div>
                <h3 className="font-semibold text-yellow-800">
                  No se encontró una competencia activa
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Por favor, crea primero una competencia antes de registrar exámenes.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tabla de exámenes */}
        <div className="mb-4 overflow-hidden rounded-lg shadow-md border border-gray-200">
          <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
            <table className="w-full">
              <thead className="sticky top-0 bg-blue-500 text-white z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="text-left py-3 px-4 font-semibold text-sm uppercase tracking-wide"
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {isLoadingExamenes ? (
                  <tr>
                    <td colSpan={columns.length} className="text-center py-10">
                      <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                        <span className="text-gray-500 font-medium">
                          Cargando exámenes...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : filasTabla.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="text-center py-10">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-gray-400 text-lg">📝</span>
                        <span className="text-gray-500 font-medium">
                          No hay exámenes registrados
                        </span>
                        <span className="text-gray-400 text-sm">
                          Crea tu primer examen para esta competencia
                        </span>
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
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
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
                Mostrando{' '}
                <span className="font-semibold">{filasTabla.length}</span>{' '}
                examen{filasTabla.length !== 1 ? 'es' : ''}
              </span>
            )}
          </div>

          <button
            onClick={abrirModalCrear}
            disabled={isLoadingExamenes || !idCompetencia}
            className="inline-flex items-center gap-2 px-6 py-2.5 font-semibold rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base shadow-md hover:shadow-lg transform hover:scale-105"
            title={
              !idCompetencia
                ? 'Primero debes crear una competencia'
                : 'Crear nuevo examen'
            }
          >
            <Plus className="w-5 h-5" />
            Nuevo Examen
          </button>
        </div>
      </div>

      <ModalCrearExamen
        isOpen={modalCrearAbierto}
        onClose={cerrarModalCrear}
        onGuardar={handleGuardarExamen}
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