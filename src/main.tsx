import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import "./styles/index.css";
import { PaginaImportarCompetidores } from './features/inscritos/routes/PaginaImportarCompetidores';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
    
      <PaginaImportarCompetidores />

      <Toaster position="top-right" />

    </QueryClientProvider>
  </React.StrictMode>
);