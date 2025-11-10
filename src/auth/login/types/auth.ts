export type UserRole =
  | 'evaluador'
  | 'privilegiado'
  | 'responsable'
  | 'encargado'
  | 'administrador'
  | 'desconocido';

export interface User {
  id_usuario: number;  //editado por clau
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