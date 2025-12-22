import { Globe } from 'lucide-react';
import { excelIcon, pdfIcon } from '@/assets';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { AccordionArea } from '../components/AccordionArea';
import { AccordionNivel } from '../components/AccordionNivel';
import { AccordionGrado } from '../components/AccordionGrado';
import { AccordionDepartamento } from '../components/AccordionDepartamento';
import { AccordionGenero } from '../components/AccordionGenero';
import { useCompetidores } from '../hooks/useCompetidores';

export const CompetidoresPage = () => {
  const responsableId = Number(localStorage.getItem('id_responsable'));

  const {
    areasSeleccionadas,
    setAreasSeleccionadas,
    nivelesSeleccionados,
    setNivelesSeleccionados,
    gradoSeleccionado,
    setGradoSeleccionado,
    generoSeleccionado,
    setGeneroSeleccionado,
    departamentoSeleccionado,
    setDepartamentoSeleccionado,
    loadingCompetidores,
    filtrarCompetidores,
    ordenarPorColumna,
    orden,
    handleMostrarTodo,
    mensajeSinCompetidores,
  } = useCompetidores({ responsableId });

  // 🔹 Funciones de exportación
  const descargarPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    doc.setFontSize(18);
    doc.text('Listado de Competidores', 40, 40);

    const filtrosTexto = [
      `Áreas: ${areasSeleccionadas.length > 0 ? areasSeleccionadas.map((a) => a.nombre).join(', ') : 'Todas'}`,
      `Niveles: ${Object.values(nivelesSeleccionados).flat().length > 0 ? Object.values(nivelesSeleccionados).flat().join(', ') : 'Todos'}`,
      `Grado: ${gradoSeleccionado.length > 0 ? gradoSeleccionado.join(', ') : 'Todos'}`,
      `Género: ${generoSeleccionado.length > 0 ? generoSeleccionado.join(', ') : 'Todos'}`,
      `Departamentos: ${departamentoSeleccionado.length > 0 ? departamentoSeleccionado.join(', ') : 'Todos'}`,
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
      c.persona.apellido,
      c.persona.nombre,
      c.persona.genero || '-',
      c.departamento || '-',
      c.institucion.nombre || '-',
      c.persona.ci,
      c.area.nombre,
      c.nivel.nombre,
      c.grado_escolar,
    ]);

    autoTable(doc, { head: [columns], body: rows, startY: 80, theme: 'grid' });
    doc.save('competidores.pdf');
  };

  const descargarExcel = () => {
    const filtrosTexto = [
      `Áreas: ${areasSeleccionadas.length > 0 ? areasSeleccionadas.map((a) => a.nombre).join(', ') : 'Todas'}`,
      `Niveles: ${Object.values(nivelesSeleccionados).flat().length > 0 ? Object.values(nivelesSeleccionados).flat().join(', ') : 'Todos'}`,
      `Grado: ${gradoSeleccionado.length > 0 ? gradoSeleccionado.join(', ') : 'Todos'}`,
      `Género: ${generoSeleccionado.length > 0 ? generoSeleccionado.join(', ') : 'Todos'}`,
      `Departamentos: ${departamentoSeleccionado.length > 0 ? departamentoSeleccionado.join(', ') : 'Todos'}`,
    ].join(' | ');

    const data = filtrarCompetidores().map((c) => ({
      Apellido: c.persona.apellido,
      Nombre: c.persona.nombre,
      Género: c.persona.genero || '-',
      Departamento: c.departamento || '-',
      Colegio: c.institucion.nombre || '-',
      CI: c.persona.ci,
      Área: c.area.nombre,
      Nivel: c.nivel.nombre,
      Grado: c.grado_escolar,
    }));

    const worksheet = XLSX.utils.json_to_sheet([]);
    XLSX.utils.sheet_add_aoa(worksheet, [[`Filtros aplicados: ${filtrosTexto}`]], { origin: 'A1' });
    XLSX.utils.sheet_add_json(worksheet, data, { origin: 'A3', skipHeader: false });

    const colWidths = Object.keys(data[0] || {}).map((key) => ({
      wch: Math.max(key.length + 2, 15),
    }));
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Competidores');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'competidores.xlsx');
  };
  const columnasOrdenables = [
    'apellido',
    'nombre',
    'genero',
    'departamento',
    'colegio',
    'ci',
    'area',
    'nivel',
    'grado',
  ] as const;

  type ColumnaTabla = (typeof columnasOrdenables)[number];

  return (
    <div className="min-h-screen  flex items-start justify-center font-display px-3 sm:px-6">
      <main className="bg-blanco flex flex-col items-center w-full max-w-8xl rounded-2xl shadow-lg p-4 sm:p-6 lg:p-10">
        <header className="flex  flex-col mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-principal-800 tracking-tight text-center mb-6 animate-fade-in">
            Listado de Competidores
          </h1>

          <div className="flex flex-col max-w-[300px] sm:max-w-[700px] lg:max-w-[1200px] lg:flex-row gap-6 mx-auto">
            <div className="flex flex-col gap-4 w-full">
              <div className="flex gap-4 ">
                <div className="flex flex-col content-start sm:flex-col lg:flex:row lg:flex-row gap-3 lg:items-center w-60 lg:w-full">
                  <button
                    onClick={handleMostrarTodo}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-principal-500 text-white font-semibold hover:bg-principal-600 transition-all shadow-md hover:shadow-lg"
                  >
                    <Globe size={20} />
                    Mostrar Todo
                  </button>

                  <button
                    onClick={descargarPDF}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-principal-500 text-black font-semibold hover:bg-acento-50 hover:text-acento-700 hover:border-acento-300 transition-all shadow-sm hover:shadow-lg"
                  >
                    <img src={pdfIcon} alt="PDF icon" className="w-5 h-5 object-contain" />
                    PDF
                  </button>

                  <button
                    onClick={descargarExcel}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-principal-500 text-black font-semibold hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-all shadow-sm hover:shadow-lg"
                  >
                    <img src={excelIcon} alt="Excel icon" className="w-5 h-5 object-contain" />
                    Excel
                  </button>
                </div>

                <div></div>
              </div>

              <div className="flex flex-col lg:flex lg:flex-row sm:justify-between gap-2 w-ful">
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

              <div className="relative max-w-full max-h-[600px] rounded-lg border border-principal-200 shadow-inner bg-white mt-4">
                <div className="overflow-x-auto overflow-y-auto w-full h-full scrollbar-thin scrollbar-thumb-principal-400 scrollbar-track-principal-100">
                  <table className="min-w-[900px] w-full table-auto border-collapse text-sm md:text-base">
                    <thead className="bg-principal-500 text-white sticky z-10 shadow-md">
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
                            onClick={() => ordenarPorColumna(header as ColumnaTabla)}
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
                              {c.persona.apellido}
                            </td>
                            <td className="px-3 py-3 border-r border-principal-100">
                              {c.persona.nombre}
                            </td>
                            <td className="px-3 py-3 border-r border-principal-100">
                              {c.persona.genero || '-'}
                            </td>
                            <td className="px-3 py-3 border-r border-principal-100">
                              {c.departamento || '-'}
                            </td>
                            <td className="px-3 py-3 border-r border-principal-100">
                              {c.institucion.nombre || '-'}
                            </td>
                            <td className="px-3 py-3 border-r border-principal-100">
                              {c.persona.ci}
                            </td>
                            <td className="px-3 py-3 border-r border-principal-100">
                              {c.area.nombre}
                            </td>
                            <td className="px-3 py-3 border-r border-principal-100">
                              {c.nivel.nombre}
                            </td>
                            <td className="px-3 py-3">{c.grado_escolar}</td>
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
