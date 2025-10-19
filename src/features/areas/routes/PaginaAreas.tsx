//src/features/routes/PaginaAreas.tsx
import { useMemo } from 'react';
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from '@tanstack/react-table';
import { IconoPlus } from '../components/IconoPlus';
import { ModalCrearArea } from '../components/ModalCrearAreas';
import { ModalConfirmacion } from '../components/ModalConfirmacion';
import { useGestionAreas } from '../hooks/useGestionAreas';
import type { Area } from '../types';

export function PaginaAreas() {
  const {
    areas,
    isLoading,
    isCreating,
    modalCrearAbierto,
    confirmationModal,
    areaSeleccionada,
    setAreaSeleccionada,
    abrirModalCrear,
    cerrarModalCrear,
    cerrarModalConfirmacion,
    handleGuardarArea,
  } = useGestionAreas();

    const columns = useMemo<ColumnDef<Area>[]>(() => [
        { 
            id: 'nro', 
            header: 'NRO', 
            cell: info => info.row.original.id_area || ''
        },
        { 
            accessorKey: 'nombre', 
            header: 'ÁREA' 
        },
    ], []);

    // Rellenar con filas vacías hasta tener mínimo 5
    const filasParaMostrar = useMemo(() => {
        const resultado = [...areas];
        while (resultado.length < 5) {
            resultado.push({
                id_area: 0,
                nombre: '',
                activo: 0,
                created_at: '',
                update_ad: '',
            } as Area);
        }
        return resultado;
    }, [areas]);

    const table = useReactTable({ 
        data: filasParaMostrar, 
        columns, 
        getCoreRowModel: getCoreRowModel() 
    });

    return (
        <div className="min-h-screen p-4 sm:p-6 flex flex-col items-center justify-center">
            <div className="w-full max-w-3xl">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-6 sm:mb-8">
                    Registrar Área 
                </h1>

                {/* Tabla de áreas */}
                <div className="mb-4 overflow-hidden rounded-lg shadow-md">
                    <div className="overflow-y-auto" style={{ maxHeight: '384px' }}>
                        <table className="w-full">
                            <thead className="sticky top-0 bg-blue-500 text-white z-10">
                                {table.getHeaderGroups().map(headerGroup => (
                                    <tr key={headerGroup.id}>
                                        {headerGroup.headers.map(header => (
                                            <th 
                                                key={header.id} 
                                                className="text-left py-3 px-4 font-semibold"
                                            >
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={columns.length} className="text-center py-10 text-gray-400">
                                            Cargando...
                                        </td>
                                    </tr>
                                ) : (
                                    table.getRowModel().rows.map((row, index) => (
                                        <tr 
                                            key={row.id} 
                                            onClick={() => row.original.id_area ? setAreaSeleccionada(row.original) : null}
                                            className={`${
                                                index % 2 === 0 ? 'bg-gray-50' : 'bg-neutro-200'
                                            } ${
                                                row.original.nombre ? 'hover:bg-blue-50 transition-colors cursor-pointer' : ''
                                            } ${
                                                areaSeleccionada?.id_area === row.original.id_area && row.original.id_area
                                                    ? 'bg-blue-100'
                                                    : ''
                                            }`}
                                            style={{ height: '64px' }}
                                        >
                                            {row.getVisibleCells().map(cell => (
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

                {/* Botón Nueva Área */}
                <div className="flex justify-end">
                    <button 
                        onClick={abrirModalCrear} 
                        disabled={isLoading} 
                        className="inline-flex items-center gap-2 px-6 py-2 font-semibold rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                        <IconoPlus />
                        Nueva Área
                    </button>
                </div>
            </div>

            <ModalCrearArea 
                isOpen={modalCrearAbierto} 
                onClose={cerrarModalCrear} 
                onGuardar={handleGuardarArea} 
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
