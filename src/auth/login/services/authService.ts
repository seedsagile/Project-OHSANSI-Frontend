
import type { LoginCredentials, User } from '../types/auth';
//import { API_BASE_URL } from '../utils/constants';

class AuthService {
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    const response = await fetch(`http://localhost:8000/api/v1/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Error ${response.status}: ${response.statusText}`);
    }
    const userData = data.data; 
    const user: User = {
      id: String(userData.id_usuario),
      email: userData.persona.email,
      name: userData.nombre,
      role: userData.rol,
      area: userData.codigo_evaluador?.descripcion
    };

    return { user, token: data.access_token };
  }

  async getCurrentUser(token: string): Promise<User> {
    const response = await fetch(`http://localhost:8000/api/v1/login`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error obteniendo usuario actual');
    }

    const data = await response.json();

    const userData = data.data;
    const user: User = {
      id: String(userData.id_usuario),
      email: userData.persona.email,
      name: userData.nombre,
      role: userData.rol,
      area: userData.codigo_evaluador?.descripcion
    };

    return user;
  }
}

export const authService = new AuthService();