import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, type User } from '../hooks/useAuth';
import { LoginForm } from '../components/auth/LoginForm';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

const EvaluatorDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Panel del Evaluador</h1>
        <button 
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Cerrar Sesión
        </button>
      </div>
      <p>Bienvenido, {user?.name} ({user?.email})</p>
      <p>Área: {user?.area || 'No asignada'}</p>
    </div>
  );
};

const EncargadoDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Panel del Encargado</h1>
        <button 
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Cerrar Sesión
        </button>
      </div>
      <p>Bienvenido, {user?.name} ({user?.email})</p>
    </div>
  );
};

const PrivilegiadoDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Panel del Usuario Privilegiado</h1>
        <button 
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Cerrar Sesión
        </button>
      </div>
      <p>Bienvenido, {user?.name} ({user?.email})</p>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Panel de Administrador</h1>
        <button 
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Cerrar Sesión
        </button>
      </div>
      <p>Bienvenido, {user?.name} ({user?.email})</p>
      <p>Rol: Administrador</p>
    </div>
  );
};

const getDashboardByRole = (user: User | null) => {
  switch (user?.role) {
    case 'evaluador':
      return '/evaluador/dashboard';
    case 'encargado':
    case 'responsable':
      return '/encargado/dashboard';
    case 'privilegiado':
      return '/privilegiado/dashboard';
    case 'administrador':
      return '/admin/dashboard';
    default:
      return '/login';
  }
};

export const AppRoutes: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to={getDashboardByRole(user)} replace /> : <LoginForm />} />
        
        <Route path="/evaluador/dashboard" element={<ProtectedRoute allowedRoles={['evaluador']}><EvaluatorDashboard /></ProtectedRoute>} />
        <Route path="/encargado/dashboard" element={<ProtectedRoute allowedRoles={['encargado', 'responsable']}><EncargadoDashboard /></ProtectedRoute>} />
        <Route path="/privilegiado/dashboard" element={<ProtectedRoute allowedRoles={['privilegiado']}><PrivilegiadoDashboard /></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['administrador']}><AdminDashboard /></ProtectedRoute>} />

        <Route 
          path="/" 
          element={
            isAuthenticated 
              ? <Navigate to={getDashboardByRole(user)} replace /> 
              : <Navigate to="/login" replace />
          } 
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};