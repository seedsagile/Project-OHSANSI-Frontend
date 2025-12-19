import { useState } from 'react';
import { useSalaEvaluacion } from '../hooks/useSalaEvaluacion';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { TablaSalaEvaluacion } from '../components/TablaSalaEvaluacion';
import { CalificacionModal } from '../components/CalificacionModal';
import { Modal1, type ModalType } from '@/components/ui/Modal1'; // Asegúrate de que Modal1 soporte un children de tipo ReactNode
import { Gavel, AlertCircle, RefreshCw } from 'lucide-react'; // AlertCircle ahora se usa
import toast from 'react-hot-toast';
import type { CompetidorSala, GuardarNotaPayload } from '../types/sala.types';

// Estado para el modal de feedback
type FeedbackState = {
  isOpen: boolean;
  type: ModalType;
  title: string;
  message: string;
};

export function PaginaEvaluacionSala() {
  const {
    areas,
    examenes,
    competidores,
    isLoadingEstructura,
    isLoadingCompetidores,
    filtros,
    setters,
    acciones
  } = useSalaEvaluacion();

  // Estados Locales
  const [modalCalificarOpen, setModalCalificarOpen] = useState(false);
  const [competidorSeleccionado, setCompetidorSeleccionado] = useState<CompetidorSala | null>(null);
  
  // Estado para Modal1 (Feedback)
  const [feedback, setFeedback] = useState<FeedbackState>({ 
    isOpen: false, 
    type: 'info', 
    title: '', 
    message: '' 
  });
  
  // Opciones para Dropdowns
  const areaOptions = areas.map(a => ({ value: a.id_area, label: a.nombre_area }));
  
  const nivelesOptions = filtros.areaId 
    ? areas.find(a => a.id_area === filtros.areaId)?.niveles.map(n => ({ 
        value: n.id_area_nivel, 
        label: n.nombre_nivel 
      })) || []
    : [];

  const examenesOptions = examenes.map(e => ({ value: e.id_examen, label: e.nombre_examen }));

  // Helper para mostrar modal
  const showFeedback = (type: ModalType, title: string, message: string) => {
    setFeedback({ isOpen: true, type, title, message });
  };

  // --- Manejadores del Flujo de Evaluación ---

  // Paso 1: Intentar Bloquear (Semáforo Rojo)
  const handleIntentarCalificar = (comp: CompetidorSala) => {
    if (comp.bloqueado_por_mi) {
        setCompetidorSeleccionado(comp);
        setModalCalificarOpen(true);
        return;
    }

    acciones.bloquear.mutate(comp.id_evaluacion, {
      onSuccess: () => {
        setCompetidorSeleccionado(comp);
        setModalCalificarOpen(true);
      },
      onError: (err: any) => {
        // Mostrar error en Modal1 si la ficha está ocupada
        showFeedback('error', 'No se puede calificar', err.response?.data?.message || 'La ficha está siendo usada por otro juez.');
      }
    });
  };

  // Paso 2: Guardar Nota (Semáforo Verde)
  const handleGuardarNota = (data: GuardarNotaPayload) => {
    if (!competidorSeleccionado) return;

    acciones.guardar.mutate({ 
      idEvaluacion: competidorSeleccionado.id_evaluacion, 
      payload: data 
    }, {
      onSuccess: () => {
        setModalCalificarOpen(false);
        setCompetidorSeleccionado(null);
        showFeedback('success', 'Nota Registrada', 'La calificación se ha guardado correctamente.');
      },
      onError: (err: any) => {
        showFeedback('error', 'Error al Guardar', err.response?.data?.message || 'No se pudo registrar la nota.');
      }
    });
  };

  // Paso 3: Cancelar / Liberar (Desbloqueo)
  const handleCancelar = () => {
    if (competidorSeleccionado) {
      acciones.desbloquear.mutate(competidorSeleccionado.id_evaluacion);
    }
    setModalCalificarOpen(false);
    setCompetidorSeleccionado(null);
  };

  // Manejador para Descalificar
  const handleDescalificar = (comp: CompetidorSala) => {
    setCompetidorSeleccionado(comp);
    showFeedback(
      'warning', 
      'Confirmar Descalificación', 
      `¿Está seguro que desea descalificar a ${comp.nombre_completo}?`
    );
    // El modal de feedback ahora tendrá un input para el motivo.
    // La lógica de confirmación se moverá al `onConfirm` del Modal1.
  };

  const confirmarDescalificacion = (motivo: string) => {
    if (!competidorSeleccionado || !motivo.trim()) {
      toast.error("Debe proporcionar un motivo para la descalificación.");
      return;
    }
    if (motivo.trim().length < 10) {
      toast.error("El motivo debe tener al menos 10 caracteres.");
      return;
    }

    acciones.descalificar.mutate({ idEvaluacion: competidorSeleccionado.id_evaluacion, motivo });
    setFeedback(prev => ({ ...prev, isOpen: false })); // Cerrar modal de confirmación
    setCompetidorSeleccionado(null);
  };

  return (
    <div className="min-h-screen bg-neutro-50 p-6 font-display">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-negro flex items-center gap-3">
              <div className="bg-principal-600 text-white p-2 rounded-lg">
                <Gavel size={28} />
              </div>
              Sala de Evaluación
            </h1>
            <p className="text-neutro-500 mt-2 text-sm max-w-2xl">
              Panel de calificación en tiempo real. Seleccione un examen para ingresar a la sala.
            </p>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Sistema en Línea
          </div>
        </header>

        {/* Filtros de Selección */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-5 rounded-xl shadow-sm border border-gray-200 z-20 relative">
           <div>
             <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Área</label>
             <CustomDropdown 
                options={areaOptions} 
                selectedValue={filtros.areaId} 
                onSelect={(val) => { 
                  setters.setAreaId(Number(val)); 
                  setters.setNivelId(null); 
                  setters.setExamenId(null);
                }}
                placeholder="Seleccionar Área"
                disabled={isLoadingEstructura}
             />
           </div>

           <div>
             <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nivel</label>
             <CustomDropdown 
                options={nivelesOptions} 
                selectedValue={filtros.nivelId} 
                onSelect={(val) => {
                  setters.setNivelId(Number(val));
                  setters.setExamenId(null);
                }}
                placeholder="Seleccionar Nivel"
                disabled={!filtros.areaId}
             />
           </div>

           <div>
             <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Examen</label>
             <CustomDropdown 
                options={examenesOptions} 
                selectedValue={filtros.examenId} 
                onSelect={(val) => setters.setExamenId(Number(val))}
                placeholder="Ingresar a Sala..."
                disabled={!filtros.nivelId}
             />
           </div>
        </section>

        {/* Área de Trabajo (Pizarra) */}
        <section className="relative min-h-[500px]">
           {!filtros.examenId ? (
              <div className="flex flex-col items-center justify-center h-96 bg-white border-2 border-dashed border-gray-200 rounded-xl text-center">
                 <div className="p-4 bg-gray-50 rounded-full mb-4 text-gray-400">
                    {/* USO DE AlertCircle para estado vacío */}
                    <AlertCircle size={48} />
                 </div>
                 <h3 className="text-xl font-bold text-gray-400">Sala Cerrada</h3>
                 <p className="text-gray-400 mt-2">Seleccione un examen para cargar la lista de estudiantes.</p>
              </div>
           ) : (
              <div className="space-y-4">
                 <div className="flex justify-between items-center px-2">
                    <h2 className="text-lg font-bold text-gray-800">
                      Competidores ({competidores.length})
                    </h2>
                    <button 
                      onClick={() => acciones.desbloquear.mutate(0)} 
                      className="text-principal-600 hover:text-principal-700 text-sm font-semibold flex items-center gap-1"
                    >
                      <RefreshCw size={14}/> Sincronizar
                    </button>
                 </div>

                 <TablaSalaEvaluacion 
                    competidores={competidores}
                    isLoading={isLoadingCompetidores}
                    onCalificar={handleIntentarCalificar}
                    onDescalificar={handleDescalificar} // <-- Pasar la función
                 />
              </div>
           )}
        </section>

      </div>

      {/* Modal de Calificación */}
      {competidorSeleccionado && (
        <CalificacionModal
          isOpen={modalCalificarOpen}
          onClose={handleCancelar}
          onGuardar={handleGuardarNota}
          competidor={competidorSeleccionado}
          isProcessing={acciones.guardar.isPending}
        />
      )}

      {/* USO DE Modal1 para Feedback */}
      <Modal1
        isOpen={feedback.isOpen}
        onClose={() => setFeedback(prev => ({ ...prev, isOpen: false }))}
        title={feedback.title}
        type={feedback.type}
        // Lógica condicional para el modal de descalificación
        onConfirm={feedback.type === 'warning' && competidorSeleccionado ? () => {
          const motivoInput = document.getElementById('motivo-descalificacion') as HTMLInputElement;
          confirmarDescalificacion(motivoInput?.value || '');
        } : undefined}
        confirmText={feedback.type === 'warning' && competidorSeleccionado ? 'Confirmar' : 'Entendido'}
      >
        <p>{feedback.message}</p>
        {/* Mostrar input de motivo solo para el modal de descalificación */}
        {feedback.type === 'warning' && competidorSeleccionado && (
          <div className="mt-4">
            <label htmlFor="motivo-descalificacion" className="block text-sm font-bold text-gray-700 mb-1">Motivo (requerido)</label>
            <textarea
              id="motivo-descalificacion"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none bg-white min-h-[80px]"
              placeholder="Escriba una justificación clara (mín. 10 caracteres)..."
            />
          </div>
        )}
      </Modal1>

    </div>
  );
}