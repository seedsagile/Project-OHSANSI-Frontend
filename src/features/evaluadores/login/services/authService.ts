
import type { LoginCredentials, User } from '../types/auth';
//import { API_BASE_URL } from '../utils/constants';

class AuthService {
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    const response = await fetch(`http://localhost:8000/api/v1/evaluadores/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error en el login');
    }

    const data = await response.json();

    const user: User = {
      id: String(data.usuario.id_usuario),
      email: credentials.email, 
      name: data.usuario.nombre,
      role: data.usuario.rol === 'evaluador' ? 'evaluator' : data.usuario.rol, 
      area: data.codigo_evaluador?.descripcion
    };

    return { user, token: data.token };
  }

  async getCurrentUser(token: string): Promise<User> {
    const response = await fetch(`http://localhost:8000/api/v1/evaluadores/login`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error obteniendo usuario actual');
    }

    const data = await response.json();

    const user: User = {
      id: String(data.usuario.id_usuario),
      email: '',
      name: data.usuario.nombre,
      role: data.usuario.rol === 'evaluador' ? 'evaluator' : data.usuario.rol,
      area: data.codigo_evaluador?.descripcion
    };

    return user;
  }
}

export const authService = new AuthService();