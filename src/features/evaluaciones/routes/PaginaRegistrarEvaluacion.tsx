import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/auth/login/hooks/useAuth';
import { useEvaluaciones } from '../hooks/useEvaluaciones';
import { AreaNivelSelector } from '../components/AreaNivelSelector';
import { SearchBar } from '../components/SearchBar';
import { CompetidoresTable } from '../components/CompetidoresTable';
import { CalificacionModal } from '../components/CalificacionModal';
import { ModificarNotaModal } from '../components/ModificarNotaModal';
import { DescalificarModal } from '../components/DescalificarModal';
import type { Competidor, Competencia } from '../types/evaluacion.types';
import { formatearNombreCompleto, esBusquedaValida } from '../utils/validations';
import toast from 'react-hot-toast';
import { evaluacionService } from '../services/evaluacionService';

export function PaginaRegistrarEvaluacion() {
  const { user, userId } = useAuth();
  const {
    areas,
    competidores,
    loading,
    loadingCompetidores,
    cargarCompetidores,
    actualizarEstadosCompetidores,
    iniciarEvaluacion,
    guardarEvaluacion,
    modificarNota,
    setCompetencia,
    descalificarCompetidor,
  } = useEvaluaciones();

  const [selectedArea, setSelectedArea] = useState('');
  const [selectedNivel, setSelectedNivel] = useState('');
  const [selectedCompetencia, setSelectedCompetencia] = useState('');
  const [selectedExamen, setSelectedExamen] = useState('');
  const [competencias, setCompetencias] = useState<Competencia[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompetidor, setSelectedCompetidor] = useState<Competidor | null>(null);
  const [competidorAEditar, setCompetidorAEditar] = useState<Competidor | null>(null);
  const [competidorADescalificar, setCompetidorADescalificar] = useState<Competidor | null>(null);
  const [filteredCompetidores, setFilteredCompetidores] = useState<Competidor[]>([]);
  const [competidorEnModal, setCompetidorEnModal] = useState<string | null>(null);

  const isEvaluador = user?.role === 'evaluador';

  const areasOrdenadas = useMemo(() =>
    Array.isArray(areas)
      ? [...areas].sort((a, b) => a.nombre_area.localeCompare(b.nombre_area))
      : [],
    [areas]
  );

  const areaSeleccionada = useMemo(() =>
    areasOrdenadas.find(a => a.id_area.toString() === selectedArea),
    [areasOrdenadas, selectedArea]
  );

  const nivelSeleccionado = useMemo(() =>
    areaSeleccionada?.niveles?.find(
      n => n.id_nivel.toString() === selectedNivel
    ),
    [areaSeleccionada, selectedNivel]
  );

  useEffect(() => {
    const idAreaNivel = nivelSeleccionado?.id_area_nivel;

    const fetchCompetencias = async () => {
      if (idAreaNivel) {
        const toastId = toast.loading('Cargando competencias...');
        try {
          const data = await evaluacionService.getCompetenciasPorAreaNivel(idAreaNivel);
          setCompetencias(data);
          toast.dismiss(toastId);
          toast.success('Competencias cargadas');
        } catch (error) {
          console.error("Error al cargar competencias", error);
          toast.dismiss(toastId);
          toast.error('Error al cargar competencias');
        }
      } else {
        setSelectedCompetencia('');
        setSelectedExamen('');
        setCompetencias([]);
      }
    };

    fetchCompetencias();
  }, [nivelSeleccionado?.id_area_nivel]);

  const handleCompetenciaChange = (idCompetencia: string) => {
    setSelectedCompetencia(idCompetencia);
    setSelectedExamen('');
    setCompetencia(idCompetencia ? Number(idCompetencia) : null);
  };

  useEffect(() => {
    let resultados = competidores;

    if (esBusquedaValida(searchTerm)) {
      resultados = competidores.filter((c) => {
        const nombreCompleto = formatearNombreCompleto(c.nombre, c.apellido).toLowerCase();
        return nombreCompleto.includes(searchTerm.toLowerCase());
      });
    }

    if (competidorEnModal) {
      resultados = resultados.map(c =>
        c.ci === competidorEnModal
          ? { ...c, estado: 'En Proceso' as const }
          : c
      );
    }

    setFilteredCompetidores(resultados);
  }, [competidores, searchTerm, competidorEnModal]);

  useEffect(() => {
    console.log('Competitor loading effect triggered.');
    if (selectedArea && selectedNivel && selectedCompetencia) {
      const idArea = parseInt(selectedArea, 10);
      const idNivel = parseInt(selectedNivel, 10);
      const idCompetencia = parseInt(selectedCompetencia, 10);

      if (!isNaN(idArea) && !isNaN(idNivel) && !isNaN(idCompetencia)) {
        console.log(`Calling cargarCompetidores with: idCompetencia=${idCompetencia}, idArea=${idArea}, idNivel=${idNivel}`);
        cargarCompetidores(idCompetencia, idArea, idNivel);
      }
    } else {
      console.log('Clearing competitors list.');
      setFilteredCompetidores([]);
    }
  }, [selectedArea, selectedNivel, selectedCompetencia]);

  useEffect(() => {
    if (!selectedCompetencia) return;

    const interval = setInterval(() => {
      actualizarEstadosCompetidores();
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedCompetencia, actualizarEstadosCompetidores]);

  const handleCalificar = async (competidor: Competidor, idExamen: number) => {
    if (!selectedExamen) {
      toast.error('Por favor, seleccione un examen para calificar.');
      return;
    }

    const idAreaNivel = nivelSeleccionado?.id_area_nivel;
    if (!idAreaNivel) {
      toast.error('El nivel seleccionado no es válido o no tiene un ID de asignación.');
      return;
    }

    if (competidor.estado === 'Calificado') {
      toast.error('Este competidor ya ha sido calificado');
      return;
    }

    if (competidor.estado === 'En Proceso') {
      if (competidor.bloqueado_por?.toString() === userId?.toString()) {
        setSelectedCompetidor(competidor);
        setCompetidorEnModal(competidor.ci);
        return;
      } else {
        toast.error('Este competidor está siendo calificado por otro evaluador');
        return;
      }
    }

    setCompetidorEnModal(competidor.ci);

    const resultado = await iniciarEvaluacion(competidor, idExamen, idAreaNivel);

    if (resultado.success) {
      const competidorActualizado = competidores.find(c => c.ci === competidor.ci);
      if (competidorActualizado) {
        setSelectedCompetidor(competidorActualizado);
      }
    } else {
      setCompetidorEnModal(null);
    }
  };

  const handleEditarNota = async (competidor: Competidor) => {
    setCompetidorEnModal(competidor.ci);
    setCompetidorAEditar(competidor);
  };

  const handleDescalificar = (competidor: Competidor) => {
    setCompetidorADescalificar(competidor);
  };

  const handleCloseModal = () => {
    if (window.confirm('¿Estás seguro de que quieres salir? La calificación no se ha guardado.')) {
      if (window.confirm('¡ALERTA! Si sales ahora, otro evaluador podría tomar a este competidor. ¿Estás completamente seguro?')) {
        setSelectedCompetidor(null);
        setCompetidorEnModal(null);
        actualizarEstadosCompetidores();
      }
    }
  };

  const handleCloseModalEdicion = () => {
    setCompetidorAEditar(null);
    setCompetidorEnModal(null);
    actualizarEstadosCompetidores();
  };

  const handleCloseModalDescalificar = () => {
    setCompetidorADescalificar(null);
    actualizarEstadosCompetidores();
  };

  if (!isEvaluador) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-red-800 mb-2">Acceso Denegado</h2>
          <p className="text-red-600">
            No tienes permisos para acceder a esta sección.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="ml-4 text-gray-500">Cargando áreas y niveles asignados...</p>
        </div>
      </div>
    );
  }

  if (areasOrdenadas.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">Registrar Evaluación</h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-yellow-800 mb-2">
            No tienes áreas asignadas
          </h2>
          <p className="text-yellow-600">
            Contacta al administrador para que te asigne áreas y niveles para evaluar.
          </p>
        </div>
      </div>
    );
  }

  console.log('Competidores from hook:', competidores);
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Registrar Evaluación</h1>
        <p className="text-gray-600 mt-2">
          Evaluador: <span className="font-semibold">{user?.nombre} {user?.apellido}</span>
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Selección de Prueba</h2>

        <AreaNivelSelector
          areas={areasOrdenadas}
          selectedArea={selectedArea}
          selectedNivel={selectedNivel}
          onAreaChange={setSelectedArea}
          onNivelChange={setSelectedNivel}
          competencias={competencias}
          selectedCompetencia={selectedCompetencia}
          selectedExamen={selectedExamen}
          onCompetenciaChange={handleCompetenciaChange}
          onExamenChange={setSelectedExamen}
          disabled={loading}
        />

        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          disabled={!selectedCompetencia || loadingCompetidores}
        />
      </div>

      <CompetidoresTable
        competidores={filteredCompetidores}
        onCalificar={handleCalificar}
        onEditarNota={handleEditarNota}
        onDescalificar={handleDescalificar}
        loading={loadingCompetidores}
        esBusqueda={esBusquedaValida(searchTerm)}
        isReadyToGrade={!!selectedExamen}
        idExamenSeleccionado={Number(selectedExamen)}
      />

      {selectedCompetidor && (
        <CalificacionModal
          competidor={selectedCompetidor}
          areaSeleccionada={areaSeleccionada?.nombre_area || ''}
          nivelSeleccionado={nivelSeleccionado?.nombre || ''}
          onClose={handleCloseModal}
          onSave={guardarEvaluacion}
        />
      )}

      {competidorAEditar && (
        <ModificarNotaModal
          competidor={competidorAEditar}
          areaSeleccionada={areaSeleccionada?.nombre_area || ''}
          nivelSeleccionado={nivelSeleccionado?.nombre || ''}
          onClose={handleCloseModalEdicion}
          onSave={modificarNota}
        />
      )}

      {competidorADescalificar && (
        <DescalificarModal
          competidor={competidorADescalificar}
          onClose={handleCloseModalDescalificar}
          onConfirm={descalificarCompetidor}
        />
      )}
    </div>
  );
}
