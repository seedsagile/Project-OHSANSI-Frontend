import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useSistemaStore } from '@/features/sistema/stores/useSistemaStore';

interface Props {
  children: React.ReactNode;
}

export const PhaseActionGuard = ({ children }: Props) => {
  const { capabilities, isLoadingCapabilities } = useSistemaStore();

  if (isLoadingCapabilities) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 text-principal-600 animate-spin" />
        <span className="sr-only">Verificando permisos...</span>
      </div>
    );
  }

  const tienePermisos = capabilities?.acciones_permitidas && capabilities.acciones_permitidas.length > 0;
  const esAdmin = capabilities?.roles?.includes('Administrador');

  if (!tienePermisos && esAdmin) {
    return <Navigate to="/configuracionFasesGlobales" replace />;
  }
  return <>{children}</>;
};