import { useState } from 'react';
import { Layers, AlertTriangle } from 'lucide-react';
import { useSubFases } from '../hooks/useSubFases';
import { SubFaseCard } from '../components/SubFaseCard';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { Alert } from '@/components/ui/Alert';
import { Modal1 } from '@/components/ui/Modal1';
import type { SubFase } from '../types';

export function PaginaAdministrarSubFases() {
  const { 
    subFases, 
    areasOptions, 
    nivelesOptions,
    isLoading,
    isLoadingNiveles,
    isUpdating,
    isError,
    filtros: { areaId, nivelId },
    acciones: { 
      seleccionarArea, 
      setNivelId,
      cambiarEstado, 
      puedeIniciar, 
      puedeFinalizar 
    }
  } = useSubFases();

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    content: React.ReactNode;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    content: null,
    onConfirm: () => {},
  });

  const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

  const openConfirmation = (title: string, content: React.ReactNode, action: () => void) => {
    setModalConfig({
      isOpen: true,
      title,
      content,
      onConfirm: () => {
        action();
        closeModal();
      }
    });
  };

  const handleIniciarFase = (fase: SubFase) => {
    openConfirmation(
      `¿Iniciar fase "${fase.nombre}"?`,
      <div className="text-left text-sm text-neutro-600 space-y-3">
        <p>Al iniciar este Examen, ocurrirá lo siguiente:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Se habilitará el registro de notas para <strong>{fase.cant_evaluadores} evaluadores</strong>.</li>
          <li>El estado cambiará a "En Evaluación".</li>
        </ul>
      </div>,
      () => cambiarEstado({ id: fase.id_subfase, estado: 'EN_EVALUACION' })
    );
  };

  const handleFinalizarFase = (fase: SubFase) => {
    openConfirmation(
      `¿Finalizar fase "${fase.nombre}"?`,
      <div className="text-left text-sm text-neutro-600 space-y-3">
        <div className="bg-red-50 border border-red-100 p-3 rounded-lg text-red-700 flex items-start gap-2">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <div>
            <strong className="block text-xs uppercase tracking-wider mb-1">Acción Irreversible</strong>
            <p className="text-xs leading-relaxed">
              Una vez finalizada, no se podrán cargar ni modificar más notas para este examen.
            </p>
          </div>
        </div>
        <p>Asegúrese de que:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Todos los evaluadores hayan completado su trabajo.</li>
          <li>Desea habilitar el paso a la siguiente fase.</li>
        </ul>
      </div>,
      () => cambiarEstado({ id: fase.id_subfase, estado: 'FINALIZADA' })
    );
  };

  const dropdownAreas = areasOptions.map(a => ({ value: a.id_area, label: a.nombre }));
  const dropdownNiveles = nivelesOptions.map(n => ({ value: n.id_nivel, label: n.nombre }));

  return (
    <div className="min-h-screen bg-neutro-50 p-4 md:p-8 font-display">
      <main className="max-w-7xl mx-auto space-y-8 animate-fade-in">
        
        {/* Encabezado */}
        <header className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-full shadow-sm mb-2 border border-neutro-100">
            <Layers className="text-principal-600" size={32} />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-negro tracking-tight">
            Habilitar Examen por Area/Nivel
          </h1>
          <p className="text-neutro-600 max-w-2xl mx-auto text-lg">
            Gestione el flujo de evaluación, inicie etapas y finalice procesos por Área y Nivel.
          </p>
        </header>

        {/* Filtros */}
        <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-neutro-200 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 relative z-20">
          <div>
            <label className="block text-sm font-bold text-neutro-700 mb-2 uppercase tracking-wide">
              Seleccionar Área
            </label>
            <CustomDropdown
              options={dropdownAreas}
              selectedValue={areaId}
              onSelect={(val) => seleccionarArea(Number(val))} 
              placeholder="-- Elija un área --"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-neutro-700 mb-2 uppercase tracking-wide">
              Seleccionar Nivel
            </label>
            <CustomDropdown
              options={dropdownNiveles}
              selectedValue={nivelId}
              onSelect={(val) => setNivelId(Number(val))}
              placeholder={
                !areaId 
                  ? "← Seleccione un área primero" 
                  : isLoadingNiveles 
                    ? "Cargando niveles..." 
                    : "-- Elija un nivel --"
              }
              disabled={!areaId || isLoadingNiveles} 
            />
          </div>
        </section>

        {/* Manejo de Errores */}
        {isError && (
          <div className="max-w-2xl mx-auto">
            <Alert type="error" message="No se pudo conectar con el servidor de fases. Por favor, intente nuevamente más tarde." />
          </div>
        )}

        <section className="relative z-10 min-h-[400px] transition-all duration-300">
          
          {(!areaId || !nivelId) && (
            <div className="flex flex-col items-center justify-center py-24 bg-white/50 rounded-2xl border-2 border-dashed border-neutro-300 text-neutro-500">
              <Layers size={48} className="opacity-20 mb-4"/>
              <p className="text-xl font-semibold text-neutro-600">Comience la configuración</p>
              <p className="text-sm mt-1">
                {!areaId ? 'Seleccione un Área para empezar' : 'Ahora seleccione un Nivel específico'}
              </p>
            </div>
          )}

          {areaId && nivelId && isLoading && (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-principal-200 border-t-principal-600 mb-4"></div>
              <p className="text-neutro-600 font-medium animate-pulse">Sincronizando examenes...</p>
            </div>
          )}

          {areaId && nivelId && !isLoading && subFases.length === 0 && (
            <div className="text-center py-24 bg-white rounded-xl shadow-sm border border-neutro-100">
              <p className="font-bold text-xl text-neutro-700 mb-2">No se encontraron examenes</p>
              <p className="text-neutro-500 max-w-md mx-auto">
                No hay examenes configuradas para este nivel. Contacte al administrador si cree que esto es un error.
              </p>
            </div>
          )}

          {areaId && nivelId && !isLoading && subFases.length > 0 && (
            <div className="animate-slide-up">
              <div className="flex items-center justify-between mb-6 px-1">
                <h2 className="text-xl font-bold text-negro flex items-center gap-2">
                  Examenes en proceso
                </h2>
                <span className="text-xs font-bold text-principal-700 bg-principal-50 px-3 py-1.5 rounded-full border border-principal-200 uppercase tracking-wider">
                  {subFases.length} Examenes Totales
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subFases.map((fase) => (
                  <SubFaseCard
                    key={fase.id_subfase}
                    fase={fase}
                    isUpdating={isUpdating}
                    puedeIniciar={puedeIniciar(fase)}
                    puedeFinalizar={puedeFinalizar(fase)}
                    onIniciar={() => handleIniciarFase(fase)}
                    onFinalizar={() => handleFinalizarFase(fase)}
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
      
      <Modal1
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        title={modalConfig.title}
        type="confirmation"
        confirmText="Confirmar"
        cancelText="Cancelar"
        onConfirm={modalConfig.onConfirm}
        loading={isUpdating}
      >
        {modalConfig.content}
      </Modal1>

      <style>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.4s ease-out forwards;
        }
        .animate-fade-in {
          animation: opacity 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}