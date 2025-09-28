import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { PaginaAsignarEvaluador } from './features/evaluadores/routes/PaginaAsignarEvaluador';
import "./styles/index.css";

// 1. Creamos una instancia del cliente de queries
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* 2. Envolvemos la aplicación con el QueryClientProvider */}
    <QueryClientProvider client={queryClient}>
      
      {/* Página principal que se renderiza - CAMBIADO A EVALUADORES */}
      <PaginaAsignarEvaluador />
      
      {/* 3. Añadimos el componente Toaster para las notificaciones */}
      <Toaster position="top-right" />
    </QueryClientProvider>
  </React.StrictMode>
);