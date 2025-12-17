import { useState, useMemo } from 'react';
import { useCompetenciasDashboard } from '../hooks/useCompetenciasDashboard';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { ModalCrearCompetencia } from '../components/ModalCrearCompetencia';
import { ModalAvalarCompetencia } from '../components/ModalAvalarCompetencia';
import { Modal1, type ModalType } from '@/components/ui/Modal1';
import { TimelineStatus } from '../components/ui/TimelineStatus';
import { 
  Play, Send, Lock, FileSignature, Clock, Filter, Search, Award 
} from 'lucide-react';
import type { Competencia, EstadoFase } from '../types';

type FeedbackState = {
  isOpen: boolean;
  type: ModalType;
  title: string;
  message: string;
};

type ConfirmationState = {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
};

export function PaginaCompetencias() {
  const { 
    areas, 
    competencias, 
    isLoading, 
    selectedAreaId, 
    setSelectedAreaId,
    lastUpdatedId,
    acciones 
  } = useCompetenciasDashboard();
  
  const [filtroEstado, setFiltroEstado] = useState<'todos' | EstadoFase>('todos');
  const [modalCrearOpen, setModalCrearOpen] = useState(false);
  const [modalAvalar, setModalAvalar] = useState<{ isOpen: boolean; competencia: Competencia | null }>({ isOpen: false, competencia: null });
  
  const [feedback, setFeedback] = useState<FeedbackState>({ isOpen: false, type: 'info', title: '', message: '' });
  const [confirmation, setConfirmation] = useState<ConfirmationState>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  const areaOptions = areas.map(a => ({ value: a.id_area, label: a.nombre }));

  const competenciasFiltradas = useMemo(() => {
    if (filtroEstado === 'todos') return competencias;
    return competencias.filter(c => c.estado_fase === filtroEstado);
  }, [competencias, filtroEstado]);

  const showFeedback = (type: 'success' | 'error', title: string, message: string) => {
    setFeedback({ isOpen: true, type, title, message });
  };

  const closeConfirmation = () => setConfirmation(prev => ({ ...prev, isOpen: false }));

  const SmartChip = ({ label, value, count }: { label: string, value: string, count?: number }) => (
    <button
      onClick={() => setFiltroEstado(value as any)}
      className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all duration-200 active:scale-95 ${
        filtroEstado === value 
          ? 'bg-principal-600 text-white border-principal-600 shadow-md ring-2 ring-principal-100' 
          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
      }`}
    >
      {label} {count !== undefined && <span className={`ml-1 ${filtroEstado === value ? 'text-white/80' : 'text-gray-400'}`}>({count})</span>}
    </button>
  );


  const solicitarConfirmacion = (titulo: string, mensaje: string, accion: () => void) => {
    setConfirmation({
      isOpen: true,
      title: titulo,
      message: mensaje,
      onConfirm: () => {
        accion();
        closeConfirmation();
      }
    });
  };

  const handlePublicar = (id: number) => {
    solicitarConfirmacion(
      '¿Publicar Competencia?',
      'La competencia será visible para todos los estudiantes inscritos. ¿Desea continuar?',
      () => acciones.publicar.mutate(id, {
        onSuccess: () => showFeedback('success', 'Publicada', 'La competencia ahora es visible.'),
        onError: (err: any) => showFeedback('error', 'Error', err.response?.data?.message || 'Error al publicar.')
      })
    );
  };

  const handleIniciar = (id: number) => {
    solicitarConfirmacion(
      '¿Iniciar Evento?',
      'Se habilitará el ingreso a los exámenes y la plataforma de evaluación para los jueces.',
      () => acciones.iniciar.mutate(id, {
        onSuccess: () => showFeedback('success', 'Iniciada', 'El evento ha comenzado exitosamente.'),
        onError: (err: any) => showFeedback('error', 'Error', err.response?.data?.message || 'Error al iniciar.')
      })
    );
  };

  const handleCerrar = (id: number) => {
    solicitarConfirmacion(
      '¿Cerrar Competencia?',
      'Se finalizarán las evaluaciones en curso y se calcularán los resultados preliminares.',
      () => acciones.cerrar.mutate(id, {
        onSuccess: () => showFeedback('success', 'Cerrada', 'Resultados calculados correctamente.'),
        onError: (err: any) => showFeedback('error', 'Error', err.response?.data?.message || 'Error al cerrar.')
      })
    );
  };

  const handleAbrirAvalar = (competencia: Competencia) => {
    setModalAvalar({ isOpen: true, competencia });
  };

  const handleConfirmarAval = (password: string) => {
    if (!modalAvalar.competencia) return;
    acciones.avalar.mutate({ id: modalAvalar.competencia.id_competencia, password }, {
      onSuccess: () => {
        setModalAvalar({ isOpen: false, competencia: null });
        showFeedback('success', '¡Competencia Avalada!', 'Actas firmadas y resultados publicados oficialmente.');
      },
      onError: (err: any) => {
        setModalAvalar({ isOpen: false, competencia: null });
        showFeedback('error', 'Error de Aval', err.response?.data?.message || 'Contraseña incorrecta.');
      }
    });
  };

  return (
    <div className="min-h-screen bg-neutro-50 p-4 md:p-8 font-display">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        
        {/* Header Principal */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-negro tracking-tight">Gestión de Competencias</h1>
            <p className="text-neutro-500 mt-1">Control de ciclo de vida y monitoreo en tiempo real.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
             <div className="w-full sm:w-64 z-20">
               <CustomDropdown
                  placeholder="Seleccionar Área..."
                  options={areaOptions}
                  selectedValue={selectedAreaId}
                  onSelect={(val) => setSelectedAreaId(Number(val))}
               />
             </div>
             <button 
                onClick={() => setModalCrearOpen(true)}
                disabled={!selectedAreaId}
                className="bg-principal-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-principal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
             >
                <span>+</span> Nueva Competencia
             </button>
          </div>
        </div>

        {/* Panel de Filtros (Smart Chips) */}
        {selectedAreaId && (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <SmartChip label="Todas" value="todos" count={competencias.length} />
            <SmartChip label="En Curso" value="en_proceso" count={competencias.filter(c => c.estado_fase === 'en_proceso').length} />
            <SmartChip label="Por Avalar" value="concluida" count={competencias.filter(c => c.estado_fase === 'concluida').length} />
            <SmartChip label="Borradores" value="borrador" />
          </div>
        )}

        {/* Área de Contenido */}
        {!selectedAreaId ? (
          <div className="bg-white border-2 border-dashed border-neutro-300 rounded-2xl p-16 text-center shadow-sm">
             <div className="bg-principal-50 text-principal-500 p-5 rounded-full inline-flex mb-6">
               <Filter size={40} />
             </div>
             <h3 className="text-xl font-bold text-neutro-800">Selecciona un Área de Conocimiento</h3>
             <p className="text-neutro-500 mt-2 max-w-md mx-auto">
               Elige un área en el menú superior para cargar y gestionar las competencias asociadas.
             </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-neutro-200 overflow-hidden transition-all">
            {isLoading ? (
               // Skeleton Loading
               <div className="p-6 space-y-6">
                 {[1, 2, 3].map(i => (
                   <div key={i} className="flex gap-4 items-center animate-pulse">
                     <div className="h-16 w-full bg-gray-100 rounded-xl" />
                   </div>
                 ))}
               </div>
            ) : competenciasFiltradas.length === 0 ? (
               <div className="py-20 text-center text-neutro-500">
                 <Search size={48} className="mx-auto mb-4 opacity-20 text-principal-500"/>
                 <p className="font-medium">No se encontraron competencias</p>
                 <p className="text-sm opacity-70">Prueba cambiando los filtros o crea una nueva.</p>
               </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50/80 border-b border-gray-200 text-xs uppercase text-gray-500 font-bold tracking-wider">
                    <tr>
                      <th className="px-8 py-5">Nivel / Fecha</th>
                      <th className="px-6 py-5">Ciclo de Vida</th>
                      <th className="px-8 py-5 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {competenciasFiltradas.map((comp) => {
                      const isFlashing = lastUpdatedId === comp.id_competencia;
                      
                      return (
                        <tr 
                          key={comp.id_competencia} 
                          className={`transition-colors duration-1000 ease-out group ${
                            isFlashing ? 'bg-yellow-50' : 'hover:bg-gray-50'
                          }`}
                        >
                          <td className="px-8 py-5">
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-800 text-base">{comp.nivel}</span>
                              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1.5 font-medium bg-gray-100 w-fit px-2 py-0.5 rounded-md">
                                 <Clock size={12}/>
                                 {new Date(comp.fecha_inicio).toLocaleDateString()} — {new Date(comp.fecha_fin).toLocaleDateString()}
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-5">
                            <TimelineStatus estado={comp.estado_fase} />
                          </td>

                          <td className="px-8 py-5 text-right">
                            <div className="flex justify-end gap-2 opacity-90 group-hover:opacity-100 transition-opacity">
                                
                                {comp.estado_fase === 'borrador' && (
                                  <button 
                                    onClick={() => handlePublicar(comp.id_competencia)}
                                    disabled={acciones.publicar.isPending}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors"
                                  >
                                    <Send size={14}/> Publicar
                                  </button>
                                )}

                                {comp.estado_fase === 'publicada' && (
                                  <button 
                                    onClick={() => handleIniciar(comp.id_competencia)}
                                    disabled={acciones.iniciar.isPending}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors"
                                  >
                                    <Play size={14}/> Iniciar
                                  </button>
                                )}

                                {comp.estado_fase === 'en_proceso' && (
                                  <button 
                                    onClick={() => handleCerrar(comp.id_competencia)}
                                    disabled={acciones.cerrar.isPending}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors"
                                  >
                                    <Lock size={14}/> Cerrar
                                  </button>
                                )}

                                {comp.estado_fase === 'concluida' && (
                                  <button 
                                    onClick={() => handleAbrirAvalar(comp)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-xs font-bold hover:bg-purple-100 transition-colors shadow-sm"
                                  >
                                    <FileSignature size={14}/> Avalar
                                  </button>
                                )}

                                {comp.estado_fase === 'avalada' && (
                                  <span className="flex items-center gap-1.5 px-3 py-1.5 text-green-700 font-bold text-xs bg-green-50/50 rounded-lg border border-transparent">
                                    <Award size={16}/> Oficial
                                  </span>
                                )}

                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      <Modal1
        isOpen={feedback.isOpen}
        onClose={() => setFeedback(prev => ({ ...prev, isOpen: false }))}
        title={feedback.title}
        type={feedback.type}
        confirmText="Entendido"
      >
        {feedback.message}
      </Modal1>

      <Modal1
        isOpen={confirmation.isOpen}
        onClose={closeConfirmation}
        title={confirmation.title}
        type="confirmation"
        confirmText="Continuar"
        cancelText="Cancelar"
        onConfirm={confirmation.onConfirm}
      >
        {confirmation.message}
      </Modal1>

      <ModalCrearCompetencia 
        isOpen={modalCrearOpen}
        onClose={() => setModalCrearOpen(false)}
        areaId={selectedAreaId}
      />

      <ModalAvalarCompetencia
        isOpen={modalAvalar.isOpen}
        onClose={() => setModalAvalar({ isOpen: false, competencia: null })}
        competenciaNombre={modalAvalar.competencia?.nivel || ''}
        onConfirm={handleConfirmarAval}
        isProcessing={acciones.avalar.isPending}
      />
    </div>
  );
}