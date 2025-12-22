import { useEffect, useState, useCallback } from 'react';
import type { Area } from '../types/area-Type';
import {
  getCompetidoresFiltradosAPI,
  getTodosCompetidoresPorResponsableAPI,
} from '../services/competidores-Service';
import type { Competidor } from '../types/competidor-Type';
import { CompetidorListado } from '../types/competidor-listado.type';

interface Orden {
  columna: string;
  ascendente: boolean;
}

interface UseCompetidoresProps {
  responsableId: number;
}

export const useCompetidores = ({ responsableId }: UseCompetidoresProps) => {
  const [areasSeleccionadas, setAreasSeleccionadas] = useState<Area[]>([]);
  const [competidores, setCompetidores] = useState<Competidor[]>([]);
  const [loadingCompetidores, setLoadingCompetidores] = useState(true);
  const [nivelesSeleccionados, setNivelesSeleccionados] = useState<{ [id_area: number]: number[] }>(
    {}
  );
  const [gradoSeleccionado, setGradoSeleccionado] = useState<number[]>([]);
  const [generoSeleccionado, setGeneroSeleccionado] = useState<string[]>([]);
  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState<string[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [orden, setOrden] = useState<Orden>({ columna: '', ascendente: true });
  const [mensajeSinCompetidores, setMensajeSinCompetidores] = useState<string | null>(null);

  const normalizarCompetidor = (c: CompetidorListado): Competidor => ({
    id_competidor: 0,
    grado_escolar: c.grado,
    departamento: c.departamento,
    nombre_tutor: '',
    contacto_tutor: '',
    contacto_emergencia: '',
    id_persona: 0,
    id_institucion: 0,
    id_area: 0,
    id_nivel: 0,
    created_at: '',
    updated_at: '',

    persona: {
      id_persona: 0,
      nombre: c.nombre,
      apellido: c.apellido,
      ci: c.ci,
      genero: c.genero,
      fecha_nac: '',
      telefono: '',
      email: '',
      created_at: '',
      updated_at: '',
    },

    institucion: {
      id_institucion: 0,
      nombre: c.colegio,
      tipo: '',
      departamento: '',
      direccion: '',
      telefono: null,
      email: null,
      id_persona: null,
      created_at: null,
      updated_at: null,
    },

    area: {
      id_area: 0,
      nombre: c.area,
      descripcion: '',
      activo: true,
      created_at: '',
      updated_at: '',
    },

    nivel: {
      id_nivel: 0,
      nombre: c.nivel,
      descripcion: '',
      orden: 0,
      created_at: '',
      updated_at: '',
    },
  });

  const fetchCompetidores = useCallback(async () => {
    try {
      setLoadingCompetidores(true);
      const data = await getTodosCompetidoresPorResponsableAPI(responsableId);
      const normalizados = data?.data?.competidores?.map(normalizarCompetidor) ?? [];
      setCompetidores(normalizados);
      console.log('Competidores:', normalizados);
    } catch (error) {
      console.error('Error al obtener competidores:', error);
      setCompetidores([]);
    } finally {
      setLoadingCompetidores(false);
    }
  }, [responsableId]);

  useEffect(() => {
    fetchCompetidores();
  }, [fetchCompetidores]);

  const handleMostrarTodo = async () => {
    setAreasSeleccionadas([]);
    setNivelesSeleccionados({});
    setGradoSeleccionado([]);
    setGeneroSeleccionado([]);
    setDepartamentoSeleccionado([]);
    setBusqueda('');
    fetchCompetidores();
  };

  const actualizarCompetidores = useCallback(async () => {
    try {
      setLoadingCompetidores(true);
      setMensajeSinCompetidores(null);

      let competidoresEncontrados: Competidor[] = [];

      const generoParam = generoSeleccionado.length === 1 ? generoSeleccionado[0] : '';
      const hayAlgunNivelSeleccionado = Object.values(nivelesSeleccionados).some(
        (arr) => Array.isArray(arr) && arr.length > 0
      );

      const departamentos =
        departamentoSeleccionado.length > 0 ? departamentoSeleccionado : [undefined];

      if (areasSeleccionadas.length > 0) {
        for (const area of areasSeleccionadas) {
          const niveles = nivelesSeleccionados[area.id_area] || [];
          const idGrado = gradoSeleccionado.length > 0 ? gradoSeleccionado[0] : 0;

          if (hayAlgunNivelSeleccionado) {
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
                competidoresEncontrados.push(
                  ...(data.data?.competidores?.map(normalizarCompetidor) || [])
                );
              }
            }
          } else {
            for (const dep of departamentos) {
              const data = await getCompetidoresFiltradosAPI(
                responsableId,
                area.id_area.toString(),
                0,
                idGrado,
                generoParam,
                dep ? dep.toLowerCase() : undefined
              );
              competidoresEncontrados.push(
                ...(data.data?.competidores?.map(normalizarCompetidor) || [])
              );
            }
          }
        }

        competidoresEncontrados = Array.from(
          new Map(
            competidoresEncontrados.filter((c) => c?.persona?.ci).map((c) => [c.persona.ci, c])
          ).values()
        );
      } else {
        const idGrados = gradoSeleccionado.length > 0 ? gradoSeleccionado : [0];
        for (const idGrado of idGrados) {
          for (const dep of departamentos) {
            const data = await getCompetidoresFiltradosAPI(
              responsableId,
              '0',
              0,
              idGrado,
              generoParam,
              dep ? dep.toLowerCase() : undefined
            );
            competidoresEncontrados.push(
              ...(data.data?.competidores?.map(normalizarCompetidor) || [])
            );
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
  }, [
    areasSeleccionadas,
    nivelesSeleccionados,
    gradoSeleccionado,
    generoSeleccionado,
    departamentoSeleccionado,
    responsableId,
  ]);

  useEffect(() => {
    if (
      areasSeleccionadas.length === 0 &&
      gradoSeleccionado.length === 0 &&
      generoSeleccionado.length === 0 &&
      departamentoSeleccionado.length === 0
    ) {
      fetchCompetidores();
    } else {
      actualizarCompetidores();
    }
  }, [
    areasSeleccionadas,
    nivelesSeleccionados,
    gradoSeleccionado,
    generoSeleccionado,
    departamentoSeleccionado,
    fetchCompetidores,
    actualizarCompetidores,
  ]);

  const filtrarCompetidores = useCallback(() => {
    if (!busqueda) return competidores;
    const texto = busqueda.toLowerCase();
    return competidores.filter(
      (c) =>
        c.persona?.nombre.toLowerCase().includes(texto) ||
        c.persona?.apellido.toLowerCase().includes(texto) ||
        c.institucion?.nombre.toLowerCase().includes(texto)
    );
  }, [busqueda, competidores]);

  type ColumnaOrden =
    | 'nombre'
    | 'apellido'
    | 'ci'
    | 'colegio'
    | 'area'
    | 'nivel'
    | 'genero'
    | 'departamento'
    | 'grado';

  const ordenarPorColumna = (columna: ColumnaOrden) => {
    const ascendente = orden.columna === columna ? !orden.ascendente : true;

    const ordenados = [...competidores].sort((a, b) => {
      const map: Record<ColumnaOrden, string> = {
        nombre: a.persona?.nombre || '',
        apellido: a.persona?.apellido || '',
        ci: a.persona?.ci || '',
        colegio: a.institucion?.nombre || '',
        area: a.area?.nombre || '',
        nivel: a.nivel?.nombre || '',
        genero: a.persona?.genero || '',
        departamento: a.departamento || '',
        grado: String(a.grado_escolar),
      };

      const mapB: Record<ColumnaOrden, string> = {
        nombre: b.persona?.nombre || '',
        apellido: b.persona?.apellido || '',
        ci: b.persona?.ci || '',
        colegio: b.institucion?.nombre || '',
        area: b.area?.nombre || '',
        nivel: b.nivel?.nombre || '',
        genero: b.persona?.genero || '',
        departamento: b.departamento || '',
        grado: String(b.grado_escolar),
      };

      return ascendente
        ? map[columna].localeCompare(mapB[columna])
        : mapB[columna].localeCompare(map[columna]);
    });

    setCompetidores(ordenados);
    setOrden({ columna, ascendente });
  };

  return {
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
    busqueda,
    setBusqueda,
    competidores,
    loadingCompetidores,
    filtrarCompetidores,
    ordenarPorColumna,
    orden,
    handleMostrarTodo,
    mensajeSinCompetidores,
  };
};
