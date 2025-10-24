import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { User } from '../../types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<User['role']>;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  // El hook 'useAuth' ahora obtiene los datos desde Zustand, pero la lógica de este componente no cambia.
  const { isAuthenticated, loading, user } = useAuth();

  // 1. Muestra un estado de carga mientras se valida el token inicial.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  // 2. Si no está autenticado, redirige a la página de login.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 3. (Opcional) Si se especifican roles, verifica que el usuario tenga el rol permitido.
  if (allowedRoles && (!user?.role || !allowedRoles.includes(user.role))) {
    // Si el rol no es permitido, lo redirige (en este caso a login, pero podría ser a una página de "acceso denegado").
    return <Navigate to="/login" replace />;
  }

  // 4. Si todo está en orden, renderiza el contenido protegido.
  return <>{children}</>;
};
