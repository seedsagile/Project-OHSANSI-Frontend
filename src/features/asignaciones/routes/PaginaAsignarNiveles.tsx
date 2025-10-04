import { useAsignarNiveles } from '../hooks/useAsignarNiveles';
import { Save, LoaderCircle } from 'lucide-react';
import { ModalConfirmacion } from '../../responsables/components/ModalConfirmacion';
import type { Nivel } from '../../niveles/types';

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

    return (
        <>
            <div className="bg-neutro-100 min-h-screen p-4 md:p-8 font-display flex justify-center">
                <main className="bg-blanco w-full max-w-4xl rounded-xl shadow-sombra-3 p-6 md:p-8">
                    <header className="text-center mb-10">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-negro tracking-tighter">
                            Asignar Niveles a Áreas
                        </h1>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label htmlFor="area-selector" className="block text-lg font-semibold text-gray-700 mb-2">
                                1. Seleccione un Área
                            </label>
                            <select
                                id="area-selector"
                                value={areaSeleccionadaId ?? ''}
                                onChange={(e) => setAreaSeleccionadaId(Number(e.target.value) || undefined)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-principal-500 focus:border-principal-500 transition-colors"
                            >
                                <option value="">-- Elija un área --</option>
                                {todasLasAreas.map(area => (
                                    <option key={area.id_area} value={area.id_area}>
                                        {area.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-700 mb-2">
                                2. Asigne los Niveles
                            </h2>
                            <div className={`border rounded-lg p-4 h-64 overflow-y-auto transition-opacity ${!areaSeleccionadaId ? 'opacity-50 bg-neutro-100' : ''}`}>
                                {isLoading && areaSeleccionadaId ? (
                                    <div className="flex justify-center items-center h-full">
                                        <LoaderCircle className="animate-spin h-8 w-8 text-principal-500" />
                                    </div>
                                ) : !areaSeleccionadaId ? (
                                    <div className="flex justify-center items-center h-full text-neutro-500">
                                        Seleccione un área para empezar.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {todosLosNiveles.map((nivel: Nivel) => (
                                            <label key={nivel.id_nivel} className="flex items-center gap-3 p-2 rounded-md hover:bg-neutro-100 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="h-5 w-5 rounded border-gray-300 text-principal-600 focus:ring-principal-500"
                                                    checked={nivelesSeleccionados.has(nivel.id_nivel)}
                                                    onChange={() => handleToggleNivel(nivel.id_nivel)}
                                                />
                                                <span className="text-neutro-700">{nivel.nombre}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <footer className="flex justify-end mt-10">
                        <button 
                            onClick={handleGuardar} 
                            disabled={!areaSeleccionadaId || isSaving}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 font-semibold py-2.5 px-6 rounded-lg bg-principal-500 text-blanco hover:bg-principal-600 transition-colors disabled:bg-principal-300 disabled:cursor-not-allowed min-w-[180px]"
                        >
                            {isSaving ? (
                                <><LoaderCircle className="animate-spin h-5 w-5"/><span>Guardando...</span></>
                            ) : (
                                <><Save className="h-5 w-5" /><span>Guardar Cambios</span></>
                            )}
                        </button>
                    </footer>
                </main>
            </div>
            
            <ModalConfirmacion
                isOpen={modalState.isOpen}
                onClose={closeModal}
                title={modalState.title}
                type={modalState.type === 'success' ? 'success' : 'error'}
            >
                {modalState.message}
            </ModalConfirmacion>
        </>
    );
}