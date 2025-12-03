// src/features/evaluaciones/routes/PaginaRegistrarEvaluacion.tsx

import { useState, useEffect } from 'react';
import { useAuth } from '@/auth/login/hooks/useAuth';
import { useEvaluaciones } from '../hooks/useEvaluaciones';
import { AreaNivelSelector } from '../components/AreaNivelSelector';
import { SearchBar } from '../components/SearchBar';
import { CompetidoresTable } from '../components/CompetidoresTable';
import { CalificacionModal } from '../components/CalificacionModal';
import { ModificarNotaModal } from '../components/ModificarNotaModal';
import type { Competidor } from '../types/evaluacion.types';
import { formatearNombreCompleto, esBusquedaValida } from '../utils/validations';
import toast from 'react-hot-toast';

export function PaginaRegistrarEvaluacion() {
  const { user, userId } = useAuth();
  const {
    areas,
    competidores,
    loading,
    loadingCompetidores,
    idEvaluadorAN,
    cargarCompetidores,
    actualizarEstadosCompetidores,
    iniciarEvaluacion,
    guardarEvaluacion,
    modificarNota,
  } = useEvaluaciones();

  const [selectedArea, setSelectedArea] = useState('');
  const [selectedNivel, setSelectedNivel] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompetidor, setSelectedCompetidor] = useState<Competidor | null>(null);
  const [competidorAEditar, setCompetidorAEditar] = useState<Competidor | null>(null);
  const [filteredCompetidores, setFilteredCompetidores] = useState<Competidor[]>([]);
  const [competidorEnModal, setCompetidorEnModal] = useState<string | null>(null);

  const isEvaluador = user?.role === 'evaluador';

  // Validar que areas sea un array antes de ordenar
  const areasOrdenadas = Array.isArray(areas) 
    ? [...areas].sort((a, b) => a.nombre_area.localeCompare(b.nombre_area))
    : [];

  const areaSeleccionada = areasOrdenadas.find(a => a.id_area.toString() === selectedArea);
  
  const nivelSeleccionado = areaSeleccionada?.niveles?.find(
    n => n.id_nivel.toString() === selectedNivel
  );

  // Filtrar competidores por búsqueda y bloquear el que está en modal
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

  // Auto-cargar competidores cuando se selecciona nivel
  // 🔄 CAMBIO CLAVE: Usar el id_nivel que ahora contiene id_area_nivel
  useEffect(() => {
    if (selectedNivel) {
      const idAreaNivel = parseInt(selectedNivel);
      console.log('🔍 Cargando competidores con id_area_nivel:', idAreaNivel);
      cargarCompetidores(idAreaNivel);
    } else {
      setFilteredCompetidores([]);
    }
  }, [selectedNivel]);

  // Polling silencioso en segundo plano (cada 1 segundo)
  useEffect(() => {
    if (!selectedNivel) return;

    const interval = setInterval(() => {
      actualizarEstadosCompetidores();
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedNivel, actualizarEstadosCompetidores]);

  // Manejar clic en calificar
  const handleCalificar = async (competidor: Competidor) => {
    if (competidor.estado === 'Calificado') {
      toast.error('Este competidor ya ha sido calificado');
      return;
    }

    if (competidor.estado === 'En Proceso') {
      if (competidor.bloqueado_por === idEvaluadorAN || competidor.bloqueado_por === userId) {
        setSelectedCompetidor(competidor);
        setCompetidorEnModal(competidor.ci);
        return;
      } else {
        toast.error('Este competidor está siendo calificado por otro evaluador');
        return;
      }
    }

    setCompetidorEnModal(competidor.ci);
    
    const resultado = await iniciarEvaluacion(competidor);

    if (resultado.success) {
      const competidorActualizado = competidores.find(c => c.ci === competidor.ci);
      if (competidorActualizado) {
        setSelectedCompetidor(competidorActualizado);
      }
    } else {
      setCompetidorEnModal(null);
    }
  };

  // Manejar clic en editar nota
  const handleEditarNota = async (competidor: Competidor) => {
    setCompetidorEnModal(competidor.ci);
    setCompetidorAEditar(competidor);
  };

  // Cerrar modal de calificación
  const handleCloseModal = () => {
    setSelectedCompetidor(null);
    setCompetidorEnModal(null);
    actualizarEstadosCompetidores();
  };

  // Cerrar modal de edición
  const handleCloseModalEdicion = () => {
    setCompetidorAEditar(null);
    setCompetidorEnModal(null);
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

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Registrar Evaluación</h1>
        <p className="text-gray-600 mt-2">
          Evaluador: <span className="font-semibold">{user?.nombre} {user?.apellido}</span>
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Selección de Área y Nivel</h2>

        <AreaNivelSelector
          areas={areasOrdenadas}
          selectedArea={selectedArea}
          selectedNivel={selectedNivel}
          onAreaChange={setSelectedArea}
          onNivelChange={setSelectedNivel}
          disabled={loading}
        />

        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          disabled={!selectedNivel || loadingCompetidores}
        />
      </div>

      <CompetidoresTable
        competidores={filteredCompetidores}
        onCalificar={handleCalificar}
        onEditarNota={handleEditarNota}
        loading={loadingCompetidores}
        esBusqueda={esBusquedaValida(searchTerm)}
        areaSeleccionada={!!selectedNivel}
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
    </div>
  );
}