import React from 'react';
import { useRolesConfig } from '../hooks/useRolesConfig';
import { TablaRoles } from '../components/TablaRoles';
import { Modal } from '@/components/ui/Modal';
import { ModalConfirmacion } from '@/features/areas/components/ModalConfirmacion'; // Reutilizamos o creamos uno genérico
import { LoaderCircle, AlertTriangle } from 'lucide-react';

export const PaginaConfiguracionRoles: React.FC = () => {
  const {
    matrizData,
    isLoading,
    isError,
    errorMessage,
    isSaving,
    handleGuardar,
    handleCancelar,
    modalFeedback,
    closeModalFeedback,
    isCancelModalOpen,
    confirmarCancelacion,
    cerrarCancelModal,
    resetKey
  } = useRolesConfig();

  if (isLoading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <LoaderCircle size={48} className="animate-spin text-blue-600" />
          <p className="text-gray-500 font-medium">Cargando matriz de roles...</p>
        </div>
      </div>
    );
  }

  if (isError || !matrizData) {
    return (
      <div className="p-8 flex justify-center">
        <div className="bg-red-50 text-red-700 p-6 rounded-xl border border-red-200 max-w-2xl text-center">
          <AlertTriangle size={40} className="mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-bold mb-2">Error de Carga</h3>
          <p>{errorMessage || 'No se pudo cargar la configuración de roles.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto animate-in fade-in duration-500">
      <TablaRoles
        key={resetKey} // Fuerza re-render al cancelar
        acciones={matrizData.acciones}
        roles={matrizData.roles}
        permisosIniciales={matrizData.permisos}
        onGuardar={handleGuardar}
        onCancelar={handleCancelar}
        isSaving={isSaving}
      />

      {/* Modal de Feedback (Éxito/Error) */}
      <Modal
        isOpen={modalFeedback.isOpen}
        onClose={closeModalFeedback}
        title={modalFeedback.title}
        type={modalFeedback.type}
      >
        <p className="text-gray-600">{modalFeedback.message}</p>
      </Modal>

      {/* Modal Confirmar Cancelación */}
      {isCancelModalOpen && (
        <ModalConfirmacion
          isOpen={true}
          titulo="¿Descartar cambios?"
          mensaje="Perderás todas las modificaciones no guardadas en la matriz de roles."
          onConfirm={confirmarCancelacion}
          onCancel={cerrarCancelModal}
          tipo="advertencia"
        />
      )}
    </div>
  );
};