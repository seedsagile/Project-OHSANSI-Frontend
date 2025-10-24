import apiClient from '../../../api/ApiPhp';
import type { LoginCredentials, User, UserRole } from '../types/auth';interface LoginApiResponse {
  message: string;
  token: string;
  token_type: string;
  data: {
    user: {
      id: number;
      nombre: string;
      apellido: string;
      ci?: string;
      email: string;
      telefono?: string;
    };
    roles: Array<{
      id: number;
      nombre: string;
    }>;
    olimpiadas: Array<{
      id: number;
      nombre: string;
      gestion: string;
    }>;
  };
}

const mapApiRoleToFrontendRole = (apiRoleName: string): UserRole => {
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

class AuthService {
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    console.log("Enviando credenciales:", credentials);
    const response = await apiClient.post<LoginApiResponse>('/auth/login', credentials);
    console.log("Respuesta recibida del login:", response.data);

    const { token, data } = response.data;

    if (!token) {
      console.error("Error: El token no fue recibido en la respuesta.");
      throw new Error("El token de acceso no fue recibido del servidor.");
    }

    const roleFromApi = data.roles && data.roles.length > 0
                    ? data.roles[0].nombre
                    : undefined;

    if (!roleFromApi) {
      console.error("Error: No se pudo determinar el rol del usuario desde la respuesta:", data.roles);
      throw new Error("No se pudo obtener el rol del usuario desde la respuesta de la API.");
    }

    const userRole = mapApiRoleToFrontendRole(roleFromApi);
    if (userRole === 'desconocido') {
        throw new Error(`El rol '${roleFromApi}' recibido no es válido o no está mapeado.`);
    }

    const user: User = {
      id: String(data.user.id),
      email: data.user.email,
      nombre: data.user.nombre,
      apellido: data.user.apellido,
      role: userRole,
      ci: data.user.ci,
      telefono: data.user.telefono,
    };

    console.log("Usuario mapeado:", user);
    console.log("Token obtenido:", token);

    return { user, token };
  }

  async getCurrentUser(): Promise<User> {
    console.log("Intentando obtener usuario actual (getCurrentUser)...");
    const response = await apiClient.get<LoginApiResponse>('/v1/login');
    console.log("Respuesta recibida de getCurrentUser:", response.data);

    const { data } = response.data;

    const roleFromApi = data.roles && data.roles.length > 0
                        ? data.roles[0].nombre
                        : undefined;

    if (!roleFromApi) {
      console.error("Error en getCurrentUser: No se pudo determinar el rol:", data.roles);
      throw new Error("No se pudo obtener el rol del usuario actual.");
    }

    const userRole = mapApiRoleToFrontendRole(roleFromApi);
    if (userRole === 'desconocido') {
        throw new Error(`El rol '${roleFromApi}' recibido (getCurrentUser) no es válido o no está mapeado.`);
    }

    const user: User = {
      id: String(data.user.id),
      email: data.user.email,
      nombre: data.user.nombre,
      apellido: data.user.apellido,
      role: userRole,
      ci: data.user.ci,
      telefono: data.user.telefono,
    };

    console.log("Usuario actual mapeado:", user);
    return user;
  }
}

export const authService = new AuthService();