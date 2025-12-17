import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import axios from 'axios';
import { useAuthStore } from '../auth/login/stores/authStore';

declare global {
  interface Window {
    Pusher: typeof Pusher;
  }
}

window.Pusher = Pusher;

// Obtenemos la URL base (http://localhost:8000)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const echo = new Echo({
  broadcaster: 'reverb',
  key: import.meta.env.VITE_REVERB_APP_KEY || 'ohsansi_key',
  wsHost: import.meta.env.VITE_REVERB_HOST || 'localhost',
  wsPort: import.meta.env.VITE_REVERB_PORT ? Number(import.meta.env.VITE_REVERB_PORT) : 8080,
  wssPort: import.meta.env.VITE_REVERB_PORT ? Number(import.meta.env.VITE_REVERB_PORT) : 8080,
  forceTLS: false,
  enabledTransports: ['ws'], // Forzamos WS para evitar intentos fallidos WSS en local

  authorizer: (channel: { name: string }, _options: any) => {
    return {
      authorize: (socketId: string, callback: (error: Error | null, data?: any) => void) => {
        
        const user = useAuthStore.getState().user;
        const userId = user?.id_usuario;

        if (!userId) {
          console.error('[Echo] No hay usuario logueado para autorizar canal privado.');
          callback(new Error('Usuario no autenticado'));
          return;
        }

        // CORRECCIÓN CRÍTICA: Añadimos '/api' a la ruta de autenticación
        const authEndpoint = `${BASE_URL}/api/broadcasting/auth`;

        console.log(`🔌 [Echo] Autenticando canal ${channel.name} en: ${authEndpoint}`);

        axios.post(authEndpoint, {
          socket_id: socketId,
          channel_name: channel.name,
          user_id: userId
        })
        .then(response => {
          callback(null, response.data);
        })
        .catch(error => {
          console.error('[Echo] Error de autorización:', error);
          const errorObj = error instanceof Error ? error : new Error('Error de autorización desconocido');
          callback(errorObj);
        });
      }
    };
  }
});