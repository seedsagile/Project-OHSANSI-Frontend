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
import { formatearNombreCompleto } from '../utils/validations';
import toast from 'react-hot-toast';

export function PaginaRegistrarEvaluacion() {
  const { user } = useAuth();
  const {
    areas,
    competidores,
    loading,
    loadingCompetidores,
    cargarCompetidores,
    intentarBloquear,
    desbloquearCompetidor,
    guardarEvaluacion,
    modificarEvaluacion,
  } = useEvaluaciones();

  const [selectedArea, setSelectedArea] = useState('');
  const [selectedNivel, setSelectedNivel] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompetidor, setSelectedCompetidor] = useState<Competidor | null>(null);
  const [competidorAModificar, setCompetidorAModificar] = useState<Competidor | null>(null);
  const [filteredCompetidores, setFilteredCompetidores] = useState<Competidor[]>([]);
  const [bloqueando, setBloqueando] = useState(false);

  // Verificar que el usuario sea evaluador
  const isEvaluador = user?.role === 'evaluador';

  // Obtener nombres de área y nivel seleccionados
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

  // Cargar competidores cuando se selecciona área y nivel
  const handleBuscar = () => {
    if (!selectedArea || !selectedNivel) {
      return;
    }

    cargarCompetidores(parseInt(selectedArea), parseInt(selectedNivel));
  };

  // Auto-buscar cuando se selecciona área y nivel
  useEffect(() => {
    if (selectedArea && selectedNivel) {
      handleBuscar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedArea, selectedNivel]);

  // Manejar apertura del modal de calificación
  const handleCalificar = async (competidor: Competidor) => {
    // Si ya está calificado, no permitir calificar de nuevo
    if (competidor.estado === 'Calificado') {
      toast.error('Este competidor ya ha sido calificado. Use el botón "Modificar" para editar.');
      return;
    }

    // Si está en calificación por otro evaluador, bloquear
    if (competidor.estado === 'En calificacion') {
      toast.error('Este competidor está siendo calificado por otro evaluador');
      return;
    }

    // Intentar bloquear el competidor
    setBloqueando(true);
    const bloqueado = await intentarBloquear(competidor.ci);
    setBloqueando(false);

    if (bloqueado) {
      setSelectedCompetidor(competidor);
    }
  };

  // Manejar apertura del modal de modificación
  const handleModificar = (competidor: Competidor) => {
    if (competidor.estado !== 'Calificado') {
      toast.error('Solo puede modificar competidores ya calificados');
      return;
    }
    setCompetidorAModificar(competidor);
  };

  // Manejar cierre del modal de calificación (cancelar)
  const handleCloseModal = async () => {
    if (selectedCompetidor) {
      // Si no estaba calificado, desbloquear
      if (selectedCompetidor.estado !== 'Calificado') {
        await desbloquearCompetidor(selectedCompetidor.ci);
      }
    }
    setSelectedCompetidor(null);
  };

  // Manejar cierre del modal de modificación
  const handleCloseModificarModal = () => {
    setCompetidorAModificar(null);
  };

  // Si no es evaluador, mostrar mensaje de acceso denegado
  if (!isEvaluador) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-red-800 mb-2">Acceso Denegado</h2>
          <p className="text-red-600">
            No tienes permisos para acceder a esta sección. Solo los evaluadores pueden
            registrar evaluaciones.
          </p>
        </div>
      </div>
    );
  }

  // Si está cargando las áreas iniciales
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

  // Si no tiene áreas asignadas
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
      {/* Indicador de bloqueo en proceso */}
      {bloqueando && (
        <div className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center z-50">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
          <span>Verificando disponibilidad...</span>
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
          onSearch={handleBuscar}
          disabled={!selectedArea || !selectedNivel || loadingCompetidores}
        />
      </div>

      <CompetidoresTable
        competidores={filteredCompetidores}
        onCalificar={handleCalificar}
        onModificar={handleModificar}
        loading={loadingCompetidores}
      />

      {/* Modal de Calificación */}
      {selectedCompetidor && (
        <CalificacionModal
          competidor={selectedCompetidor}
          areaSeleccionada={areaSeleccionada?.nombre_area || ''}
          nivelSeleccionado={nivelSeleccionado?.nombre || ''}
          onClose={handleCloseModal}
          onSave={guardarEvaluacion}
        />
      )}

      {/* Modal de Modificación */}
      {competidorAModificar && (
        <ModificarNotaModal
          competidor={competidorAModificar}
          areaSeleccionada={areaSeleccionada?.nombre_area || ''}
          nivelSeleccionado={nivelSeleccionado?.nombre || ''}
          onClose={handleCloseModificarModal}
          onSave={modificarEvaluacion}
        />
      )}
    </div>
  );
}