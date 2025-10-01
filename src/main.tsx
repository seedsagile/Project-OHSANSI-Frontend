import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AppRoutes } from './features/evaluadores/login/routes/AppRoutes';
import "./styles/index.css";
import { AuthProvider } from './features/evaluadores/login/contexts/AuthContext';
import { PaginaAsignarEvaluador } from './features/evaluadores/routes/PaginaAsignarEvaluador';


const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>

      <PaginaAsignarEvaluador />
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);