// src/features/evaluaciones/routes/PaginaRegistrarEvaluacion.tsx

import { useState, useEffect } from 'react';
import { useAuth } from '@/auth/login/hooks/useAuth';
import { useEvaluaciones } from '../hooks/useEvaluaciones';
import { AreaNivelSelector } from '../components/AreaNivelSelector';
import { SearchBar } from '../components/SearchBar';
import { CompetidoresTable } from '../components/CompetidoresTable';
import { CalificacionModal } from '../components/CalificacionModal';
import type { Competidor } from '../types/evaluacion.types';
import { formatearNombreCompleto } from '../utils/validations';
import toast from 'react-hot-toast';

export function PaginaRegistrarEvaluacion() {
  const { user, userId } = useAuth(); // 👈 Agregar userId aquí
  const {
    areas,
    competidores,
    loading,
    loadingCompetidores,
    idEvaluadorAN,
    cargarCompetidores,
    iniciarEvaluacion,
    guardarEvaluacion,
    recargarCompetidores,
  } = useEvaluaciones();

  const [selectedArea, setSelectedArea] = useState('');
  const [selectedNivel, setSelectedNivel] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompetidor, setSelectedCompetidor] = useState<Competidor | null>(null);
  const [filteredCompetidores, setFilteredCompetidores] = useState<Competidor[]>([]);
  const [iniciandoEvaluacion, setIniciandoEvaluacion] = useState(false);

  const isEvaluador = user?.role === 'evaluador';

  const areaSeleccionada = areas.find(a => a.id_area.toString() === selectedArea);
  const nivelSeleccionado = areaSeleccionada?.niveles.find(
    n => n.id_nivel.toString() === selectedNivel
  );

  // Filtrar competidores por búsqueda
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCompetidores(competidores);
      return;
    }

    const filtered = competidores.filter((c) => {
      const nombreCompleto = formatearNombreCompleto(c.nombre, c.apellido).toLowerCase();
      return nombreCompleto.includes(searchTerm.toLowerCase());
    });

    setFilteredCompetidores(filtered);
  }, [competidores, searchTerm]);

  // Auto-cargar competidores cuando se selecciona área y nivel
  useEffect(() => {
    if (selectedArea && selectedNivel) {
      cargarCompetidores(parseInt(selectedArea), parseInt(selectedNivel));
    }
  }, [selectedArea, selectedNivel]);

  // Polling para actualizar estados en tiempo real (cada 5 segundos)
  useEffect(() => {
    if (!selectedArea || !selectedNivel) return;

    const interval = setInterval(() => {
      recargarCompetidores();
    }, 5000); // Actualizar cada 5 segundos

    return () => clearInterval(interval);
  }, [selectedArea, selectedNivel]);

  // Manejar clic en calificar
  const handleCalificar = async (competidor: Competidor) => {
    // Verificar si ya está calificado
    if (competidor.estado === 'Calificado') {
      toast.error('Este competidor ya ha sido calificado');
      return;
    }

    // Verificar si está en proceso por otro evaluador
    if (competidor.estado === 'En Proceso') {
      // Si está bloqueado por este mismo evaluador, permitir abrir
      if (competidor.bloqueado_por === idEvaluadorAN || competidor.bloqueado_por === userId) { // 👈 Usar userId
        setSelectedCompetidor(competidor);
        return;
      } else {
        toast.error('Este competidor está siendo calificado por otro evaluador');
        return;
      }
    }

    // Iniciar evaluación (crear registro en backend)
    setIniciandoEvaluacion(true);
    const resultado = await iniciarEvaluacion(competidor);
    setIniciandoEvaluacion(false);

    if (resultado.success) {
      // Actualizar el competidor con el id_evaluacion
      const competidorActualizado = competidores.find(c => c.ci === competidor.ci);
      if (competidorActualizado) {
        setSelectedCompetidor(competidorActualizado);
      }
    }
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setSelectedCompetidor(null);
    // Recargar competidores para actualizar estados
    recargarCompetidores();
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

  if (areas.length === 0) {
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
      {iniciandoEvaluacion && (
        <div className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center z-50">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
          <span>Iniciando evaluación...</span>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Registrar Evaluación</h1>
        <p className="text-gray-600 mt-2">
          Evaluador: <span className="font-semibold">{user?.nombre} {user?.apellido}</span>
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Selección de Área y Nivel</h2>

        <AreaNivelSelector
          areas={areas}
          selectedArea={selectedArea}
          selectedNivel={selectedNivel}
          onAreaChange={setSelectedArea}
          onNivelChange={setSelectedNivel}
          disabled={loading}
        />

        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          disabled={!selectedArea || !selectedNivel || loadingCompetidores}
        />
      </div>

      <CompetidoresTable
        competidores={filteredCompetidores}
        onCalificar={handleCalificar}
        loading={loadingCompetidores}
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
    </div>
  );
}