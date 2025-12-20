import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/auth/login/hooks/useAuth'; 
import { useSistemaStore } from '@/features/sistema/stores/useSistemaStore';
import { sistemaService } from '@/features/sistema/services/sistemaService';
import { PantallaInicializacion } from './PantallaInicializacion';

interface Props {
  children: React.ReactNode;
}

export const SystemGuard = ({ children }: Props) => {
  const { isAuthenticated } = useAuth(); 
  const { status, setSystemData, setLoading } = useSistemaStore();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['sistemaEstado'],
    queryFn: sistemaService.obtenerEstadoSistema,
    enabled: isAuthenticated,
    staleTime: 0,
    retry: 1,
  });

  useEffect(() => {
    if (isLoading) {
      setLoading();
    } else if (data) {
      setSystemData(data);
    }
  }, [data, isLoading, setSystemData, setLoading]);

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  if (isLoading || (status === 'loading' && !isError)) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 text-principal-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium text-sm animate-pulse">
          Verificando estado del sistema...
        </p>
      </div>
    );
  }

  if (status === 'sin_gestion') {
    return <PantallaInicializacion />;
  }

  return <>{children}</>;
};