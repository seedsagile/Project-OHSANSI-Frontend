import { useEffect, useState } from 'react';
import {
  obtenerAreasAPI,
  obtenerNivelesPorAreaAPI,
  obtenerParametrosPorOlimpiadaAPI,
} from '../service/service';
import type { Area, Nivel, ParametroGestionAPI } from '../interface/interface';
import { Formulario } from './Formulario';
import { TablaGestiones } from './TablaGestiones';
import { Modal } from '@/components/ui/Modal';
import { Toaster, toast } from 'sonner';

export const Parametro = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [areas, setAreas] = useState<Area[]>([]);
  const [niveles, setNiveles] = useState<Nivel[]>([]);
  const [areaSeleccionada, setAreaSeleccionada] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [nivelesSeleccionados, setNivelesSeleccionados] = useState<Nivel[]>([]);
  const [valoresCopiadosManualmente, setValoresCopiadosManualmente] = useState(false);
  const [nivelesConParametros, setNivelesConParametros] = useState<Record<number, string[]>>([]);
  const [gestionSeleccionada, setGestionSeleccionada] = useState<number | null>(null);
  const [modalSuccessOpen, setModalSuccessOpen] = useState(false);
  const [hoveredGrado, setHoveredGrado] = useState<{
    visible: boolean;
    grados?: { id: number; nombre: string }[];
    x: number;
    y: number;
  }>({ visible: false, grados: [], x: 0, y: 0 });

  useEffect(() => {
    if (modalSuccessOpen) {
      const timer = setTimeout(() => {
        setModalSuccessOpen(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [modalSuccessOpen]);

  const [valoresCopiados, setValoresCopiados] = useState<{
    notaMinima: number | '';
    notaMaxima: number | '';
    cantidadMaxima: number | '';
  }>({
    notaMinima: '',
    notaMaxima: '',
    cantidadMaxima: '',
  });

  const copiarValores = (valores: {
    notaMinima: number;
    notaMaxima: number;
    cantidadMaxima: number;
  }) => {
    setValoresCopiados({
      notaMinima: valores.notaMinima,
      notaMaxima: valores.notaMaxima,
      cantidadMaxima: valores.cantidadMaxima,
    });
    setValoresCopiadosManualmente(true);
    toast.success('Valores copiados correctamente');
  };

  const toggleAccordion = () => setIsOpen(!isOpen);

  // ✅ Obtener áreas disponibles
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const data = await obtenerAreasAPI();
        setAreas(data);
        toast.success('Áreas cargadas correctamente');
      } catch (error) {
        console.error('Error al obtener áreas:', error);
        toast.error('Error al obtener áreas');
      }
    };
    fetchAreas();
  }, []);

  // Obtener parámetros existentes para gestión actual
  useEffect(() => {
    const fetchParametros = async () => {
      try {
        const parametros = await obtenerParametrosPorOlimpiadaAPI();

        // 🔹 Filtrar solo los parámetros de la gestión actual
        const gestionActual = '2025'; // puedes traerlo dinámicamente si prefieres
        const parametrosGestionActual = parametros.filter(
          (p: ParametroGestionAPI) => p.gestion === gestionActual
        );

        const nivelesMap: Record<number, string[]> = {};

        parametrosGestionActual.forEach((p: ParametroGestionAPI) => {
          const area = areas.find((a) => a.nombre === p.area);
          if (!area) return;

          // Usamos el nombre completo del nivel, no un número
          if (!nivelesMap[area.id]) nivelesMap[area.id] = [];
          nivelesMap[area.id].push(p.nivel.trim());
        });

        setNivelesConParametros(nivelesMap);
      } catch (error) {
        console.error('Error al obtener parámetros gestión actual:', error);
        toast.error('Error al obtener parámetros');
      }
    };
    fetchParametros();
  }, [areas]);

  const limpiarGestionSeleccionada = () => {
    setGestionSeleccionada(null);
  };

  const handleSelectArea = async (id: number) => {
    setAreaSeleccionada(id);
    setValoresCopiadosManualmente(false);
    setLoading(true);
    setNivelesSeleccionados([]); // limpiar selección al cambiar área

    try {
      const nivelesData = await obtenerNivelesPorAreaAPI(id);
      setNiveles(nivelesData);
      toast.success('Niveles cargados correctamente');
    } catch (error) {
      console.error('Error al obtener niveles por área:', error);
      toast.error('Error al obtener niveles');
      setNiveles([]);
    } finally {
      setLoading(false);
      setIsOpen(false);
    }
  };

  const handleCheckboxChange = (nivel: Nivel, checked: boolean) => {
    setNivelesSeleccionados((prev) => {
      if (checked) {
        return [...prev, nivel];
      } else {
        return prev.filter((n) => n.id !== nivel.id);
      }
    });
  };

  const handleCerrarModal = () => setNivelesSeleccionados([]);

  const marcarNivelEnviado = (nombreNivel: string, idArea: number) => {
    setNivelesConParametros((prev) => {
      const actualizados = {
        ...prev,
        [idArea]: [...(prev[idArea] || []), nombreNivel.trim()],
      };
      return actualizados;
    });
    toast.success('Parámetro registrado correctamente');
  };

  // Mostrar tooltip al pasar el mouse sobre los grados
  const handleMouseEnter = (
    e: React.MouseEvent<HTMLTableCellElement>,
    grados: { id: number; nombre: string }[]
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredGrado({
      visible: true,
      grados,
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
  };

  const handleMouseLeave = () => {
    setHoveredGrado({ visible: false, grados: [], x: 0, y: 0 });
  };

  return (
    <div className="bg-neutro-100 min-h-screen flex items-center justify-center p-6 font-display relative">
      <Toaster position="top-right" richColors />
      <main className="bg-blanco w-full max-w-6xl rounded-2xl shadow-sombra-3 p-10 border border-neutro-200 relative">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-negro tracking-tight">
            Registro de parámetro de clasificación
          </h1>
        </header>

        <div className="flex gap-6">
          <div className="flex-1 space-y-6 relative">
            {/* SELECCIÓN DE ÁREA */}
            <div className="relative border-2 border-principal-500 rounded-xl overflow-visible z-20">
              <button
                onClick={toggleAccordion}
                className="w-full flex justify-between items-center bg-principal-500 hover:bg-principal-600 transition-colors px-4 py-3 font-semibold text-white rounded-t-xl"
              >
                <span>
                  {areaSeleccionada
                    ? `Seleccionar Área: ${areas.find((a) => a.id === areaSeleccionada)?.nombre}`
                    : 'Seleccionar Área'}
                </span>
                <svg
                  className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isOpen && (
                <div
                  className="absolute left-0 top-full z-20 w-full bg-blanco px-6 py-4 border-2 border-principal-500 rounded-b-xl shadow-lg overflow-y-auto transition-all duration-300"
                  style={{ maxHeight: '200px' }}
                >
                  {areas.length === 0 ? (
                    <p className="text-neutro-700 text-sm">No hay áreas disponibles.</p>
                  ) : (
                    <div className="space-y-2">
                      {areas.map((area) => (
                        <button
                          key={area.id}
                          onClick={() => handleSelectArea(area.id)}
                          className={`w-full text-left px-4 py-2 rounded-md border transition-all duration-150 ${
                            areaSeleccionada === area.id
                              ? 'bg-principal-100 border-principal-400 text-principal-700 font-semibold'
                              : 'bg-blanco hover:bg-neutro-100 border-neutro-200'
                          }`}
                        >
                          {area.nombre}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* TABLA DE NIVELES */}
            <div className="relative z-10">
              <h2 className="text-lg font-bold text-negro mb-3">Lista de niveles</h2>
              <div
                className="rounded-lg border border-neutro-300 relative"
                style={{ maxHeight: '200px', overflowY: 'auto', overflowX: 'visible' }}
              >
                <table className="w-full border-collapse">
                  <thead className="bg-principal-500 text-blanco sticky top-0 z-10">
                    <tr>
                      <th className="py-2 px-4 text-left w-16">NRO</th>
                      <th className="py-2 px-4 text-left w-10">NIVEL</th>
                      <th className="py-2 px-4 text-center w-24">SELECCIONAR</th>
                    </tr>
                  </thead>
                  <tbody className="text-neutro-800 ">
                    {loading ? (
                      <tr>
                        <td colSpan={3} className="text-center py-4 text-neutro-600">
                          Cargando niveles...
                        </td>
                      </tr>
                    ) : niveles.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="text-center py-4 text-neutro-600">
                          {areaSeleccionada
                            ? 'No hay niveles disponibles para esta área.'
                            : 'Seleccione un área para ver los niveles'}
                        </td>
                      </tr>
                    ) : (
                      niveles.map((nivel, index) => (
                        <tr
                          key={nivel.id}
                          className={`group border-t border-neutro-200 transition cursor-pointer hover:bg-neutro-100`}
                        >
                          <td className="py-2 px-4">{index + 1}</td>
                          <td
                            className="py-2 px-4 relative"
                            onMouseEnter={(e) =>
                              nivel.grados && nivel.grados.length > 0
                                ? handleMouseEnter(e, nivel.grados)
                                : null
                            }
                            onMouseLeave={handleMouseLeave}
                          >
                            {nivel.nombre}
                          </td>
                          <td className="py-2 px-4 text-center">
                            <input
                              type="checkbox"
                              className="w-5 h-5 accent-principal-500"
                              checked={
                                nivelesSeleccionados.some((n) => n.id === nivel.id) ||
                                !!(
                                  areaSeleccionada &&
                                  nivelesConParametros[areaSeleccionada]?.includes(
                                    nivel.nombre.trim()
                                  )
                                )
                              }
                              onChange={(e) => handleCheckboxChange(nivel, e.target.checked)}
                              disabled={
                                !!(
                                  areaSeleccionada &&
                                  nivelesConParametros[areaSeleccionada]?.includes(
                                    nivel.nombre.trim()
                                  )
                                )
                              }
                            />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* FORMULARIO DERECHA */}
          <div className="flex-1 border-l border-neutro-300 pl-6">
            <Formulario
              nivelesSeleccionados={nivelesSeleccionados}
              idArea={areaSeleccionada ?? 0}
              onCerrar={handleCerrarModal}
              onMarcarEnviado={marcarNivelEnviado}
              valoresCopiados={valoresCopiados}
              valoresCopiadosManualmente={valoresCopiadosManualmente}
              onLimpiarSeleccion={limpiarGestionSeleccionada}
              onSuccess={() => setModalSuccessOpen(true)}
            />
          </div>
        </div>

        {/* antes o donde lo tengas */}
        <TablaGestiones
          gestionSeleccionada={gestionSeleccionada}
          onSelectGestion={(id) => setGestionSeleccionada(id)}
          formularioHabilitado={nivelesSeleccionados.length > 0}
          onCopiarValores={copiarValores}
          nivelesSeleccionados={nivelesSeleccionados} // nuevo
          areaSeleccionadaNombre={areas.find((a) => a.id === areaSeleccionada)?.nombre ?? null} // nuevo
        />
      </main>

      {/* Tooltip Mejorado */}
      {hoveredGrado.visible && hoveredGrado.grados && hoveredGrado.grados.length > 0 && (
        <div
          className="fixed z-[9999] bg-gray-900 text-white text-sm rounded-lg shadow-lg p-3 transition-opacity duration-200"
          style={{
            top: hoveredGrado.y,
            left: hoveredGrado.x,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <p className="font-semibold mb-1">Grados:</p>
          <ul className="list-disc pl-4 space-y-1">
            {hoveredGrado.grados.map((grado) => (
              <li key={grado.id}>{grado.nombre}</li>
            ))}
          </ul>
        </div>
      )}

      <Modal
        isOpen={modalSuccessOpen}
        onClose={() => setModalSuccessOpen(false)}
        title="¡Registro exitoso!"
        type="success"
      >
        Los parámetros se registraron correctamente.
      </Modal>
    </div>
  );
};
