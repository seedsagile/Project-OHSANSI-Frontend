import apiClient from '../../../api/ApiPhp';
import type { 
  LoginCredentials, 
  User, 
  UserRole, 
  LoginApiResponse, 
  MeApiResponse 
} from '../types/auth';

type UserApiResponse = LoginApiResponse['user'];

const mapApiRoleToFrontendRole = (apiRoleName: string): UserRole => {
  if (!apiRoleName) return 'desconocido';
  
  const lowerCaseRole = apiRoleName.toLowerCase().replace(/\s+/g, '');

  switch (lowerCaseRole) {
    case 'evaluador': return 'evaluador';
    case 'privilegiado': return 'privilegiado';
    case 'responsablearea': return 'responsable';
    case 'encargado': return 'encargado';
    case 'administrador': return 'administrador';
    default:
      console.warn(`Rol desconocido recibido de la API: ${apiRoleName}`);
      return 'desconocido';
  }
};

const _mapApiUserToFrontendUser = (apiUser: UserApiResponse): User => {
  const roleFromApi = apiUser.roles?.[0];

  if (!roleFromApi) {
    console.error('Error de mapeo: Usuario sin roles:', apiUser);
    throw new Error('El usuario no tiene roles asignados.');
  }

  const userRole = mapApiRoleToFrontendRole(roleFromApi);
  
  return {
    id_usuario: apiUser.id_usuario,
    email: apiUser.email,
    nombre: apiUser.nombre,
    apellido: apiUser.apellido,
    role: userRole,
  };
};

class AuthService {
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    console.log('[AuthService] Enviando credenciales...');
    const response = await apiClient.post<LoginApiResponse>('/auth/login', credentials);
    
    const { access_token, user: apiUser } = response.data;

    if (!access_token) throw new Error('Token no recibido.');

    return { 
      user: _mapApiUserToFrontendUser(apiUser), 
      token: access_token 
    };
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<MeApiResponse>('/auth/me');
    
    const apiUser = response.data.user;

    if (!apiUser) throw new Error('Respuesta inválida de /auth/me');

    return _mapApiUserToFrontendUser(apiUser);
  }
}

export const authService = new AuthService();