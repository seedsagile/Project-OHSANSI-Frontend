import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoginForm } from '../components/auth/LoginForm';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

// Componente de placeholder para el dashboard del evaluador
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
      {/* Aquí irían las funcionalidades del evaluador */}
    </div>
  );
};

export const AppRoutes: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated && user?.role === 'evaluator' 
              ? <Navigate to="/dashboard" replace /> 
              : <LoginForm />
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <EvaluatorDashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};