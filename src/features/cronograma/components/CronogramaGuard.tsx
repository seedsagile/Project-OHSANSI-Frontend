import { Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { cronogramaService } from '../services/cronogramaServices';

interface Props {
  children: React.ReactNode;
}

export const CronogramaGuard = ({ children }: Props) => {
  const { data: fases = [], isLoading } = useQuery({
    queryKey: ['fasesGlobales'],
    queryFn: cronogramaService.obtenerFasesActuales,
    retry: 1,
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 text-principal-600 animate-spin" />
      </div>
    );
  }

  const tieneConfig = fases.some(f => f.codigo === 'CONFIGURACION');
  const tieneEval = fases.some(f => f.codigo === 'EVALUACION');
  const tieneFinal = fases.some(f => f.codigo === 'FINAL');

  const configuracionCompleta = tieneConfig && tieneEval && tieneFinal;
  if (!configuracionCompleta) {
    return <Navigate to="/configuracionCronograma" replace />;
  }

  return <>{children}</>;
};