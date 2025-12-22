import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
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
  const [loadingCompetidores, setLoadingCompetidores] = useState(false);
  const [nivelesSeleccionados, setNivelesSeleccionados] = useState<Record<number, number[]>>({});
  const [gradoSeleccionado, setGradoSeleccionado] = useState<number[]>([]);
  const [generoSeleccionado, setGeneroSeleccionado] = useState<string[]>([]);
  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState<string[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [orden, setOrden] = useState<Orden>({ columna: '', ascendente: true });
  const [mensajeSinCompetidores, setMensajeSinCompetidores] = useState<string | null>(null);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  /* ================= NORMALIZADOR ================= */
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

  /* ================= FETCH BASE ================= */
  const fetchCompetidores = useCallback(async () => {
    try {
      setLoadingCompetidores(true);
      setMensajeSinCompetidores(null);

      const res = await getTodosCompetidoresPorResponsableAPI(responsableId);
      const normalizados = res?.data?.competidores?.map(normalizarCompetidor) ?? [];

      setCompetidores(normalizados);
    } catch {
      setCompetidores([]);
      setMensajeSinCompetidores('Error al cargar competidores');
    } finally {
      setLoadingCompetidores(false);
    }
  }, [responsableId]);

  const actualizarCompetidores = useCallback(async () => {
    try {
      setLoadingCompetidores(true);
      setMensajeSinCompetidores(null);

      const requests: Promise<any>[] = [];

      const genero = generoSeleccionado.length === 1 ? generoSeleccionado[0] : '';
      const grados = gradoSeleccionado.length ? gradoSeleccionado : [0];
      const deps = departamentoSeleccionado.length > 0 ? departamentoSeleccionado : [undefined];

      if (areasSeleccionadas.length > 0) {
        for (const area of areasSeleccionadas) {
          const niveles = nivelesSeleccionados[area.id_area] || [0];

          for (const nivel of niveles.length ? niveles : [0]) {
            for (const grado of grados) {
              for (const dep of deps) {
                requests.push(
                  getCompetidoresFiltradosAPI(
                    responsableId,
                    area.id_area.toString(),
                    nivel,
                    grado,
                    genero,
                    dep?.toLowerCase()
                  )
                );
              }
            }
          }
        }
      } else {
        for (const grado of grados) {
          for (const dep of deps) {
            requests.push(
              getCompetidoresFiltradosAPI(responsableId, '0', 0, grado, genero, dep?.toLowerCase())
            );
          }
        }
      }

      const responses = await Promise.all(requests);

      const encontrados = responses.flatMap(
        (r) => r?.data?.competidores?.map(normalizarCompetidor) ?? []
      );

      const unicos = Array.from(new Map(encontrados.map((c) => [c.persona.ci, c])).values());

      if (!unicos.length) {
        setMensajeSinCompetidores('No hay competidores registrados');
      }

      setCompetidores(unicos);
    } catch {
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

  /* ================= DEBOUNCE ================= */
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const sinFiltros =
        !areasSeleccionadas.length &&
        !gradoSeleccionado.length &&
        !generoSeleccionado.length &&
        !departamentoSeleccionado.length;

      sinFiltros ? fetchCompetidores() : actualizarCompetidores();
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [
    areasSeleccionadas,
    nivelesSeleccionados,
    gradoSeleccionado,
    generoSeleccionado,
    departamentoSeleccionado,
    fetchCompetidores,
    actualizarCompetidores,
  ]);

  /* ================= FILTRADO MEMO ================= */
  const competidoresFiltrados = useMemo(() => {
    if (!busqueda) return competidores;
    const t = busqueda.toLowerCase();

    return competidores.filter(
      (c) =>
        c.persona.nombre.toLowerCase().includes(t) ||
        c.persona.apellido.toLowerCase().includes(t) ||
        c.institucion.nombre.toLowerCase().includes(t)
    );
  }, [busqueda, competidores]);

  /* ================= ORDEN ================= */
  const ordenarPorColumna = (columna: string) => {
    const asc = orden.columna === columna ? !orden.ascendente : true;

    setCompetidores((prev) =>
      [...prev].sort((a, b) => {
        const A = String(
          (a as any)?.persona?.[columna] ||
            (a as any)?.institucion?.[columna] ||
            (a as any)?.[columna] ||
            ''
        );
        const B = String(
          (b as any)?.persona?.[columna] ||
            (b as any)?.institucion?.[columna] ||
            (b as any)?.[columna] ||
            ''
        );
        return asc ? A.localeCompare(B) : B.localeCompare(A);
      })
    );

    setOrden({ columna, ascendente: asc });
  };

  const handleMostrarTodo = () => {
    setAreasSeleccionadas([]);
    setNivelesSeleccionados({});
    setGradoSeleccionado([]);
    setGeneroSeleccionado([]);
    setDepartamentoSeleccionado([]);
    setBusqueda('');
    fetchCompetidores();
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
    competidoresFiltrados,
    loadingCompetidores,
    ordenarPorColumna,
    orden,
    handleMostrarTodo,
    mensajeSinCompetidores,
  };
};
