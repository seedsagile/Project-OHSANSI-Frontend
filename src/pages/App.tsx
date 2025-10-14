<<<<<<< HEAD
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { RootLayout } from '../components/layout/RootLayout';
import { PaginaImportarCompetidores } from '../features/inscritos/routes/PaginaImportarCompetidores';
import { PaginaAsignarResponsable } from '../features/responsables/routes/PaginaAsignarResponsable';
import { PaginaAreas } from '../features/areas/routes/PaginaAreas';

import { AuthInitializer } from '../auth/login/components/auth/AuthInitializer';
import { LoginForm } from '../auth/login/components/auth/LoginForm';
import { ProtectedRoute } from '../auth/login/components/auth/ProtectedRoute';
import { useAuth } from '../auth/login/hooks/useAuth';
import { PaginaAsignarEvaluador } from '../features/evaluadores/routes/PaginaAsignarEvaluador';
import { PaginaNiveles } from '../features/niveles/routes/PaginaNiveles';
import { PaginaAsignarNiveles } from '../features/asignaciones/routes/PaginaAsignarNiveles';

const Dashboard = () => (
  <div className="p-8">
    <h1 className="text-4xl font-bold text-neutro-800 justify-center text-center">Dashboard</h1>
    <p className="mt-2 text-neutro-600 text-center">Bienvenido al panel de administración.</p>
=======
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { RootLayout } from "../components/layout/RootLayout";
import { PaginaImportarCompetidores } from "../features/inscritos/routes/PaginaImportarCompetidores";
import { PaginaAsignarResponsable } from "../features/responsables/routes/PaginaAsignarResponsable";
import { PaginaAreas } from "../features/areas/routes/PaginaAreas";

import { AuthInitializer } from "../auth/login/components/auth/AuthInitializer";
import { LoginForm } from "../auth/login/components/auth/LoginForm";
import { ProtectedRoute } from "../auth/login/components/auth/ProtectedRoute";
import { useAuth } from "../auth/login/hooks/useAuth";
import { PaginaAsignarEvaluador } from "../features/evaluadores/routes/PaginaAsignarEvaluador";
import { PaginaNiveles } from "../features/niveles/routes/PaginaNiveles";
import { PaginaAsignarNiveles } from "../features/asignaciones/routes/PaginaAsignarNiveles";
import { ListaCompetidores } from "../features/listaCompetidores/components/ListaCompetidores";

const Dashboard = () => (
  <div className="p-8">
    <h1 className="text-4xl font-bold text-neutro-800 justify-center text-center">
      Dashboard
    </h1>
    <p className="mt-2 text-neutro-600 text-center">
      Bienvenido al panel de administración.
    </p>
>>>>>>> V2-E12
  </div>
);

const LoginRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
<<<<<<< HEAD
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
=======
    return (
      <div className="min-h-screen flex items-center justify-center">
        Cargando...
      </div>
    );
>>>>>>> V2-E12
  }
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginForm />;
};

const router = createBrowserRouter([
  {
<<<<<<< HEAD
    path: '/login',
    element: <LoginRoute />,
  },
  {
    path: '/',
=======
    path: "/login",
    element: <LoginRoute />,
  },
  {
    path: "/",
>>>>>>> V2-E12
    element: (
      <ProtectedRoute>
        <RootLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
<<<<<<< HEAD
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'competidores', element: <PaginaImportarCompetidores /> },
      { path: 'responsables', element: <PaginaAsignarResponsable /> },
      { path: 'evaluadores', element: <PaginaAsignarEvaluador /> },
      { path: 'areas', element: <PaginaAreas /> },
      { path: 'niveles', element: <PaginaNiveles /> },
      { path: 'asignarNiveles', element: <PaginaAsignarNiveles /> },
=======
      { path: "dashboard", element: <Dashboard /> },
      { path: "competidores", element: <PaginaImportarCompetidores /> },
      { path: "responsables", element: <PaginaAsignarResponsable /> },
      { path: "evaluadores", element: <PaginaAsignarEvaluador /> },
      { path: "areas", element: <PaginaAreas /> },
      { path: "niveles", element: <PaginaNiveles /> },
      { path: "asignarNiveles", element: <PaginaAsignarNiveles /> },
      { path: "listaCompetidores", element: <ListaCompetidores /> },
>>>>>>> V2-E12
    ],
  },
]);

function App() {
  return (
    <>
      <AuthInitializer />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
