import { useAsignarNiveles } from '../hooks/useAsignarNiveles';
import { Save, LoaderCircle, X } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import type { Nivel } from '../../niveles/types';
import { useNavigate } from 'react-router-dom';

export function PaginaAsignarNiveles() {
    const {
        todasLasAreas,
        todosLosNiveles,
        areaSeleccionadaId,
        setAreaSeleccionadaId,
        nivelesSeleccionados,
        handleToggleNivel,
        handleGuardar,
        isLoading,
        isSaving,
        modalState,
        closeModal,
    } = useAsignarNiveles();

    const navigate = useNavigate();

    const handleCancel = () => {
        navigate('/dashboard');
    };

    return (
        <>
            <div className="bg-neutro-100 min-h-screen p-4 md:p-8 font-display flex justify-center items-center">
                <main className="bg-blanco w-full max-w-2xl rounded-xl shadow-sombra-3 p-6 md:p-8">
                    <header className="text-center mb-10">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-negro tracking-tighter">
                            Asignar Niveles a un Área
                        </h1>
                    </header>
                    
                    <div className="mb-6 relative">
                        <label htmlFor="area-selector" className="sr-only">Seleccionar Área</label>
                        <select
                            id="area-selector"
                            value={areaSeleccionadaId ?? ''}
                            onChange={(e) => setAreaSeleccionadaId(Number(e.target.value) || undefined)}
                            className="w-full p-3 pl-4 pr-10 border border-transparent rounded-lg bg-principal-500 text-white font-semibold focus:ring-2 focus:ring-principal-300 focus:border-principal-500 transition-colors appearance-none cursor-pointer"
                            disabled={isLoading}
                        >
                            <option value="" className="bg-white text-black">Seleccionar Área</option>
                            {todasLasAreas.map(area => (
                                <option key={area.id_area} value={area.id_area} className="bg-white text-black">
                                    {area.nombre}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-white">
                            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>

                    <h2 className="text-xl font-semibold text-gray-800 text-center mb-4">
                        Lista de Niveles
                    </h2>

                    <div className={`rounded-lg border border-neutro-200 overflow-hidden transition-opacity ${!areaSeleccionadaId ? 'opacity-50' : ''}`}>
                        <div className="overflow-y-auto h-72">
                            <table className="w-full text-left">
                                <thead className="bg-principal-500 sticky top-0 z-10">
                                    <tr>
                                        <th scope="col" className="p-4 text-sm font-bold text-blanco tracking-wider uppercase text-center">NRO</th>
                                        <th scope="col" className="p-4 text-sm font-bold text-blanco tracking-wider uppercase text-center">NIVEL</th>
                                        <th scope="col" className="p-4 text-sm font-bold text-blanco tracking-wider uppercase text-center">TIENE</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutro-200">
                                    {isLoading && areaSeleccionadaId ? (
                                        <tr><td colSpan={3} className="text-center p-10"><div className="flex justify-center items-center text-principal-500"><LoaderCircle className="animate-spin h-8 w-8" /></div></td></tr>
                                    ) : !areaSeleccionadaId ? (
                                        <tr><td colSpan={3} className="text-center p-10 text-neutro-400">Seleccione un área para ver los niveles.</td></tr>
                                    ) : (
                                        todosLosNiveles.map((nivel: Nivel, index: number) => (
                                            <tr key={nivel.id_nivel} className="even:bg-neutro-100 hover:bg-principal-50 transition-colors">
                                                <td className="p-4 text-neutro-700 text-center">{index + 1}</td>
                                                <td className="p-4 text-neutro-700 text-left">{nivel.nombre}</td>
                                                <td className="p-4 text-neutro-700 text-center">
                                                    <input
                                                        type="checkbox"
                                                        aria-label={`Asignar el nivel: ${nivel.nombre}`}
                                                        className="h-5 w-5 rounded border-gray-400 text-principal-600 focus:ring-principal-500 cursor-pointer"
                                                        checked={nivelesSeleccionados.has(nivel.id_nivel)}
                                                        onChange={() => handleToggleNivel(nivel.id_nivel)}
                                                    />
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <footer className="flex justify-end items-center gap-4 mt-8">
                        <button 
                            onClick={handleCancel}
                            className="flex items-center justify-center gap-2 font-semibold py-2.5 px-6 rounded-lg bg-neutro-200 text-neutro-700 hover:bg-neutro-300 transition-colors"
                        >
                            <X className="h-5 w-5" />
                            <span>Cancelar</span>
                        </button>
                        
                        <button onClick={handleGuardar} disabled={!areaSeleccionadaId || isSaving} className="flex items-center justify-center gap-2 font-semibold py-2.5 px-6 rounded-lg bg-principal-500 text-blanco hover:bg-principal-600 transition-colors disabled:bg-principal-300 disabled:cursor-not-allowed min-w-[150px]">
                            {isSaving ? (
                                <><LoaderCircle className="animate-spin h-5 w-5"/><span>Guardando...</span></>
                            ) : (
                                <><Save className="h-5 w-5" /><span>Guardar</span></>
                            )}
                        </button>
                    </footer>
                </main>
            </div>
            
            <Modal
                isOpen={modalState.isOpen}
                onClose={closeModal}
                title={modalState.title}
                type={modalState.type}
                onConfirm={modalState.onConfirm}
                loading={isSaving}
            >
                {modalState.message}
            </Modal>
        </>
    );
}