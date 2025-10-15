import apiClient from '../../../api/ApiPhp';
import type { LoginCredentials, User } from '../types/auth';

interface LoginApiResponse {
  access_token: string;
  data: {
    id_usuario: number;
    nombre: string;
    rol: User['role'];
    persona: {
      email: string;
    };
    codigo_evaluador?: {
      descripcion: string;
    };
  };
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    const response = await apiClient.post<LoginApiResponse>('/v1/login', credentials);

    const { data, access_token } = response.data;

    const user: User = {
      id: String(data.id_usuario),
      email: data.persona.email,
      name: data.nombre,
      role: data.rol,
      area: data.codigo_evaluador?.descripcion,
    };

    return { user, token: access_token };
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<LoginApiResponse>('/v1/login');

    const { data } = response.data;

    const user: User = {
      id: String(data.id_usuario),
      email: data.persona.email,
      name: data.nombre,
      role: data.rol,
      area: data.codigo_evaluador?.descripcion,
    };

    return user;
  }
}

export const authService = new AuthService();
