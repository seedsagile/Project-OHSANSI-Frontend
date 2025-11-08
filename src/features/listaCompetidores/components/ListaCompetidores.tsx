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
    [area: string]: number | null;
  }>({});
  const [gradoSeleccionado, setGradoSeleccionado] = useState<number | null>(null);
  const [generoSeleccionado, setGeneroSeleccionado] = useState<string | null>(null);
  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState<string | null>(null);

  const responsableId = Number(localStorage.getItem('id_responsable')) || 4;
  console.log('ID del responsable logueado:', responsableId);

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

      // 🔹 Obtener todos los competidores sin filtros
      const data = await getTodosCompetidoresPorResponsableAPI(responsableId);
      setCompetidores(data.data?.competidores || []);

      // 🔹 Resetear todos los filtros
      setAreasSeleccionadas([]);
      setNivelesSeleccionados({});
      setGradoSeleccionado(null);
      setGeneroSeleccionado(null);
      setDepartamentoSeleccionado(null);
    } catch (error) {
      console.error('Error al obtener competidores:', error);
      setCompetidores([]);
    } finally {
      setLoadingCompetidores(false);
    }
  };

  // Función para actualizar competidores según filtros
  const actualizarCompetidores = async () => {
    try {
      setLoadingCompetidores(true);

      // 🔹 Si hay áreas seleccionadas
      if (areasSeleccionadas.length > 0) {
        const resultadosPorArea = await Promise.all(
          areasSeleccionadas.map(async (area) => {
            const idNivel = nivelesSeleccionados[area.nombre] || 0;
            const idGrado = gradoSeleccionado || 0;
            const data = await getCompetidoresFiltradosAPI(
              responsableId,
              area.id_area.toString(),
              idNivel,
              idGrado,
              generoSeleccionado || undefined,
              departamentoSeleccionado || undefined
            );
            return data.data?.competidores || [];
          })
        );

        const todosCompetidores = resultadosPorArea.flat();
        const competidoresUnicos = Array.from(
          new Map(todosCompetidores.map((c) => [c.ci, c])).values()
        );
        setCompetidores(competidoresUnicos);
        return;
      }

      // 🔹 Si NO hay áreas seleccionadas, filtrar solo por grado, genero y departamento
      const data = await getTodosCompetidoresPorResponsableAPI(responsableId);
      let filtrados = data.data?.competidores || [];

      if (gradoSeleccionado) {
        filtrados = filtrados.filter((c: Competidor) => Number(c.grado) === gradoSeleccionado);
      }
      if (generoSeleccionado) {
        filtrados = filtrados.filter((c: Competidor) => c.genero === generoSeleccionado);
      }
      if (departamentoSeleccionado) {
        filtrados = filtrados.filter(
          (c: Competidor) => c.departamento === departamentoSeleccionado
        );
      }

      setCompetidores(filtrados);
    } catch (error) {
      console.error('Error al actualizar competidores:', error);
      setCompetidores([]);
    } finally {
      setLoadingCompetidores(false);
    }
  };

  // 🔹 Llamar automáticamente a actualizarCompetidores cuando cambian los filtros
  useEffect(() => {
    if (areasSeleccionadas.length > 0) {
      actualizarCompetidores();
    }
  }, [
    areasSeleccionadas,
    nivelesSeleccionados,
    gradoSeleccionado,
    generoSeleccionado,
    departamentoSeleccionado,
  ]);

  return (
    <div className="min-h-screen flex items-start justify-center  font-display">
      <main className="bg-blanco w-full max-w-8xl rounded-2xl shadow-lg p-6 md:p-10">
        <header className="flex flex-col mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-principal-800 tracking-tight text-center mb-6 animate-fade-in">
            Listado de Competidores
          </h1>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Panel izquierdo: Filtros y botones */}
            <div className="flex flex-col space-y-4 ">
              <button
                onClick={handleMostrarTodo}
                className="w-full px-6 py-2.5 rounded-lg bg-principal-500 text-blanco font-semibold hover:bg-principal-600 transition-colors flex items-center justify-center"
              >
                Mostrar Todo
              </button>

              <AccordionArea
                responsableId={responsableId}
                selectedAreas={areasSeleccionadas}
                onChangeSelected={setAreasSeleccionadas}
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
                selectedDepartamento={departamentoSeleccionado}
                onChangeSelected={setDepartamentoSeleccionado}
              />

              <button className="w-full px-6 py-2.5 rounded-lg bg-principal-500 text-blanco font-semibold hover:bg-principal-600 transition-colors">
                Descargar PDF
              </button>

              <button className="w-full px-6 py-2.5 rounded-lg bg-principal-500 text-blanco font-semibold hover:bg-principal-600 transition-colors">
                Descargar EXCEL
              </button>
            </div>

            {/* Panel derecho: Buscador + Tabla con scroll interno */}
            <div className="flex-1 flex flex-col gap-4 min-w-0">
              {/* Buscador */}
              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <input
                  type="text"
                  placeholder="Buscar: nombre, apellido, colegio"
                  className="w-full sm:w-72 px-4 py-2 rounded-xl border-2 border-principal-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-principal-300 transition"
                />
                <button className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-principal-500 text-blanco font-semibold hover:bg-principal-600 transition-colors whitespace-nowrap">
                  Buscar
                </button>
              </div>

              {/* Tabla con scroll interno elegante */}
              <div className="relative overflow-hidden rounded-lg border border-principal-200 shadow-inner bg-white">
                <div className="overflow-auto max-h-[600px] scrollbar-thin scrollbar-thumb-principal-400 scrollbar-track-principal-100">
                  <table className="w-full min-w-[900px] table-auto border-collapse text-sm md:text-base">
                    <thead className="bg-principal-500 text-white sticky top-0 z-10 shadow-md">
                      <tr>
                        {[
                          'Apellido',
                          'Nombre',
                          'Género',
                          'Departamento',
                          'Colegio',
                          'CI',
                          'Área',
                          'Nivel',
                          'Grado',
                        ].map((header) => (
                          <th
                            key={header}
                            className="px-3 py-3 text-left font-semibold border-r border-principal-400 last:border-r-0 whitespace-nowrap"
                          >
                            {header}
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
                      ) : competidores.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                            No hay competidores registrados
                          </td>
                        </tr>
                      ) : (
                        competidores.map((c, i) => (
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

              {/* Indicador de scroll horizontal en móviles */}
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
