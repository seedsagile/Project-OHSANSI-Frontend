import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import './styles/index.css';

// Componente Principal (Rutas)
import App from './routes/App';

// Contextos (Providers)
import { AuthProvider } from './auth/login/contexts/AuthProvider'; //
import { SystemProvider } from './context/SystemContext'; // El nuevo contexto que creamos

/**
 * Configuración de React Query para Producción.
 * Define comportamientos por defecto para todas las peticiones de la app.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Número de reintentos si falla una petición (útil para redes inestables)
      retry: 1,
      // Evita que la app recargue datos cada vez que el usuario cambia de pestaña
      // (El SystemContext anula esto específicamente porque es crítico)
      refetchOnWindowFocus: false,
      // Tiempo que los datos se consideran "frescos" antes de volver a pedir (5 minutos)
      staleTime: 1000 * 60 * 5,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* 1. Capa de Datos (React Query) */}
    <QueryClientProvider client={queryClient}>
      
      {/* 2. Capa de Autenticación (Maneja el Usuario y Token) */}
      <AuthProvider>
        
        {/* 3. Capa de Sistema (Maneja Gestión, Fases y Permisos RBAC) 
            NOTA: SystemProvider debe estar DENTRO de AuthProvider porque usa 'user.id'
        */}
        <SystemProvider>
          
          {/* 4. Aplicación y Rutas */}
          <App />
          
          {/* 5. Feedback Global (Toasts) */}
          <Toaster position="top-right" reverseOrder={false} />
          
        </SystemProvider>
      </AuthProvider>
      
    </QueryClientProvider>
  </React.StrictMode>
);