import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  obtenerAreasAPI,
  obtenerNivelesPorAreaAPI,
  obtenerParametrosGestionActualAPI,
} from '../service/service';
import type { Area, Nivel } from '../interface/interface';
import { Formulario } from './Formulario';
import { TablaGestiones } from './TablaGestiones';
import { Modal } from '@/components/ui/Modal';

export const Parametro = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [areas, setAreas] = useState<Area[]>([]);
  const [niveles, setNiveles] = useState<Nivel[]>([]);
  const [areaSeleccionada, setAreaSeleccionada] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [nivelesSeleccionados, setNivelesSeleccionados] = useState<Nivel[]>([]);
  const [valoresCopiadosManualmente, setValoresCopiadosManualmente] = useState(false);
  const [nivelesConParametros, setNivelesConParametros] = useState<Record<number, string[]>>({});
  const [gestionSeleccionada, setGestionSeleccionada] = useState<number | null>(null);
  const [modalSuccessOpen, setModalSuccessOpen] = useState(false);
  const [hoveredGrado, setHoveredGrado] = useState<{
    visible: boolean;
    grados?: { id: number; nombre: string }[];
    x: number;
    y: number;
  }>({ visible: false, grados: [], x: 0, y: 0 });

  const [successType, setSuccessType] = useState<'notaYCantidad' | 'soloNota'>('notaYCantidad');

  const [valoresCopiados, setValoresCopiados] = useState<{
    notaMinima: number | '';
    notaMaxima: number | '';
    cantidadMaxima: number | '';
  }>({
    notaMinima: '',
    notaMaxima: '',
    cantidadMaxima: '',
  });

  /* =======================
     EFECTO: cerrar modal
  ======================== */
  useEffect(() => {
    if (!modalSuccessOpen) return;
    const timer = setTimeout(() => setModalSuccessOpen(false), 3000);
    return () => clearTimeout(timer);
  }, [modalSuccessOpen]);

  /* =======================
     ÁREAS (1 sola vez)
  ======================== */
  useEffect(() => {
    obtenerAreasAPI().then((data) => {
      const ordenadas = data.sort((a, b) =>
        a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
      );
      setAreas(ordenadas);
    });
  }, []);

  /* =======================
     MAPA áreas por id (useMemo)
  ======================== */
  const areaMap = useMemo(() => {
    const map = new Map<number, Area>();
    areas.forEach((a) => map.set(a.id, a));
    return map;
  }, [areas]);

  /* =======================
     PARÁMETROS ACTUALES
     (solo cuando ya hay áreas)
  ======================== */
  useEffect(() => {
    if (areas.length === 0) return;

    obtenerParametrosGestionActualAPI().then((parametros) => {
      const map: Record<number, string[]> = {};

      parametros.forEach((p: any) => {
        const areaNombre = p.area_nivel.area.nombre;
        const nivelNombre = p.area_nivel.nivel.nombre.trim();
        const area = areas.find((a) => a.nombre === areaNombre);
        if (!area) return;

        map[area.id] ??= [];
        map[area.id].push(nivelNombre);
      });

      setNivelesConParametros(map);
    });
  }, [areas]);

  /* =======================
     HANDLERS MEMOIZADOS
  ======================== */
  const toggleAccordion = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleSelectArea = useCallback(async (id: number) => {
    setAreaSeleccionada(id);
    setLoading(true);
    setNivelesSeleccionados([]);
    setValoresCopiadosManualmente(false);

    try {
      const data = await obtenerNivelesPorAreaAPI(id);
      const ordenados = data.sort((a: Nivel, b: Nivel) => {
        const na = parseInt(a.nombre.match(/\d+/)?.[0] || '0');
        const nb = parseInt(b.nombre.match(/\d+/)?.[0] || '0');
        return na !== nb ? na - nb : a.nombre.localeCompare(b.nombre, 'es');
      });
      setNiveles(ordenados);
    } finally {
      setLoading(false);
      setIsOpen(false);
    }
  }, []);

  const handleCheckboxChange = useCallback((nivel: Nivel, checked: boolean) => {
    setNivelesSeleccionados((prev) =>
      checked ? [...prev, nivel] : prev.filter((n) => n.id !== nivel.id)
    );
  }, []);

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLTableCellElement>, grados: { id: number; nombre: string }[]) => {
      const rect = e.currentTarget.getBoundingClientRect();
      setHoveredGrado({
        visible: true,
        grados,
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      });
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredGrado({ visible: false, grados: [], x: 0, y: 0 });
  }, []);

  const copiarValores = useCallback((valores: any) => {
    setValoresCopiados({
      notaMinima: valores.notaMinima,
      notaMaxima: valores.notaMaxima,
      cantidadMaxima: valores.cantidadMaxima,
    });
    setValoresCopiadosManualmente(true);
  }, []);

  const limpiarValoresCopiados = useCallback(() => {
    setGestionSeleccionada(null);
    setValoresCopiadosManualmente(false);
    setValoresCopiados({ notaMinima: '', notaMaxima: '', cantidadMaxima: '' });
  }, []);

  const marcarNivelEnviado = useCallback((nombreNivel: string, idArea: number) => {
    setNivelesConParametros((prev) => {
      const actualizados = { ...prev, [idArea]: [...(prev[idArea] || []), nombreNivel.trim()] };
      return actualizados;
    });
  }, []);

  const limpiarGestionSeleccionada = useCallback(() => {
    setGestionSeleccionada(null);
  }, []);

  /* =======================
     NOMBRE ÁREA SELECCIONADA
     (SIN find en JSX)
  ======================== */
  const nombreAreaSeleccionada = useMemo(
    () => (areaSeleccionada ? (areaMap.get(areaSeleccionada)?.nombre ?? null) : null),
    [areaSeleccionada, areaMap]
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 font-display relative">
      <main className="bg-blanco w-full max-w-6xl rounded-2xl shadow-sombra-3 p-6 sm:p-10 border border-neutro-200 relative">
        <header className="mb-6 sm:mb-10 text-center">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-negro tracking-tight">
            Registro de parámetro de clasificación
          </h1>
        </header>

        <div className="flex flex-col md:flex-row gap-6">
          {/* SECCIÓN IZQUIERDA */}
          <div className="flex-1 space-y-6 relative">
            {/* SELECCIÓN DE ÁREA */}
            <div className="relative border-2 border-principal-500 rounded-xl overflow-visible z-20">
              <button
                onClick={toggleAccordion}
                className="w-full flex justify-between items-center bg-principal-500 hover:bg-principal-600 transition-colors px-3 sm:px-4 py-2 sm:py-3 font-semibold text-white rounded-t-xl text-sm sm:text-base"
              >
                <span>
                  {areaSeleccionada
                    ? `Seleccionar Área: ${nombreAreaSeleccionada}`
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
                  className="absolute left-0 top-full z-20 w-full bg-blanco px-4 sm:px-6 py-3 sm:py-4 border-2 border-principal-500 rounded-b-xl shadow-lg overflow-y-auto transition-all duration-300 text-sm sm:text-base"
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
                          className={`w-full text-left px-3 sm:px-4 py-2 rounded-md border transition-all duration-150 text-sm sm:text-base ${
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
              <h2 className="text-base sm:text-lg font-bold text-negro mb-3">Lista de niveles</h2>
              <div
                className="rounded-lg border border-neutro-300 relative"
                style={{ maxHeight: '200px', overflowY: 'auto', overflowX: 'visible' }}
              >
                <table className="w-full border-collapse text-xs sm:text-sm">
                  <thead className="bg-principal-500 text-blanco sticky top-0 z-10">
                    <tr>
                      <th className="py-2 px-2 sm:px-4 text-left w-16">NRO</th>
                      <th className="py-2 px-2 sm:px-4 text-left w-10">NIVEL</th>
                      <th className="py-2 px-2 sm:px-4 text-center w-24">SELECCIONAR</th>
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
                            : 'Seleccione un área para ver los niveles'}
                        </td>
                      </tr>
                    ) : (
                      niveles.map((nivel, index) => (
                        <tr
                          key={nivel.id}
                          className="group border-t border-neutro-200 transition cursor-pointer hover:bg-neutro-100"
                        >
                          <td className="py-2 px-2 sm:px-4">{index + 1}</td>
                          <td
                            className="py-2 px-2 sm:px-4 relative"
                            onMouseEnter={(e) =>
                              nivel.grados?.length ? handleMouseEnter(e, nivel.grados) : null
                            }
                            onMouseLeave={handleMouseLeave}
                          >
                            {nivel.nombre}
                          </td>
                          <td className="py-2 px-2 sm:px-4 text-center">
                            <input
                              type="checkbox"
                              className="w-4 h-4 sm:w-5 sm:h-5 accent-principal-500"
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
          <div className="flex-1 border-t md:border-t-0 md:border-l border-neutro-300 pt-6 md:pt-0 md:pl-6">
            <Formulario
              nivelesSeleccionados={nivelesSeleccionados}
              idArea={areaSeleccionada ?? 0}
              onCerrar={() => setNivelesSeleccionados([])}
              onMarcarEnviado={marcarNivelEnviado}
              valoresCopiados={valoresCopiados}
              valoresCopiadosManualmente={valoresCopiadosManualmente}
              onLimpiarSeleccion={limpiarGestionSeleccionada}
              onSuccess={(type) => {
                setSuccessType(type);
                setModalSuccessOpen(true);
              }}
              onLimpiarGestionSeleccionada={limpiarGestionSeleccionada}
            />
          </div>
        </div>

        {/* TABLA GESTIONES */}
        <TablaGestiones
          gestionSeleccionada={gestionSeleccionada}
          onSelectGestion={setGestionSeleccionada}
          formularioHabilitado={nivelesSeleccionados.length > 0}
          onCopiarValores={copiarValores}
          nivelesSeleccionados={nivelesSeleccionados}
          areaSeleccionadaNombre={nombreAreaSeleccionada}
          onLimpiarValores={limpiarValoresCopiados}
        />
      </main>

      {/* Tooltip Mejorado */}
      {hoveredGrado.visible && hoveredGrado.grados?.length ? (
        <div
          className="fixed z-[9999] bg-gray-900 text-white text-xs sm:text-sm rounded-lg shadow-lg p-2 sm:p-3 transition-opacity duration-200"
          style={{
            top: hoveredGrado.y,
            left: hoveredGrado.x,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <p className="font-semibold mb-1">Grados:</p>
          <ul className="list-disc pl-4 space-y-1">
            {hoveredGrado.grados
              .slice()
              .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { numeric: true }))
              .map((grado) => (
                <li key={grado.id}>{grado.nombre}</li>
              ))}
          </ul>
        </div>
      ) : null}

      <Modal
        isOpen={modalSuccessOpen}
        onClose={() => setModalSuccessOpen(false)}
        title="¡Registro exitoso!"
        type="success"
      >
        {successType === 'notaYCantidad'
          ? 'La Cantidad máxima y Nota mínima fueron registradas.'
          : 'La Nota mínima fue registrada.'}
      </Modal>
    </div>
  );
};
