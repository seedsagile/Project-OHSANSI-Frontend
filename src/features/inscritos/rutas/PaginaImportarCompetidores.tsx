import { useState, useMemo, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import type { ParseResult } from 'papaparse';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table';
import { IconoUsuario } from '../componentes/IconoUsuario';
import type { Competidor } from '../tipos';

// Esta función "limpia" los encabezados del CSV.
// Por ejemplo: " Nombre Completo " -> "nombrecompleto"
const normalizarEncabezado = (header: string) => {
  return header.trim().toLowerCase().replace(/\s+/g, '');
};

export function PaginaImportarCompetidores() {
  const [data, setData] = useState<Competidor[]>([]);
  const [nombreArchivo, setNombreArchivo] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setNombreArchivo(file.name);

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        // ¡LA SOLUCIÓN! Usamos la función para normalizar los encabezados.
        transformHeader: header => normalizarEncabezado(header),
        complete: (results: ParseResult<Competidor>) => {
          console.log("Datos parseados (después de normalizar encabezados):", results.data);
          setData(results.data);
        },
        error: (error: Error) => {
          console.error("Error al parsear el archivo:", error);
        }
      });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    noClick: true,
    accept: { 'text/csv': ['.csv'] }
  });

  const columns = useMemo<ColumnDef<Competidor>[]>(
    () => [
      // Aseguramos que los accessorKey coincidan con los encabezados normalizados
      { accessorKey: 'nombre', header: 'Nombre' },
      { accessorKey: 'ci', header: 'CI' },
      { accessorKey: 'telftutor', header: 'Telf. Tutor' }, // 'telf. tutor' -> 'telftutor'
      { accessorKey: 'colegio', header: 'Colegio' },
      { accessorKey: 'departamento', header: 'Departamento' },
      { accessorKey: 'grado', header: 'Grado' },
      { accessorKey: 'nivel', header: 'Nivel' },
      { accessorKey: 'area', header: 'Área' }, // 'área' -> 'area'
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="bg-neutro-100 min-h-screen flex items-center justify-center p-4 font-display">
      <main className="bg-blanco w-full max-w-6xl rounded-xl shadow-sombra-3 p-8">
        
        <header className="flex justify-between items-center mb-10">
          <div className="w-8"></div>
          <h1 className="text-4xl font-extrabold text-negro tracking-tighter">
            Registrar Competidores
          </h1>
          <div className="text-neutro-500">
            <IconoUsuario />
          </div>
        </header>

        <section className="flex items-center gap-6 mb-8">
          <button 
            onClick={open}
            className="bg-principal-500 text-blanco font-semibold py-2 px-5 rounded-md hover:bg-principal-600 transition-all duration-base shadow-sombra-2 hover:shadow-sombra-3 hover:-translate-y-px"
          >
            Cargar CSV
          </button>
          <div {...getRootProps({ className: 'flex-grow border-2 border-dashed border-neutro-300 rounded-lg flex items-center justify-center p-4 text-neutro-400' })}>
            <input {...getInputProps()} />
            {isDragActive ? (
              <p className="text-principal-500 font-semibold">Suelta el archivo aquí...</p>
            ) : (
              <p>{nombreArchivo || 'o soltar archivo aquí'}</p>
            )}
          </div>
        </section>

        <div className="rounded-lg border border-neutro-200 overflow-hidden">
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-left">
              <thead className="bg-principal-500 sticky top-0 z-10">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th
                        key={header.id}
                        className="p-4 text-sm font-bold text-blanco tracking-wider uppercase text-center"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-neutro-200">
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="text-center p-10 text-neutro-400">
                      Aún no se han cargado datos.
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map(row => (
                    <tr key={row.id} className="even:bg-neutro-100 hover:bg-principal-100 transition-colors">
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="p-4 text-neutro-500">
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

        <footer className="flex justify-end items-center gap-4 mt-12">
            <button className="font-semibold py-2.5 px-6 rounded-lg bg-neutro-200 text-neutro-700 hover:bg-neutro-300 transition-colors">
              Volver
            </button>
            <button className="font-semibold py-2.5 px-6 rounded-lg bg-neutro-700 text-blanco hover:bg-neutro-800 transition-colors">
              Cancelar
            </button>
            <button className="font-semibold py-2.5 px-6 rounded-lg bg-principal-500 text-blanco hover:bg-principal-600 transition-colors">
              Guardar
            </button>
        </footer>
      </main>
    </div>
  );
}