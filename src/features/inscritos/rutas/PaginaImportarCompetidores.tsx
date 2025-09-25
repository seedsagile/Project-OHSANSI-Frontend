import React, { useState, useMemo } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    type ColumnDef,
} from '@tanstack/react-table';
import { IconoUsuario } from '../componentes/IconoUsuario';
import type { Competidor } from '../tipos';

const datosDeEjemplo: Competidor[] = [
  { nombre: 'Ana García', ci: '1234567', telfTutor: '77712345', colegio: 'Colegio Don Bosco', departamento: 'Cochabamba', grado: '5to', nivel: 'Secundaria', area: 'Matemáticas' },
  { nombre: 'Juan Pérez', ci: '7654321', telfTutor: '77754321', colegio: 'Colegio La Salle', departamento: 'Santa Cruz', grado: '6to', nivel: 'Secundaria', area: 'Física' },
  { nombre: 'María López', ci: '9876543', telfTutor: '77798765', colegio: 'Instituto Americano', departamento: 'La Paz', grado: '4to', nivel: 'Secundaria', area: 'Química' },
  { nombre: 'Carlos Quispe', ci: '8765432', telfTutor: '77787654', colegio: 'Colegio Alemán', departamento: 'Cochabamba', grado: '5to', nivel: 'Secundaria', area: 'Biología' },
  { nombre: 'Lucía Fernández', ci: '2345678', telfTutor: '77723456', colegio: 'Hughes Schools', departamento: 'Tarija', grado: '6to', nivel: 'Secundaria', area: 'Informática' },
  { nombre: 'Pedro Mamani', ci: '8765433', telfTutor: '77787655', colegio: 'Saint Andrew\'s', departamento: 'La Paz', grado: '3ro', nivel: 'Secundaria', area: 'Robótica' },
  { nombre: 'Sofía Rojas', ci: '3456789', telfTutor: '77734567', colegio: 'Franco Boliviano', departamento: 'Santa Cruz', grado: '5to', nivel: 'Secundaria', area: 'Matemáticas' },
  { nombre: 'Miguel Choque', ci: '4567890', telfTutor: '77745678', colegio: 'Colegio Don Bosco', departamento: 'Cochabamba', grado: '4to', nivel: 'Secundaria', area: 'Física' },
  { nombre: 'Valeria Mendoza', ci: '5678901', telfTutor: '77756789', colegio: 'La Salle', departamento: 'Beni', grado: '6to', nivel: 'Secundaria', area: 'Química' },
];

export function PaginaImportarCompetidores() {
    const [data] = useState<Competidor[]>(() => [...datosDeEjemplo]);

    const columns = useMemo<ColumnDef<Competidor>[]>(
        () => [
            { accessorKey: 'nombre', header: 'Nombre' },
            { accessorKey: 'ci', header: 'CI' },
            { accessorKey: 'telfTutor', header: 'Telf. Tutor' },
            { accessorKey: 'colegio', header: 'Colegio' },
            { accessorKey: 'departamento', header: 'Departamento' },
            { accessorKey: 'grado', header: 'Grado' },
            { accessorKey: 'nivel', header: 'Nivel' },
            { accessorKey: 'area', header: 'Área' },
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
                    <button className="bg-principal-500 text-blanco font-semibold py-2 px-5 rounded-md hover:bg-principal-600 transition-all duration-base shadow-sombra-2 hover:shadow-sombra-3 hover:-translate-y-px">
                        Cargar CSV
                    </button>
                    <div className="flex-grow border-2 border-dashed border-neutro-300 rounded-lg flex items-center justify-center p-4 text-neutro-400">
                        <span>o soltar archivo aquí</span>
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
                                                className="p-4 text-sm font-bold text-blanco tracking-wider uppercase"
                                            >
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody className="divide-y divide-neutro-200">
                                {table.getRowModel().rows.map(row => (
                                    <tr key={row.id} className="even:bg-neutro-100 hover:bg-principal-100 transition-colors">
                                        {row.getVisibleCells().map(cell => (
                                            <td key={cell.id} className="p-4 text-neutro-500">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <footer className="flex justify-end items-center gap-4 mt-12">
                    <button className="flex items-center gap-2 font-semibold py-2.5 px-6 rounded-lg bg-neutro-200 text-neutro-700 hover:bg-neutro-300 transition-colors">
                        Volver
                    </button>
                    <button className="flex items-center gap-2 font-semibold py-2.5 px-6 rounded-lg bg-neutro-700 text-blanco hover:bg-neutro-800 transition-colors">
                        Cancelar
                    </button>
                    <button className="flex items-center gap-2 font-semibold py-2.5 px-6 rounded-lg bg-principal-500 text-blanco hover:bg-principal-600 transition-colors">
                        Guardar
                    </button>
                </footer>

            </main>
        </div>
    );
}