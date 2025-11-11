// src/features/listaCompetidores/components/ListaCompetidores.tsx
import { useEffect, useState } from 'react';
import {
  getCompetidoresFiltradosAPI,
  getTodosCompetidoresPorResponsableAPI,
} from '../service/service';
import type { Area } from '../interface/interface';
import { AccordionArea } from './AccordionArea';
import { AccordionNivel } from './AccordionNivel';
import { AccordionGrado } from './AccordionGrado';
import { AccordionDepartamento } from './AccordionDepartamento';
import { AccordionGenero } from './AccordionGenero';

import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface Competidor {
  apellido: string;
  nombre: string;
  genero: string;
  ci: string;
  departamento: string;
  colegio: string;
  area: string;
  nivel: string;
  grado: string;
}

export const ListaCompetidores = () => {
  const [areasSeleccionadas, setAreasSeleccionadas] = useState<Area[]>([]);
  const [competidores, setCompetidores] = useState<Competidor[]>([]);
  const [loadingCompetidores, setLoadingCompetidores] = useState(true);
  const [nivelesSeleccionados, setNivelesSeleccionados] = useState<{
    [id_area: number]: number[];
  }>({});
  const [gradoSeleccionado, setGradoSeleccionado] = useState<number | null>(null);
  const [generoSeleccionado, setGeneroSeleccionado] = useState<string[]>([]);
  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState<string[]>([]);
  const [busqueda, setBusqueda] = useState('');

  const responsableId = Number(localStorage.getItem('id_responsable')) || 4;
  console.log('ID del responsable logueado:', responsableId);

  const [orden, setOrden] = useState<{ columna: string; ascendente: boolean }>({
    columna: '',
    ascendente: true,
  });

  const [mensajeSinCompetidores, setMensajeSinCompetidores] = useState<string | null>(null);

  // Cargar competidores al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingCompetidores(true);
        const data = await getTodosCompetidoresPorResponsableAPI(responsableId);
        setCompetidores(data.data?.competidores || []);
      } catch (error) {
        console.error('Error al obtener competidores:', error);
        setCompetidores([]);
      } finally {
        setLoadingCompetidores(false);
      }
    };

    fetchData();
  }, [responsableId]);

  // Mostrar todos los competidores
  const handleMostrarTodo = async () => {
    try {
      setLoadingCompetidores(true);
      const data = await getTodosCompetidoresPorResponsableAPI(responsableId);
      setCompetidores(data.data?.competidores || []);

      setAreasSeleccionadas([]);
      setNivelesSeleccionados({});
      setGradoSeleccionado(null);
      setGeneroSeleccionado([]);
      setDepartamentoSeleccionado([]);
      setBusqueda('');
    } catch (error) {
      console.error('Error al obtener competidores:', error);
      setCompetidores([]);
    } finally {
      setLoadingCompetidores(false);
    }
  };

  // Actualizar competidores según filtros
  // Actualizar competidores según filtros (versión corregida)
  // ✅ Actualizar competidores según filtros (versión con múltiples departamentos)
  const actualizarCompetidores = async () => {
    try {
      setLoadingCompetidores(true);
      setMensajeSinCompetidores(null);

      let competidoresEncontrados: Competidor[] = [];

      // ✅ Parámetro de género correcto
      const generoParam = generoSeleccionado.length === 1 ? generoSeleccionado[0] : '';

      const hayAlgunNivelSeleccionado = Object.values(nivelesSeleccionados).some(
        (arr) => Array.isArray(arr) && arr.length > 0
      );

      // ✅ Determinar departamentos a recorrer
      const departamentos =
        departamentoSeleccionado.length > 0 ? departamentoSeleccionado : [undefined]; // si no hay ninguno, se llama sin parámetro

      if (areasSeleccionadas.length > 0) {
        // 🔹 Con áreas seleccionadas
        for (const area of areasSeleccionadas) {
          const niveles = nivelesSeleccionados[area.id_area] || [];
          const idGrado = gradoSeleccionado || 0;

          if (hayAlgunNivelSeleccionado) {
            // ---------- CASO A: hay niveles seleccionados ----------
            if (!niveles || niveles.length === 0) continue;

            for (const nivel of niveles) {
              for (const dep of departamentos) {
                const data = await getCompetidoresFiltradosAPI(
                  responsableId,
                  area.id_area.toString(),
                  nivel,
                  idGrado,
                  generoParam,
                  dep ? dep.toLowerCase() : undefined
                );
                competidoresEncontrados.push(...(data.data?.competidores || []));
              }
            }
          } else {
            // ---------- CASO B: sin niveles seleccionados ----------
            for (const dep of departamentos) {
              const data = await getCompetidoresFiltradosAPI(
                responsableId,
                area.id_area.toString(),
                0,
                idGrado,
                generoParam,
                dep ? dep.toLowerCase() : undefined
              );
              competidoresEncontrados.push(...(data.data?.competidores || []));
            }
          }
        }

        // Eliminar duplicados por CI
        competidoresEncontrados = Array.from(
          new Map(competidoresEncontrados.map((c) => [c.ci, c])).values()
        );
      } else {
        // ---------- CASO C: sin áreas seleccionadas ----------
        const idGrado = gradoSeleccionado || 0;

        for (const dep of departamentos) {
          const data = await getCompetidoresFiltradosAPI(
            responsableId,
            '0',
            0,
            idGrado,
            generoParam,
            dep ? dep.toLowerCase() : undefined
          );
          competidoresEncontrados.push(...(data.data?.competidores || []));
        }
      }

      if (competidoresEncontrados.length === 0) {
        setMensajeSinCompetidores('No hay competidores registrados en el nivel seleccionado');
      }

      setCompetidores(competidoresEncontrados);
    } catch (error) {
      console.error('Error al actualizar competidores:', error);
      setCompetidores([]);
      setMensajeSinCompetidores('Error al cargar competidores');
    } finally {
      setLoadingCompetidores(false);
    }
  };

  // Llamar a actualizarCompetidores cuando cambian los filtros
  useEffect(() => {
    const actualizar = async () => {
      // 🟢 Si no hay áreas seleccionadas ni otros filtros -> mostrar todo
      if (
        areasSeleccionadas.length === 0 &&
        !gradoSeleccionado &&
        !generoSeleccionado &&
        !departamentoSeleccionado
      ) {
        try {
          setLoadingCompetidores(true);
          const data = await getTodosCompetidoresPorResponsableAPI(responsableId);
          setCompetidores(data.data?.competidores || []);
        } catch (error) {
          console.error('Error al obtener competidores:', error);
          setCompetidores([]);
        } finally {
          setLoadingCompetidores(false);
        }
      } else {
        // 🔹 Si hay algún filtro aplicado -> filtrar normalmente
        actualizarCompetidores();
      }
    };

    actualizar();
  }, [
    areasSeleccionadas,
    nivelesSeleccionados,
    gradoSeleccionado,
    generoSeleccionado,
    departamentoSeleccionado,
  ]);

  // Función de búsqueda local
  const filtrarCompetidores = () => {
    if (!busqueda) return competidores;
    const texto = busqueda.toLowerCase();
    return competidores.filter(
      (c) =>
        c.nombre.toLowerCase().includes(texto) ||
        c.apellido.toLowerCase().includes(texto) ||
        c.colegio.toLowerCase().includes(texto)
    );
  };

  // Función para descargar PDF
  const descargarPDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: 'a4',
    });

    doc.setFontSize(18);
    doc.text('Listado de Competidores', 40, 40);

    const columns = [
      'Apellido',
      'Nombre',
      'Género',
      'Departamento',
      'Colegio',
      'CI',
      'Área',
      'Nivel',
      'Grado',
    ];

    const rows = filtrarCompetidores().map((c) => [
      c.apellido,
      c.nombre,
      c.genero || '-',
      c.departamento || '-',
      c.colegio || '-',
      c.ci,
      c.area,
      c.nivel,
      c.grado,
    ]);

    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 60,
      styles: {
        fontSize: 10,
        cellPadding: 5,
        halign: 'left',
        valign: 'middle',
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      theme: 'grid',
    });

    doc.save('competidores.pdf');
  };

  const descargarExcel = () => {
    const data = filtrarCompetidores().map((c) => ({
      Apellido: c.apellido,
      Nombre: c.nombre,
      Género: c.genero || '-',
      Departamento: c.departamento || '-',
      Colegio: c.colegio || '-',
      CI: c.ci,
      Área: c.area,
      Nivel: c.nivel,
      Grado: c.grado,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Competidores');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'competidores.xlsx');
  };

  const ordenarPorColumna = (columna: keyof Competidor) => {
    const ascendente = orden.columna === columna ? !orden.ascendente : true;
    const competidoresOrdenados = [...competidores].sort((a, b) => {
      const valorA = a[columna] ?? '';
      const valorB = b[columna] ?? '';

      if (!isNaN(Number(valorA)) && !isNaN(Number(valorB))) {
        // Orden numérico
        return ascendente ? Number(valorA) - Number(valorB) : Number(valorB) - Number(valorA);
      } else {
        // Orden alfabético
        return ascendente
          ? String(valorA).localeCompare(String(valorB))
          : String(valorB).localeCompare(String(valorA));
      }
    });

    setCompetidores(competidoresOrdenados);
    setOrden({ columna, ascendente });
  };

  return (
    <div className="min-h-screen flex items-start justify-center font-display">
      <main className="bg-blanco w-full max-w-8xl rounded-2xl shadow-lg p-6 md:p-10">
        <header className="flex flex-col mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-principal-800 tracking-tight text-center mb-6 animate-fade-in">
            Listado de Competidores
          </h1>

          <div className="flex flex-col lg:flex-row gap-6 ">
            <div className="flex flex-col space-y-4 px-10 ">
              <button
                onClick={handleMostrarTodo}
                className="w-full px-6 py-2.5 rounded-lg bg-principal-500 text-blanco font-semibold hover:bg-principal-600 transition-colors flex items-center justify-center"
              >
                Mostrar Todo
              </button>

              <AccordionArea
                responsableId={responsableId}
                selectedAreas={areasSeleccionadas}
                onChangeSelected={(nuevasAreas) => {
                  // 🔹 Actualiza áreas
                  setAreasSeleccionadas(nuevasAreas);

                  // 🔹 Limpia niveles de las áreas que fueron deseleccionadas
                  setNivelesSeleccionados((prev) => {
                    const nuevasClaves = nuevasAreas.map((a) => a.id_area);
                    const actualizadas: { [id_area: number]: number[] } = {};

                    // Solo mantiene los niveles de áreas aún seleccionadas
                    for (const id of nuevasClaves) {
                      if (prev[id]) {
                        actualizadas[id] = prev[id];
                      }
                    }

                    return actualizadas;
                  });
                }}
              />

              <AccordionNivel
                selectedAreas={areasSeleccionadas}
                selectedNiveles={nivelesSeleccionados}
                onChangeSelected={setNivelesSeleccionados}
              />

              <AccordionGrado
                selectedGrado={gradoSeleccionado}
                onChangeSelected={setGradoSeleccionado}
              />

              <AccordionGenero
                selectedGenero={generoSeleccionado}
                onChangeSelected={setGeneroSeleccionado}
              />

              <AccordionDepartamento
                selectedDepartamentos={departamentoSeleccionado}
                onChangeSelected={setDepartamentoSeleccionado}
              />

              <button
                onClick={descargarPDF}
                className="w-full hover:bg-acento-400 px-6 py-2.5 rounded-lg bg-principal-500 text-blanco font-semibold  transition-colors"
              >
                Descargar PDF
              </button>

              <button
                onClick={descargarExcel}
                className="w-full hover:bg-acento-400 px-6 py-2.5 rounded-lg bg-principal-500 text-blanco font-semibold  transition-colors"
              >
                Descargar EXCEL
              </button>
            </div>

            <div className="flex-1 flex flex-col gap-4 min-w-0">
              {/* Buscador */}
              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <input
                  type="text"
                  placeholder="Buscar: nombre, apellido, colegio"
                  value={busqueda}
                  maxLength={20}
                  onChange={(e) => {
                    const valor = e.target.value;
                    // Permite letras (con acentos), números y espacios
                    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s]*$/;
                    if (regex.test(valor)) {
                      setBusqueda(valor);
                    }
                  }}
                  className="w-full sm:w-72 px-4 py-2 rounded-xl border-2 border-principal-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-principal-300 transition"
                />

                <button
                  onClick={() => {}}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-principal-500 text-blanco font-semibold hover:bg-principal-600 transition-colors whitespace-nowrap"
                >
                  Buscar
                </button>
              </div>

              <div className="relative overflow-hidden rounded-lg border border-principal-200 shadow-inner bg-white">
                <div className="overflow-auto max-h-[600px] scrollbar-thin scrollbar-thumb-principal-400 scrollbar-track-principal-100">
                  <table className="w-full min-w-[900px] table-auto border-collapse text-sm md:text-base">
                    <thead className="bg-principal-500 text-white sticky top-0 z-10 shadow-md">
                      <tr>
                        {[
                          'apellido',
                          'nombre',
                          'genero',
                          'departamento',
                          'colegio',
                          'ci',
                          'area',
                          'nivel',
                          'grado',
                        ].map((header) => (
                          <th
                            key={header}
                            onClick={() => ordenarPorColumna(header as keyof Competidor)}
                            className="px-3 hover:bg-acento-400 py-3 text-left font-semibold border-r border-principal-400 last:border-r-0 whitespace-nowrap cursor-pointer select-none"
                          >
                            <div className="flex items-center justify-between">
                              <span>{header.charAt(0).toUpperCase() + header.slice(1)}</span>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className={`ml-2 transition-transform ${
                                  orden.columna === header
                                    ? orden.ascendente
                                      ? 'rotate-180'
                                      : ''
                                    : ''
                                }`}
                              >
                                <path d="m21 16-4 4-4-4" />
                                <path d="M17 20V4" />
                                <path d="m3 8 4-4 4 4" />
                                <path d="M7 4v16" />
                              </svg>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {loadingCompetidores ? (
                        <tr>
                          <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                            <div className="flex justify-center items-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-principal-500"></div>
                              <span className="ml-3">Cargando competidores...</span>
                            </div>
                          </td>
                        </tr>
                      ) : filtrarCompetidores().length === 0 ? (
                        <tr>
                          <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                            {mensajeSinCompetidores || 'No hay competidores disponibles.'}
                          </td>
                        </tr>
                      ) : (
                        filtrarCompetidores().map((c, i) => (
                          <tr
                            key={i}
                            className={`border-b border-principal-100 transition-colors ${
                              i % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                            } hover:bg-principal-50`}
                          >
                            <td className="px-3 py-3 border-r border-principal-100">
                              {c.apellido}
                            </td>
                            <td className="px-3 py-3 border-r border-principal-100">{c.nombre}</td>
                            <td className="px-3 py-3 border-r border-principal-100">
                              {c.genero || '-'}
                            </td>
                            <td className="px-3 py-3 border-r border-principal-100">
                              {c.departamento || '-'}
                            </td>
                            <td className="px-3 py-3 border-r border-principal-100">
                              {c.colegio || '-'}
                            </td>
                            <td className="px-3 py-3 border-r border-principal-100">{c.ci}</td>
                            <td className="px-3 py-3 border-r border-principal-100">{c.area}</td>
                            <td className="px-3 py-3 border-r border-principal-100">{c.nivel}</td>
                            <td className="px-3 py-3">{c.grado}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="block lg:hidden text-center text-xs text-gray-500 mt-2">
                ← Desliza para ver más columnas →
              </div>
            </div>
          </div>
        </header>
      </main>
    </div>
  );
};
