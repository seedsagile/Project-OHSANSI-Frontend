import { useMemo } from 'react';
import { useDropzone, type DropzoneRootProps, type DropzoneInputProps } from 'react-dropzone';
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from '@tanstack/react-table';

import type { CompetidorCSV } from '../types/indexInscritos';
import { useImportarCompetidores } from '../hooks/useRegistrarCompetidores';
import { ModalConfirmacion } from '../../responsables/components/ModalConfirmacion'; 
import { UploadCloud, FileText, X, Save } from 'lucide-react';

const DropzoneArea = ({ getRootProps, getInputProps, isDragActive, nombreArchivo, open }: { 
    getRootProps: <T extends DropzoneRootProps>(props?: T) => T; 
    getInputProps: <T extends DropzoneInputProps>(props?: T) => T; 
    isDragActive: boolean; 
    nombreArchivo: string | null;
    open: () => void;
}) => {
    const baseClasses = 'flex-grow border-2 border-dashed rounded-lg flex items-center justify-center p-4 text-neutro-500 transition-colors duration-300 cursor-pointer';
    const activeClasses = 'border-principal-500 bg-principal-50';
    const idleClasses = 'border-neutro-300 hover:border-principal-400';

    return (
        <div className="flex flex-col md:flex-row items-stretch gap-6">
            <button 
                type="button" 
                onClick={open} 
                className="flex items-center justify-center gap-2 font-semibold py-2.5 px-6 rounded-lg bg-principal-500/10 text-principal-600 hover:bg-principal-500/20 transition-colors"
            >
                <UploadCloud size={20} />
                <span>Cargar CSV</span>
            </button>
            <div {...getRootProps({ className: `${baseClasses} ${isDragActive ? activeClasses : idleClasses}` })}>
                <input {...getInputProps()} />
                {nombreArchivo ? (
                    <div className="flex items-center gap-2 text-exito-600">
                        <FileText size={20} />
                        <span className="font-semibold">{nombreArchivo}</span>
                    </div>
                ) : (
                    <p>{isDragActive ? 'Suelta el archivo aquí...' : 'o arrastra un archivo aquí'}</p>
                )}
            </div>
        </div>
    );
};

const TablaResultados = ({ data, columns }: { data: CompetidorCSV[]; columns: ColumnDef<CompetidorCSV>[]; }) => {
    const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

    return (
        <div className="rounded-lg border border-neutro-200 overflow-hidden bg-blanco">
            <div className="overflow-auto max-h-96">
                <table className="w-full text-left min-w-[1000px]">
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
                        {table.getRowModel().rows.length === 0 ? (
                            <tr><td colSpan={columns.length} className="text-center p-10 text-neutro-400">Aún no se han cargado datos.</td></tr>
                        ) : (
                            table.getRowModel().rows.map(row => (
                                <tr key={row.id} className="even:bg-neutro-50 hover:bg-principal-50 transition-colors">
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
    );
};


export function PaginaImportarCompetidores() {
    
    const {
        datos,
        nombreArchivo,
        esArchivoValido,
        isSubmitting,
        modalState,
        onDrop,
        handleSave,
        handleCancel,
        closeModal,
    } = useImportarCompetidores();

    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
        onDrop,
        noClick: true,
        accept: { 'text/csv': ['.csv'] }
    });

    const columns = useMemo<ColumnDef<CompetidorCSV>[]>(() => [
        { accessorKey: 'nombre', header: 'Nombre' },
        { accessorKey: 'ci', header: 'CI' },
        { accessorKey: 'telftutor', header: 'Telf. Tutor' },
        { accessorKey: 'colegio', header: 'Colegio' },
        { accessorKey: 'departamento', header: 'Departamento' },
        { accessorKey: 'area', header: 'Área' },
        { accessorKey: 'nivel', header: 'Nivel' },
        { accessorKey: 'tipodeinscripcion', header: 'Tipo de Inscripción' },
    ], []);

    return (
        <>
            <div className="bg-neutro-100 min-h-screen p-4 md:p-8 font-display flex items-center justify-center">
                <main className="bg-blanco w-full max-w-6xl rounded-xl shadow-sombra-3 p-6 md:p-8">
                    
                    <header className="flex items-center justify-center mb-10">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-negro tracking-tighter">Registrar Competidores</h1>
                    </header>

                    <section className="mb-8">
                        <DropzoneArea
                            getRootProps={getRootProps}
                            getInputProps={getInputProps}
                            isDragActive={isDragActive}
                            nombreArchivo={nombreArchivo}
                            open={open}
                        />
                    </section>

                    <TablaResultados data={datos} columns={columns} />

                    <footer className="flex flex-col sm:flex-row justify-end items-center gap-4 mt-12">
                        {/* --- MEJORA APLICADA AQUÍ --- */}
                        <button 
                            onClick={handleCancel}
                            disabled={datos.length === 0 && !nombreArchivo}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 font-semibold py-2.5 px-6 rounded-lg bg-neutro-200 text-neutro-700 hover:bg-neutro-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <X className="h-5 w-5" />
                            <span>Cancelar</span>
                        </button>
                        
                        <button onClick={handleSave} disabled={!esArchivoValido || isSubmitting} className="w-full sm:w-auto flex items-center justify-center gap-2 font-semibold py-2.5 px-6 rounded-lg bg-principal-500 text-blanco hover:bg-principal-600 transition-colors disabled:bg-principal-300 disabled:cursor-not-allowed min-w-[150px]">
                            {isSubmitting ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blanco"></div>
                            ) : (
                                <>
                                    <Save className="h-5 w-5" />
                                    <span>Guardar</span>
                                </>
                            )}
                        </button>
                    </footer>
                </main>
            </div>

            <ModalConfirmacion
                isOpen={modalState.isOpen}
                onClose={closeModal}
                onConfirm={modalState.onConfirm}
                title={modalState.title}
                type={modalState.type}
                loading={isSubmitting}
            >
                {modalState.message}
            </ModalConfirmacion>
        </>
    );
}