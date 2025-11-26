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
import { excelIcon, pdfIcon } from '@/assets';

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
  const [gradoSeleccionado, setGradoSeleccionado] = useState<number[]>([]);
  const [generoSeleccionado, setGeneroSeleccionado] = useState<string[]>([]);
  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState<string[]>([]);
  const [busqueda, setBusqueda] = useState('');

  const responsableId = Number(localStorage.getItem('id_responsable'));
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
      setGradoSeleccionado([]);
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
          const idGrado = gradoSeleccionado.length > 0 ? gradoSeleccionado[0] : 0;

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
        const idGrados = gradoSeleccionado.length > 0 ? gradoSeleccionado : [0];

        for (const idGrado of idGrados) {
          for (const dep of departamentos) {
            const data = await getCompetidoresFiltradosAPI(
              responsableId,
              '0',
              0,
              idGrado, // ✅ Aquí se pasa un solo número, no un array
              generoParam,
              dep ? dep.toLowerCase() : undefined
            );
            competidoresEncontrados.push(...(data.data?.competidores || []));
          }
        }
      }

      if (competidoresEncontrados.length === 0) {
        setMensajeSinCompetidores('No hay competidores registrados');
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
  // ✅ Descargar PDF con filtros aplicados
  const descargarPDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: 'a4',
    });

    doc.setFontSize(18);
    doc.text('Listado de Competidores', 40, 40);

    // 🟢 Preparar texto con los filtros aplicados
    const filtrosTexto = [
      `Áreas: ${
        areasSeleccionadas.length > 0 ? areasSeleccionadas.map((a) => a.nombre).join(', ') : 'Todas'
      }`,
      `Niveles: ${
        Object.values(nivelesSeleccionados).flat().length > 0
          ? Object.values(nivelesSeleccionados).flat().join(', ')
          : 'Todos'
      }`,
      `Grado: ${gradoSeleccionado ? gradoSeleccionado : 'Todos'}`,
      `Género: ${generoSeleccionado.length > 0 ? generoSeleccionado.join(', ') : 'Todos'}`,
      `Departamentos: ${
        departamentoSeleccionado.length > 0 ? departamentoSeleccionado.join(', ') : 'Todos'
      }`,
    ].join(' | ');

    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    doc.text(`Filtros aplicados: ${filtrosTexto}`, 40, 60, { maxWidth: 750 });

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

    // 📄 Ajustar posición de la tabla (debajo del texto de filtros)
    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 80,
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
    // 🟢 Texto con los filtros aplicados (en una sola línea)
    const filtrosTexto = [
      `Áreas: ${
        areasSeleccionadas.length > 0 ? areasSeleccionadas.map((a) => a.nombre).join(', ') : 'Todas'
      }`,
      `Niveles: ${
        Object.values(nivelesSeleccionados).flat().length > 0
          ? Object.values(nivelesSeleccionados).flat().join(', ')
          : 'Todos'
      }`,
      `Grado: ${gradoSeleccionado.length > 0 ? gradoSeleccionado.join(', ') : 'Todos'}`,
      `Género: ${generoSeleccionado.length > 0 ? generoSeleccionado.join(', ') : 'Todos'}`,
      `Departamentos: ${
        departamentoSeleccionado.length > 0 ? departamentoSeleccionado.join(', ') : 'Todos'
      }`,
    ].join(' | ');

    // 🟡 Datos de la tabla
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

    // 🧩 Crear la hoja Excel
    const worksheet = XLSX.utils.json_to_sheet([]);

    // 🔹 Escribir la fila de filtros en la primera fila (celda A1)
    XLSX.utils.sheet_add_aoa(worksheet, [[`Filtros aplicados: ${filtrosTexto}`]], {
      origin: 'A1',
    });

    // 🔹 Escribir los datos comenzando desde la fila 3 (dejamos una fila vacía)
    XLSX.utils.sheet_add_json(worksheet, data, { origin: 'A3', skipHeader: false });

    // 🟢 Ajustar ancho de columnas automáticamente
    const colWidths = Object.keys(data[0] || {}).map((key) => ({
      wch: Math.max(key.length + 2, 15),
    }));
    worksheet['!cols'] = colWidths;

    // 📘 Crear y guardar el libro
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
    <div className="min-h-screen flex items-start justify-center font-display px-3 sm:px-6">
      <main className="bg-blanco w-full max-w-8xl rounded-2xl shadow-lg p-4 sm:p-6 lg:p-10">
        <header className="flex flex-col mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-principal-800 tracking-tight text-center mb-6 animate-fade-in">
            Listado de Competidores
          </h1>

          <div className="flex flex-col lg:flex-row gap-6 w-full">
            <div className="flex-1 flex flex-col gap-4 min-w-0">
              {/* BOTONES SUPERIORES */}
              <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 w-full">
                <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:items-center">
                  <button
                    onClick={handleMostrarTodo}
                    className="flex items-center gap-2 w-full sm:w-[200px] px-5 py-2.5 rounded-xl bg-principal-500 text-white font-semibold 
                  hover:bg-principal-600 transition-all shadow-md hover:shadow-lg"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      className="lucide lucide-eye-icon lucide-eye"
                    >
                      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    Mostrar Todo
                  </button>

                  <button
                    onClick={descargarPDF}
                    className="w-full sm:w-[200px] px-5 py-2.5 rounded-xl border-2 border-principal-500 
                  text-black font-semibold hover:bg-sky-400 transition-all shadow-sm hover:shadow-lg flex items-center gap-2"
                  >
                    <img src={pdfIcon} alt="PDF icon" className="w-5 h-5 object-contain" />
                    PDF
                  </button>

                  <button
                    onClick={descargarExcel}
                    className="w-full sm:w-[200px] px-5 py-2.5 rounded-xl border-2 border-principal-500 
                  text-black font-semibold hover:bg-green-300 transition-all shadow-sm hover:shadow-lg flex items-center gap-2"
                  >
                    <img src={excelIcon} alt="Excel icon" className="w-5 h-5 object-contain" />
                    Excel
                  </button>
                </div>

                {/* columna vacía derecha para mantener layout */}
                <div></div>
              </div>

              {/* FILTROS EN GRID RESPONSIVE */}
              <div
                className="
              grid 
              grid-cols-1 
              place-items-center
              sm:grid-cols-2 
              md:grid-cols-3 
              lg:flex lg:flex-row 
              sm:justify-between 
              gap-2 w-full
            "
              >
                <AccordionArea
                  responsableId={responsableId}
                  selectedAreas={areasSeleccionadas}
                  onChangeSelected={(nuevasAreas) => {
                    setAreasSeleccionadas(nuevasAreas);

                    setNivelesSeleccionados((prev) => {
                      const nuevasClaves = nuevasAreas.map((a) => a.id_area);
                      const actualizadas: { [id_area: number]: number[] } = {};

                      for (const id of nuevasClaves) {
                        if (prev[id]) actualizadas[id] = prev[id];
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
                  selectedAreas={areasSeleccionadas}
                  selectedNiveles={nivelesSeleccionados}
                  selectedGrados={gradoSeleccionado}
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
              </div>

              {/* TABLA */}
              <div className="relative overflow-hidden rounded-lg border border-principal-200 shadow-inner bg-white mt-4">
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
