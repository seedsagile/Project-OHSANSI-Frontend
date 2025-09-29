import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { PaginaAsignarEvaluador } from './features/evaluadores/routes/PaginaAsignarEvaluador';
import { AppRoutes} from './features/evaluadores/login/routes/AppRoutes';
import "./styles/index.css";
import { AuthProvider } from './features/evaluadores/login/contexts/AuthContext';

// 1. Creamos una instancia del cliente de queries
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* 2. Envolvemos la aplicación con el QueryClientProvider */}
    <QueryClientProvider client={queryClient}>
      
      {/* Página principal que se renderiza - CAMBIADO A EVALUADORES*/}
      <PaginaAsignarEvaluador />
      
     
      <AuthProvider> {/* <-- Envuelve aquí */}
        <AppRoutes />
        <Toaster position="top-right" />
      </AuthProvider>

      {/* 3. Añadimos el componente Toaster para las notificaciones */}
      <Toaster position="top-right" />
    </QueryClientProvider>
  </React.StrictMode>
);