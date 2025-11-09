import apiClient from '../../../api/ApiPhp';
import type { LoginCredentials, User, UserRole } from '../types/auth';

interface LoginApiResponse {
  access_token: string;
  token_type: string;
  user: {
    id_usuario: number; //editado por clau
    nombre: string;
    apellido: string;
    email: string;
    roles: string[];
  };
}

type UserApiResponse = LoginApiResponse['user'];

const mapApiRoleToFrontendRole = (apiRoleName: string): UserRole => {
  if (!apiRoleName) {
    return 'desconocido';
  }
  const lowerCaseRole = apiRoleName.toLowerCase().replace(/\s+/g, '');

  switch (lowerCaseRole) {
    case 'evaluador':
      return 'evaluador';
    case 'privilegiado':
      return 'privilegiado';
    case 'responsablearea':
      return 'responsable';
    case 'encargado':
      return 'encargado';
    case 'administrador':
      return 'administrador';
    default:
      console.warn(`Rol desconocido recibido de la API: ${apiRoleName}`);
      return 'desconocido';
  }
};

const _mapApiUserToFrontendUser = (apiUser: UserApiResponse): User => {
  const roleFromApi =
    apiUser.roles && apiUser.roles.length > 0 ? apiUser.roles[0] : undefined;

  if (!roleFromApi) {
    console.error('Error de mapeo: No se pudo determinar el rol del usuario:', apiUser.roles);
    throw new Error('No se pudo obtener el rol del usuario desde la API.');
  }

  const userRole = mapApiRoleToFrontendRole(roleFromApi);
  if (userRole === 'desconocido') {
    throw new Error(`El rol '${roleFromApi}' recibido no es válido o no está mapeado.`);
  }

  const user: User = {
    id_usuario: apiUser.id_usuario, //editado por clau
    email: apiUser.email,
    nombre: apiUser.nombre,
    apellido: apiUser.apellido,
    role: userRole,
  };

  return user;
};


class AuthService {

  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    console.log('[AuthService] Enviando credenciales:', credentials);

    const response = await apiClient.post<LoginApiResponse>('/auth/login', credentials);
    console.log('[AuthService] Respuesta recibida de /auth/login:', response.data);

    const { access_token, user: apiUser } = response.data;

    if (!access_token) {
      console.error('[AuthService] Error: El access_token no fue recibido en la respuesta.');
      throw new Error('El token de acceso no fue recibido del servidor.');
    }

    const user = _mapApiUserToFrontendUser(apiUser);

    console.log('[AuthService] Usuario mapeado:', user);
    console.log('[AuthService] Token obtenido.');

    return { user, token: access_token };
  }

  async getCurrentUser(): Promise<User> {
    console.log('[AuthService] Intentando obtener usuario actual (GET /auth/me)...');

    const response = await apiClient.get<UserApiResponse>('/auth/me');
    console.log('[AuthService] Respuesta recibida de /auth/me:', response.data);

    const apiUser = response.data;

    const user = _mapApiUserToFrontendUser(apiUser);

    console.log('[AuthService] Usuario actual mapeado:', user);
    return user;
  }
}

export const authService = new AuthService();