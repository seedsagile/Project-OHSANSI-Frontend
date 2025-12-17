import { useState } from 'react';
import { useGestorExamenes } from '../hooks/useGestorExamenes';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { ExamenCard } from '../components/ExamenCard';
import { ModalCrearExamen } from '../components/ModalCrearExamen';
import { Modal1, type ModalType } from '@/components/ui/Modal1'; 
import { FileQuestion, AlertCircle, Plus } from 'lucide-react';
import type { Examen, CrearExamenPayload, EditarExamenPayload } from '../types';

type FeedbackState = {
  isOpen: boolean;
  type: ModalType;
  title: string;
  message: string;
};

export function PaginaExamenes() {
  const { 
    estructura, 
    examenes, 
    isLoading, 
    selectedAreaId, 
    setSelectedAreaId,
    selectedNivelId,
    setSelectedNivelId,
    competenciaId,
    acciones
  } = useGestorExamenes();

  const [modalCrearOpen, setModalCrearOpen] = useState(false);
  const [modalConfirmar, setModalConfirmar] = useState<{ isOpen: boolean, id: number | null }>({ isOpen: false, id: null });
  const [examenAEditar, setExamenAEditar] = useState<Examen | null>(null);
  
  const [feedback, setFeedback] = useState<FeedbackState>({ isOpen: false, type: 'info', title: '', message: '' });

  const areasOptions = estructura.map((e) => ({ value: e.id_area, label: e.area }));
  const nivelesOptions = selectedAreaId 
    ? estructura.find((e) => e.id_area === selectedAreaId)?.niveles.map((n) => ({ value: n.id_area_nivel, label: n.nombre_nivel })) || []
    : [];

  const showFeedback = (type: ModalType, title: string, message: string) => {
    setFeedback({ isOpen: true, type, title, message });
  };

  const extractErrorMessage = (err: any) => {
    const data = err.response?.data;
    if (data?.error) return data.error;
    if (data?.message) return data.message;
    return 'Ocurrió un error inesperado al procesar la solicitud.';
  };

  const handleCrear = (data: CrearExamenPayload) => {
    acciones.crear.mutate(data, {
      onSuccess: () => {
        setModalCrearOpen(false);
        showFeedback('success', 'Examen Creado', 'El examen se ha registrado correctamente.');
      },
      onError: (err: any) => {
        showFeedback('error', 'No se pudo crear', extractErrorMessage(err));
      }
    });
  };

  const handleEditar = (data: CrearExamenPayload) => {
    if(!examenAEditar) return;
    
    const payloadEdicion: EditarExamenPayload = {
        id_examen: examenAEditar.id_examen,
        nombre: data.nombre,
        ponderacion: data.ponderacion,
        fecha_hora_inicio: data.fecha_hora_inicio,
        tipo_regla: data.tipo_regla,
        configuracion_reglas: data.configuracion_reglas
    };

    acciones.editar.mutate(payloadEdicion, {
      onSuccess: () => {
        setModalCrearOpen(false);
        setExamenAEditar(null);
        showFeedback('success', 'Examen Actualizado', 'Los cambios se han guardado correctamente.');
      },
      onError: (err: any) => {
        showFeedback('error', 'Error al Editar', extractErrorMessage(err));
      }
    });
  };

  const confirmarEliminacion = () => {
    if (modalConfirmar.id) {
      acciones.eliminar.mutate(modalConfirmar.id, {
        onSuccess: () => {
          setModalConfirmar({ isOpen: false, id: null });
          showFeedback('success', 'Examen Eliminado', 'El examen ha sido eliminado correctamente.');
        },
        onError: (err: any) => {
          setModalConfirmar({ isOpen: false, id: null });
          showFeedback('error', 'Error al Eliminar', extractErrorMessage(err));
        }
      });
    }
  };

  const handleIniciar = (id: number) => {
    acciones.iniciar.mutate(id, {
      onSuccess: () => showFeedback('success', 'Examen Iniciado', 'La sala de evaluación está abierta.'),
      onError: (err: any) => showFeedback('error', 'No se pudo iniciar', extractErrorMessage(err))
    });
  };

  const handleFinalizar = (id: number) => {
    acciones.finalizar.mutate(id, {
      onSuccess: () => showFeedback('success', 'Examen Finalizado', 'Se han cerrado las evaluaciones.'),
      onError: (err: any) => showFeedback('error', 'No se pudo finalizar', extractErrorMessage(err))
    });
  };

  const puedeCrear = !!competenciaId; 

  return (
    <div className="min-h-screen bg-neutro-50 p-6 font-display">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <header>
          <h1 className="text-3xl font-extrabold text-negro flex items-center gap-3">
            <FileQuestion className="text-principal-600" size={32}/> 
            Gestión de Exámenes
          </h1>
          <p className="text-neutro-500 mt-1">Configura las pruebas y evaluaciones de la competencia.</p>
        </header>

        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-6 z-20 relative">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Área</label>
            <CustomDropdown 
              options={areasOptions} 
              selectedValue={selectedAreaId} 
              onSelect={(val) => { setSelectedAreaId(Number(val)); setSelectedNivelId(null); }}
              placeholder="Seleccionar Área"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nivel</label>
            <CustomDropdown 
              options={nivelesOptions} 
              selectedValue={selectedNivelId} 
              onSelect={(val) => setSelectedNivelId(Number(val))}
              placeholder={!selectedAreaId ? "Primero elija un área" : "Seleccionar Nivel"}
              disabled={!selectedAreaId}
            />
          </div>
        </section>

        <section className="relative min-h-[400px]">
          {!selectedNivelId ? (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                <FileQuestion size={64} className="mb-4 text-gray-300"/>
                <p className="text-xl font-bold text-gray-400">Selecciona un Nivel para ver los exámenes</p>
            </div>
          ) : isLoading ? (
            <div className="text-center py-20 animate-pulse text-neutro-500 font-medium">Cargando exámenes...</div>
          ) : (
            <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">
                    Exámenes Registrados ({examenes.length})
                  </h2>
                  
                  {puedeCrear ? (
                    <button 
                      onClick={() => { setExamenAEditar(null); setModalCrearOpen(true); }}
                      className="bg-principal-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-principal-700 flex items-center gap-2 shadow-sm transition-all active:scale-95"
                    >
                      <Plus size={20}/> Nuevo Examen
                    </button>
                  ) : (
                    <div className="text-sm text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 flex items-center gap-2">
                      <AlertCircle size={16}/>
                      <span>Para agregar exámenes, asegúrese de que la competencia exista.</span>
                    </div>
                  )}
                </div>

                {examenes.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                      <p className="text-gray-500 mb-2">No hay exámenes configurados para este nivel.</p>
                      {puedeCrear && <p className="text-sm text-principal-600 font-medium">¡Crea el primero ahora!</p>}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {examenes.map(examen => (
                        <ExamenCard 
                          key={examen.id_examen}
                          examen={examen}
                          isProcessing={acciones.iniciar.isPending || acciones.finalizar.isPending || acciones.eliminar.isPending}
                          onEditar={(ex) => { setExamenAEditar(ex); setModalCrearOpen(true); }}
                          onEliminar={(id) => setModalConfirmar({ isOpen: true, id })}
                          onIniciar={handleIniciar}
                          onFinalizar={handleFinalizar}
                        />
                      ))}
                  </div>
                )}
            </div>
          )}
        </section>

      </div>

      <ModalCrearExamen 
        isOpen={modalCrearOpen}
        onClose={() => setModalCrearOpen(false)}
        onSubmit={examenAEditar ? handleEditar : handleCrear}
        examenAEditar={examenAEditar}
        idCompetencia={competenciaId || 0}
        isProcessing={acciones.crear.isPending || acciones.editar.isPending}
      />

      <Modal1
        isOpen={modalConfirmar.isOpen}
        onClose={() => setModalConfirmar({ isOpen: false, id: null })}
        type="confirmation"
        title="¿Eliminar Examen?"
        onConfirm={confirmarEliminacion}
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={acciones.eliminar.isPending}
      >
        Esta acción no se puede deshacer. Se perderán las configuraciones y notas asociadas a este examen.
      </Modal1>

      <Modal1
        isOpen={feedback.isOpen}
        onClose={() => setFeedback(prev => ({ ...prev, isOpen: false }))}
        title={feedback.title}
        type={feedback.type}
        confirmText="Entendido"
      >
        {feedback.message}
      </Modal1>

    </div>
  );
}