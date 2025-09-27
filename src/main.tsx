import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import { PaginaAsignarResponsable } from './features/responsables/routes/PaginaAsignarResponsable';
import "./styles/index.css";

// 1. Creamos una instancia del cliente de queries
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* 2. Envolvemos la aplicación con el QueryClientProvider */}
    <QueryClientProvider client={queryClient}>
      
      {/* Página principal que se renderiza */}
      <PaginaAsignarResponsable />

      {/* 3. Añadimos el componente Toaster para las notificaciones */}
      <Toaster position="top-right" />

    </QueryClientProvider>
  </React.StrictMode>
);