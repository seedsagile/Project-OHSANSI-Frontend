import React from 'react';
import { IconoUsuario } from '../componentes/IconoUsuario';
import type { Competidor } from '../tipos';

type FilaCompetidorProps = {
    competidor: Partial<Competidor>;
    encabezados: (keyof Competidor)[];
};


const FilaCompetidor = ({ competidor, encabezados }: FilaCompetidorProps) => (
    <tr className="h-10 hover:bg-neutral-50">
        {encabezados.map((llave) => (
            <td
                key={llave}
                className="border border-neutral-200 p-2 text-sm text-neutral-700"
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
                
                
                <header className="flex justify-between items-center mb-8">
                    
                    <div className="w-8"></div>
                    <h1 className="text-3xl md:text-4xl font-bold text-neutral-800">
                        Registrar Competidores
                    </h1>
                    <div className="text-neutral-600">
                        <IconoUsuario />
                    </div>
                </header>

                <section className="flex flex-col md:flex-row gap-4 mb-8">
                    
                    <button className="bg-neutral-300 text-white font-semibold py-2 px-6 rounded-lg hover:bg-brand-700 transition-colors duration-300">
                        Cargar CSV
                    </button>
                    <div className="flex-grow border-2 border-dashed border-neutral-300 rounded-lg flex items-center justify-center p-4 text-neutral-500">
                        <span>o soltar archivo aquí</span>
                    </div>
                </section>

                <section className="overflow-x-auto">
                    
                    <table className="w-full border-collapse border border-neutral-200 text-left">
                        <thead>
                            <tr>
                                {encabezadosTabla.map(({ label }) => (
                                    
                                    <th
                                        key={label}
                                        className="border-b border-brand-200 bg-brand-600 p-3 font-medium text-white text-sm"
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

                <footer className="flex flex-col md:flex-row justify-center items-center gap-50 mt-8">
                    <button className="borde border-black border-2 rounded bg-brand-300 text-black font-semibold py-2 px-6 rounded-lg hover:bg-brand-600 hover:text-white transition-colors">
                        Volver
                    </button>
                    <button className="bg-brand-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-brand-700 transition-colors">
                        Cancelar
                    </button>
                    <button className="bg-brand-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-brand-700 transition-colors">
                        Guardar
                    </button>
                </footer>
            </main>
        </div>
    );
}