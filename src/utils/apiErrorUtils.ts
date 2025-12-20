import { AxiosError } from 'axios';

interface LaravelValidationError {
  message: string;
  errors?: Record<string, string[]>;
}

export const extractErrorMessage = (error: unknown): { title: string; details: string[] } => {
  let title = 'Ocurrió un error inesperado';
  let details: string[] = [];

  if (!error) {
    return { title, details };
  }

  if (error instanceof AxiosError && error.response) {
    const status = error.response.status;
    const data = error.response.data as LaravelValidationError | any;

    if (status === 422 && data.errors) {
      title = data.message || 'Error de validación';
      details = Object.values(data.errors).flat() as string[];
      return { title, details };
    }

    if (status === 401 || status === 403) {
      title = 'Acceso Denegado';
      details = [data.message || 'No tienes permisos para realizar esta acción.'];
      return { title, details };
    }

    if (status >= 500) {
      title = 'Error del Servidor';
      details = ['Ocurrió un problema interno. Por favor contacta a soporte.'];
    } else {
      title = 'Error en la solicitud';
      details = [data.message || error.message];
    }
    
    return { title, details };
  }

  if (error instanceof AxiosError && error.request) {
    title = 'Error de Conexión';
    details = ['No se pudo conectar con el servidor. Verifica tu internet.'];
    return { title, details };
  }

  if (error instanceof Error) {
    details = [error.message];
  } else if (typeof error === 'string') {
    details = [error];
  }

  return { title, details };
};