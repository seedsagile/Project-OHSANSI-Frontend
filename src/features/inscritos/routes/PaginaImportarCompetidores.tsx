import { useMemo } from 'react';
import { useDropzone, type DropzoneRootProps, type DropzoneInputProps } from 'react-dropzone';
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from '@tanstack/react-table';
import toast from 'react-hot-toast';

import type { CompetidorCSV } from '../types/indexInscritos';
import { useImportarCompetidores } from '../hooks/useRegistrarCompetidores';
import { IconoUsuario } from '../components/IconoUsuario';

interface BotonProps { onClick: () => void; disabled?: boolean; }
interface DropzoneAreaProps { getRootProps: <T extends DropzoneRootProps>(props?: T) => T; getInputProps: <T extends DropzoneInputProps>(props?: T) => T; isDragActive: boolean; nombreArchivo: string | null; }
interface TablaResultadosProps { data: CompetidorCSV[]; columns: ColumnDef<CompetidorCSV>[]; }
interface AccionesFooterProps { onCancel: () => void; onSave: () => void; esGuardable: boolean; isSubmitting: boolean; }

const BotonCargar = ({ onClick }: BotonProps) => ( <button onClick={onClick} className="flex items-center gap-2 font-semibold py-2.5 px-6 rounded-lg bg-principal-500/10 text-principal-600 hover:bg-principal-500/20 transition-colors"> <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 14 12 9 7 14"/><line x1="12" y1="9" x2="12" y2="21"/></svg> <span>Cargar CSV</span> </button> );
const DropzoneArea = ({ getRootProps, getInputProps, isDragActive, nombreArchivo }: DropzoneAreaProps) => ( <div {...getRootProps({ className: 'flex-grow border-2 border-dashed border-neutro-300 rounded-lg flex items-center justify-center p-4 text-neutro-400' })}> <input {...getInputProps()} /> {isDragActive ? <p className="text-principal-500 font-semibold">Suelta el archivo aquí...</p> : <p>{nombreArchivo || 'o arrastra un archivo aquí'}</p>} </div> );

const TablaResultados = ({ data, columns }: TablaResultadosProps) => {
    const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

    return (
        <div className="rounded-lg border border-neutro-200 overflow-hidden">
            <div className="max-h-96 overflow-y-auto">
                <table className="w-full text-left">
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
                                <tr key={row.id} className="even:bg-neutro-100 hover:bg-principal-100 transition-colors">
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

const AccionesFooter = ({ onCancel, onSave, esGuardable, isSubmitting }: AccionesFooterProps) => ( <footer className="flex justify-end items-center gap-4 mt-12"> <button onClick={onCancel} className="flex items-center gap-2 font-semibold py-2.5 px-6 rounded-lg bg-neutro-200 text-neutro-700 hover:bg-neutro-300 transition-colors"> <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> <span>Cancelar</span> </button> <button onClick={onSave} disabled={!esGuardable || isSubmitting} className="flex items-center justify-center gap-2 font-semibold py-2.5 px-6 rounded-lg bg-principal-500 text-blanco hover:bg-principal-600 transition-colors disabled:bg-principal-300 disabled:cursor-not-allowed min-w-[150px]"> {isSubmitting ? ( <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blanco"></div> ) : ( <> <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> <span>Guardar</span> </> )} </button> </footer> );

export function PaginaImportarCompetidores() {
    
    const {
        datos,
        nombreArchivo,
        esArchivoValido,
        isSubmitting,
        onDrop,
        handleSave,
        handleCancel,
    } = useImportarCompetidores({
        onSuccess: (msg) => toast.success(msg),
        onError: (msg) => toast.error(msg, { duration: 5000 }),
    });

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
        <div className="bg-neutro-100 min-h-screen flex items-center justify-center p-4 font-display">
            <main className="bg-blanco w-full max-w-6xl rounded-xl shadow-sombra-3 p-8">
                <header className="flex justify-between items-center mb-10">
                    <div className="w-8"></div>
                    <h1 className="text-4xl font-extrabold text-negro tracking-tighter">Registrar Competidores</h1>
                    <div className="text-neutro-500"><IconoUsuario /></div>
                </header>

                <section className="flex items-center gap-6 mb-8">
                    <BotonCargar onClick={open} />
                    
                    <DropzoneArea
                        getRootProps={getRootProps}
                        getInputProps={getInputProps}
                        isDragActive={isDragActive}
                        nombreArchivo={nombreArchivo}
                    />
                </section>

                <TablaResultados data={datos} columns={columns} />

                <AccionesFooter 
                    onCancel={handleCancel}
                    onSave={handleSave}
                    esGuardable={esArchivoValido}
                    isSubmitting={isSubmitting}
                />
            </main>
        </div>
    );
}