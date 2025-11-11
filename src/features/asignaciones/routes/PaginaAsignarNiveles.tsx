import { useAsignarNiveles } from '../hooks/useAsignarNiveles';
import { Save, LoaderCircle, X } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { ModalGrados } from '../components/ModalGrados';
import type { Nivel } from '../types';
import { useNavigate } from 'react-router-dom';
import { CustomDropdown } from '../../../components/ui/CustomDropdown';

export function PaginaAsignarNiveles() {
  const {
    todasLasAreas,
    todosLosNiveles,
    areaSeleccionadaId,
    nivelesSeleccionados,
    nivelesOriginales,
    handleToggleNivel,
    handleGuardar,
    isLoading,
    isSaving,
    modalState,
    closeModal,
    handleChangeArea,
    handleAbrirModalGrados,
    handleCerrarModalGrados,
    handleGuardarGrados,
    modalGradosState,
    hayNivelesNuevos, // NUEVO: recibir esta variable
  } = useAsignarNiveles();

  const navigate = useNavigate();

  const handleCancel = () => {
    navigate('/dashboard');
  };

  const areaOptions = todasLasAreas.map((area) => ({
    value: area.id_area,
    label: area.nombre,
  }));

  const handleCheckboxClick = (nivel: Nivel) => {
    const esNivelOriginal = nivelesOriginales.has(nivel.id_nivel);
    const estaSeleccionado = nivelesSeleccionados.has(nivel.id_nivel);
    
    // Si el nivel ya estaba asignado originalmente, no hacer nada
    if (esNivelOriginal) {
      return;
    }

    // Si el nivel ya estaba seleccionado (desmarcarlo)
    if (estaSeleccionado) {
      handleAbrirModalGrados(nivel.id_nivel, nivel.nombre);
      return;
    }

    // Si no estaba seleccionado, marcarlo y abrir modal de grados
    handleToggleNivel(nivel.id_nivel);
    // Pequeño delay para que se actualice el estado antes de abrir el modal
    setTimeout(() => {
      handleAbrirModalGrados(nivel.id_nivel, nivel.nombre);
    }, 100);
  };

  return (
    <>
      <div className="bg-neutro-100 min-h-screen p-4 md:p-8 font-display flex justify-center items-center">
        <main className="bg-blanco w-full max-w-2xl rounded-xl shadow-sombra-3 p-6 md:p-8">
          <header className="mb-10">
            <div className="text-right mb-2">
              <p className="text-sm font-semibold text-negro tracking-wider">
                Gestión 2025
              </p>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-negro tracking-tighter text-center">
              Asignar Niveles a Área
            </h1>
          </header>

          <div className="mb-6 relative">
            <label
              htmlFor="area-selector"
              className="block text-md font-medium text-neutro-600 mb-2"
            >
              Seleccione un Área
            </label>
            <CustomDropdown
              placeholder="Seleccionar Área"
              options={areaOptions}
              selectedValue={areaSeleccionadaId ?? null}
              onSelect={(value) => handleChangeArea(Number(value) || undefined)}
              disabled={isLoading || isSaving}
            />
          </div>

          <h2 className="text-xl font-semibold text-gray-800 text-center mb-4">Lista de Niveles</h2>

          <div
            className={`rounded-lg border border-neutro-200 overflow-hidden transition-opacity ${!areaSeleccionadaId ? 'opacity-50' : ''}`}
          >
            <div className="overflow-y-auto h-72">
              <table className="w-full text-left">
                <thead className="bg-principal-500 sticky top-0 z-10">
                  <tr>
                    <th
                      scope="col"
                      className="p-4 text-sm font-bold text-blanco tracking-wider uppercase text-center"
                    >
                      NRO
                    </th>
                    <th
                      scope="col"
                      className="p-4 text-sm font-bold text-blanco tracking-wider uppercase text-center"
                    >
                      NIVEL
                    </th>
                    <th
                      scope="col"
                      className="p-4 text-sm font-bold text-blanco tracking-wider uppercase text-center"
                    >
                      ASIGNADO
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutro-200">
                  {isLoading && areaSeleccionadaId ? (
                    <tr>
                      <td colSpan={3} className="text-center p-10">
                        <div className="flex justify-center items-center text-principal-500">
                          <LoaderCircle className="animate-spin h-8 w-8" />
                        </div>
                      </td>
                    </tr>
                  ) : !areaSeleccionadaId ? (
                    <tr>
                      <td colSpan={3} className="text-center p-10 text-neutro-400">
                        Seleccione un área para ver los niveles.
                      </td>
                    </tr>
                  ) : todosLosNiveles.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center p-10 text-neutro-500">
                        No hay niveles disponibles para registrar.
                      </td>
                    </tr>
                  ) : (
                    todosLosNiveles.map((nivel: Nivel, index: number) => {
                      const esNivelOriginal = nivelesOriginales.has(nivel.id_nivel);
                      const estaSeleccionado = nivelesSeleccionados.has(nivel.id_nivel);
                      
                      return (
                        <tr
                          key={nivel.id_nivel}
                          className="even:bg-neutro-100 hover:bg-principal-50 transition-colors"
                        >
                          <td className="p-4 text-neutro-700 text-center">{index + 1}</td>
                          <td className="p-4 text-neutro-700 text-left">{nivel.nombre}</td>
                          <td className="p-4 text-neutro-700 text-center">
                            <input
                              type="checkbox"
                              aria-label={`Asignar el nivel: ${nivel.nombre}`}
                              className={`h-5 w-5 rounded border-gray-400 text-principal-600 focus:ring-principal-500 ${
                                esNivelOriginal 
                                  ? 'cursor-not-allowed opacity-60' 
                                  : 'cursor-pointer'
                              }`}
                              checked={estaSeleccionado}
                              onChange={() => handleCheckboxClick(nivel)}
                              disabled={esNivelOriginal}
                            />
                          </td>
                        </tr>
                      );
                    })
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

            <button
              onClick={handleGuardar}
              disabled={!areaSeleccionadaId || isSaving || isLoading || !hayNivelesNuevos}
              className="flex items-center justify-center gap-2 font-semibold py-2.5 px-6 rounded-lg bg-principal-500 text-blanco hover:bg-principal-600 transition-colors disabled:bg-principal-300 disabled:cursor-not-allowed min-w-[150px]"
            >
              {isSaving ? (
                <>
                  <LoaderCircle className="animate-spin h-5 w-5" />
                  <span>Guardando...</span>
                </>
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

      <ModalGrados
        isOpen={modalGradosState.isOpen}
        onClose={handleCerrarModalGrados}
        onSave={handleGuardarGrados}
        niveles={modalGradosState.grados}
        gradosSeleccionados={modalGradosState.gradosSeleccionados}
        nombreNivel={modalGradosState.nombreNivel}
        isLoading={modalGradosState.isLoading}
      />
    </>
  );
}