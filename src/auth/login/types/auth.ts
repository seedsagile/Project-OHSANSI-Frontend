export type UserRole =
  | 'evaluador'
  | 'privilegiado'
  | 'responsable'
  | 'encargado'
  | 'administrador'
  | 'desconocido';

export interface User {
  id_usuario: number;
  email: string;
  nombre: string;
  apellido: string;
  role: UserRole;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

export interface LoginApiResponse {
  access_token: string;
  token_type: string;
  user: {
    id_usuario: number;
    nombre: string;
    apellido: string;
    email: string;
    roles: string[];
  };
}

export interface MeApiResponse {
  message: string;
  user: LoginApiResponse['user'];
}