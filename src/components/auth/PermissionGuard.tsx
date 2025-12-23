import { ReactNode } from 'react';
import { LoaderCircle } from 'lucide-react';
import { useSistemaStore } from '@/features/sistema/stores/useSistemaStore';
import type { SystemPermissionCode } from '@/features/sistema/types/permisos.types';
import { AccessDenied } from '@/components/auth/AccessDenied';

interface PermissionGuardProps {
  children: ReactNode;
  requiredPermission: SystemPermissionCode;
}

export const PermissionGuard = ({ children, requiredPermission }: PermissionGuardProps) => {

  const { canAccess, capabilities, isLoadingCapabilities } = useSistemaStore();
  
  if (isLoadingCapabilities || !capabilities) {
    return (
      <div className="h-[50vh] w-full flex flex-col items-center justify-center gap-3">
        <LoaderCircle className="h-10 w-10 animate-spin text-principal-500" />
        <p className="text-sm text-gray-500 font-medium animate-pulse">
          Verificando permisos...
        </p>
      </div>
    );
  }

  const hasAccess = canAccess(requiredPermission);

  if (!hasAccess) {
    return <AccessDenied />;
  }
  return <>{children}</>;
};