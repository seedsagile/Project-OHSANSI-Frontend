import apiClient from '../../../api/ApiPhp';
import type { LoginCredentials, User } from '../types/auth';
interface LoginApiResponse {
  access_token: string;
  data: {
    id_usuario: number;
    nombre: string;
    email: string;
    roles: Array<{ id_rol: number; nombre: string; [key: string]: any }>;
    apellido?: string;
    ci?: string;
    telefono?: string;
    codigo_evaluador?: {
      descripcion: string;
    };
  };
  message?: string;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    console.log("Enviando credenciales:", credentials);
    const response = await apiClient.post<LoginApiResponse>('/v1/login', credentials);
    console.log("Respuesta recibida del login:", response.data);

    const { data, access_token } = response.data;

    const roleFromApi = data.roles && data.roles.length > 0
                    ? data.roles[0].nombre
                    : undefined;

    if (!roleFromApi) {
      console.error("Error: No se pudo determinar el rol del usuario desde la respuesta:", data.roles);
      throw new Error("No se pudo obtener el rol del usuario desde la respuesta de la API.");
    }

    const userRole = roleFromApi.toLowerCase() as User['role'];

    const validRoles: Array<User['role']> = ['evaluador', 'privilegiado', 'responsable', 'encargado', 'administrador'];
    if (!validRoles.includes(userRole)) {
      console.error(`Error: El rol '${userRole}' (después de convertir a minúsculas) no es un rol válido en la definición del tipo User.`);
      console.log("Roles válidos definidos:", validRoles);
      throw new Error(`El rol '${userRole}' recibido no es válido.`);
    }

    const user: User = {
      id: String(data.id_usuario),
      email: data.email,
      name: data.nombre,
      role: userRole,
      area: data.codigo_evaluador?.descripcion,
    };

    console.log("Usuario mapeado:", user);
    console.log("Token obtenido:", access_token);

    if (!access_token) {
      console.error("Error: El token no fue recibido en la respuesta.");
      throw new Error("El token de acceso no fue recibido del servidor.");
    }

    return { user, token: access_token };
  }

  async getCurrentUser(): Promise<User> {
    console.log("Intentando obtener usuario actual (getCurrentUser)...");
    const response = await apiClient.get<{ data: LoginApiResponse['data'] }>('/v1/login');
    console.log("Respuesta recibida de getCurrentUser:", response.data);

    const { data } = response.data;

    const roleFromApi = data.roles && data.roles.length > 0
                        ? data.roles[0].nombre
                        : undefined;

    if (!roleFromApi) {
      console.error("Error en getCurrentUser: No se pudo determinar el rol:", data.roles);
      throw new Error("No se pudo obtener el rol del usuario actual.");
    }

    // *** CORRECCIÓN AQUÍ: Convertir a minúsculas ***
    const userRole = roleFromApi.toLowerCase() as User['role'];
    console.log(`Rol (getCurrentUser): '${roleFromApi}', convertido a minúsculas: '${userRole}'`);

    const validRoles: Array<User['role']> = ['evaluador', 'privilegiado', 'responsable', 'encargado', 'administrador'];
    if (!validRoles.includes(userRole)) {
      console.error(`Error en getCurrentUser: El rol '${userRole}' recibido no es válido.`);
      throw new Error(`El rol '${userRole}' recibido no es válido.`);
    }

    const user: User = {
      id: String(data.id_usuario),
      email: data.email,
      name: data.nombre,
      role: userRole,
      area: data.codigo_evaluador?.descripcion,
    };

    console.log("Usuario actual mapeado:", user);
    return user;
  }
}

export const authService = new AuthService();