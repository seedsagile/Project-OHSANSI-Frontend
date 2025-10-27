import { useEffect, useState } from 'react';
import { obtenerNivelesPorAreaAPI, obtenerAreasAPI } from '../service/service';
import type { Area, Nivel } from '../interface/interface';
import { Formulario } from './Formulario';
import { TablaGestiones } from './TablaGestiones';

export const Parametro = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [areas, setAreas] = useState<Area[]>([]);
  const [niveles, setNiveles] = useState<Nivel[]>([]);
  const [areaSeleccionada, setAreaSeleccionada] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [nivelSeleccionado, setNivelSeleccionado] = useState<Nivel | null>(null);
  const [nivelesEnviadosPorArea, setNivelesEnviadosPorArea] = useState<Record<number, number[]>>(
    {}
  );
  const [gestionSeleccionada, setGestionSeleccionada] = useState<number | null>(null);

  const toggleAccordion = () => setIsOpen(!isOpen);

  // Obtener ÁREAS al cargar el componente
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const data = await obtenerAreasAPI();
        setAreas(data);
      } catch (error) {
        console.error('Error al obtener las áreas:', error);
      }
    };
    fetchAreas();
  }, []);

  // Manejar selección de área y cargar niveles
  const handleSelectArea = async (id: number) => {
    setAreaSeleccionada(id);
    setNivelSeleccionado(null); // limpiar selección de nivel
    setLoading(true);
    setNiveles([]); // limpiar niveles mientras carga
    try {
      const nivelesData = await obtenerNivelesPorAreaAPI(id);
      setNiveles(nivelesData);
    } catch (error) {
      console.error('Error al obtener niveles por área:', error);
      setNiveles([]);
    } finally {
      setLoading(false);
      setIsOpen(false);
    }
  };

  // Manejar click en fila de nivel
  const handleFilaClick = (nivel: Nivel) => {
    if (areaSeleccionada && nivelesEnviadosPorArea[areaSeleccionada]?.includes(nivel.id)) return;
    setNivelSeleccionado(nivel);
  };

  const handleCerrarModal = () => setNivelSeleccionado(null);

  const marcarNivelEnviado = (idNivel: number, idArea: number) => {
    setNivelesEnviadosPorArea((prev) => ({
      ...prev,
      [idArea]: [...(prev[idArea] || []), idNivel],
    }));
  };

  return (
    <div className="bg-neutro-100 min-h-screen flex items-center justify-center p-6 font-display relative">
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
                    ? `Área seleccionada: ${areas.find((a) => a.id === areaSeleccionada)?.nombre}`
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
              <div className="overflow-hidden rounded-lg border border-neutro-300">
                <table className="w-full border-collapse">
                  <thead className="bg-principal-500 text-blanco">
                    <tr>
                      <th className="py-2 px-4 text-left w-16">NRO</th>
                      <th className="py-2 px-4 text-left w-10">NIVEL</th>
                      <th className="py-2 px-4 text-center w-24">TIENE</th>
                    </tr>
                  </thead>
                  <tbody className="text-neutro-800">
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
                            : 'Seleccione un área para ver sus niveles.'}
                        </td>
                      </tr>
                    ) : (
                      niveles.map((nivel, index) => (
                        <tr
                          key={nivel.id}
                          className={`border-t border-neutro-200 transition cursor-pointer ${
                            nivelSeleccionado?.id === nivel.id &&
                            areaSeleccionada === nivelSeleccionado?.id
                              ? 'bg-principal-100 text-principal-700 font-semibold'
                              : 'hover:bg-neutro-100'
                          }`}
                          onClick={() => handleFilaClick(nivel)}
                        >
                          <td className="py-2 px-4">{index + 1}</td>
                          <td className="py-2 px-4">{nivel.nombre}</td>
                          <td className="py-2 px-4 text-center">
                            <input
                              type="checkbox"
                              className="w-5 h-5 accent-principal-500"
                              checked={
                                !!(
                                  areaSeleccionada &&
                                  nivelesEnviadosPorArea[areaSeleccionada]?.includes(nivel.id)
                                )
                              }
                              readOnly
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

          {/* DERECHA - FORMULARIO */}
          <div className="flex-1 border-l border-neutro-300 pl-6">
            <Formulario
              nivel={nivelSeleccionado}
              idArea={areaSeleccionada ?? 0}
              onCerrar={handleCerrarModal}
              onMarcarEnviado={marcarNivelEnviado}
            />
          </div>
        </div>

        <TablaGestiones
          gestionSeleccionada={gestionSeleccionada}
          onSelectGestion={(id) => setGestionSeleccionada(id)}
          areaSeleccionada={areaSeleccionada}
          nivelSeleccionado={nivelSeleccionado?.nombre || null}
        />
      </main>
    </div>
  );
};
