import React from 'react';
import { IconoUsuario } from '../componentes/IconoUsuario';
import type { Competidor } from '../tipos';


type FilaCompetidorProps = {
    competidor: Partial<Competidor>;
    encabezados: (keyof Competidor)[];
};

// Componente para cada fila de la tabla
const FilaCompetidor = ({ competidor, encabezados }: FilaCompetidorProps) => (
    <tr className="h-10 hover:bg-neutral-50">
        {encabezados.map((llave) => (
            <td
                key={llave}
                className="border-x border-black p-2 text-sm text-neutral-600"
            >
                {competidor[llave] || ''}
            </td>
        ))}
    </tr>
);

export function PaginaImportarCompetidores() {
    const [filasDeDatos] = React.useState<Partial<Competidor>[]>(Array(5).fill({}));

    const encabezadosTabla: { key: keyof Competidor; label: string }[] = [
        { key: "nombre", label: "Nombre" },
        { key: "ci", label: "CI" },
        { key: "telfTutor", label: "Telf. Tutor" },
        { key: "colegio", label: "Colegio" },
        { key: "departamento", label: "Departamento" },
        { key: "grado", label: "Grado" },
        { key: "nivel", label: "Nivel" },
        { key: "area", label: "Área" },
    ];

    const clavesEncabezados = encabezadosTabla.map(h => h.key);

    return (
        <div className="bg-neutral-100 min-h-screen flex items-center justify-center p-4">
            <main className="bg-white w-full max-w-5xl rounded-lg shadow-panel p-6 md:p-8">
                <header className="relative mb-8 h-12 flex items-center justify-center">
                    {/* Texto centrado */}
                    <h1 className="absolute left-1/2 transform -translate-x-1/2 text-3xl md:text-4xl font-bold text-neutral-800">
                        Registrar Competidores
                    </h1>

                    {/* Icono alineado al borde derecho */}
                    <div className="absolute right-0 pr-2 text-neutral-600">
                        <IconoUsuario />
                    </div>
                </header>


                {/* Sección de carga de CSV */}
                <section className="flex flex-col md:flex-row gap-4 mb-8">
                    <button className="bg-purple-800 text-white hover:text-black font-semibold py-2 px-6 rounded-lg hover:bg-purple-500 transition-colors duration-300">
                        Cargar CSV
                    </button>
                    <div className="flex-grow border-2 border-dashed border-neutral-300 rounded-lg flex items-center justify-center p-4 text-neutral-500">
                        <span>o soltar archivo aquí</span>
                    </div>
                </section>

                {/* Tabla de datos */}
                <section className="overflow-x-auto">
                    <table className="w-full border border-black border-collapse text-left">
                        <thead>
                            <tr>
                                {encabezadosTabla.map(({ label }) => (
                                    <th
                                        key={label}
                                        className="border bg-purple-800 text-white p-3 bg-brand-50 font-medium text-brand-800"
                                    >
                                        {label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filasDeDatos.map((competidor, index) => (
                                <FilaCompetidor
                                    key={index}
                                    competidor={competidor}
                                    encabezados={clavesEncabezados}
                                />
                            ))}
                        </tbody>
                    </table>
                </section>

                {/* Botones de acción */}
                <div className="flex flex-col md:flex-row justify-center gap-x-50 mt-8">
                    <button className="bg-purple-800 text-white hover:text-black font-semibold py-2 px-6 rounded-lg hover:bg-purple-500 transition-colors duration-300">
                        Volver
                    </button>
                    <button className="bg-purple-800 text-white hover:text-black font-semibold py-2 px-6 rounded-lg hover:bg-purple-500 transition-colors duration-300">
                        Cancelar
                    </button>
                    <button className="bg-purple-800 text-white hover:text-black font-semibold py-2 px-6 rounded-lg hover:bg-purple-500 transition-colors duration-300">
                        Guardar
                    </button>
                </div>
            </main>
        </div>
    );
}