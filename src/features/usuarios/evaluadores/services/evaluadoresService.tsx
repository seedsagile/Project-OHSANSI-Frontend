//services/evaluadoresService.tsx
import type {
  Area,
  Nivel,
  CreateEvaluadorPayload,
  EvaluadorResponse,
} from '../types/IndexEvaluador';

const API_BASE_URL = 'http://localhost:8000/api/v1';

// ==================== TIPOS ====================
interface BackendValidationErrors {
  ci?: string[];
  email?: string[];
  [key: string]: string[] | undefined;
}

interface BackendResponse<T = unknown> {
  success?: boolean;
  message?: string;
  data?: T;
  errors?: BackendValidationErrors;
}

// ==================== ERROR PERSONALIZADO ====================
class ServiceError extends Error {
  readonly type?: 'CI_DUPLICADO' | 'EMAIL_DUPLICADO' | 'VALIDACION' | 'BACKEND' | 'NETWORK';
  readonly details?: BackendValidationErrors;

  constructor(message: string, type?: ServiceError['type'], details?: BackendValidationErrors) {
    super(message);
    this.name = 'ServiceError';
    this.type = type;
    this.details = details;
  }
}

// ==================== SERVICIO DE ÁREAS ====================
export const areasService = {
  async obtenerAreas(): Promise<Area[]> {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/area', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new ServiceError('Error al obtener las áreas', 'BACKEND');
      }

      const data: Area[] = await response.json();
      return data;
    } catch (err) {
      if (err instanceof ServiceError) throw err;
      throw new ServiceError('Error de red al obtener las áreas', 'NETWORK');
    }
  },
};

// ==================== SERVICIO DE NIVELES ====================
export const nivelesService = {
  async obtenerNivelesPorArea(idArea: number): Promise<Nivel[]> {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/area-niveles/detalle/${idArea}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new ServiceError('Error al obtener los niveles del área', 'BACKEND');
      }

      const responseData: BackendResponse<{ nivel: Nivel }[]> = await response.json();

      if (responseData.success && responseData.data) {
        const nivelesUnicos = responseData.data.reduce<Nivel[]>((acc, item) => {
          if (!acc.some((n) => n.id_nivel === item.nivel.id_nivel)) {
            acc.push(item.nivel);
          }
          return acc;
        }, []);
        return nivelesUnicos;
      }

      return [];
    } catch (err) {
      if (err instanceof ServiceError) throw err;
      throw new ServiceError('Error de red al obtener niveles', 'NETWORK');
    }
  },
};

// ==================== SERVICIO DE EVALUADORES ====================
export const evaluadoresService = {
  async crearEvaluador(payload: CreateEvaluadorPayload): Promise<EvaluadorResponse> {
    try {
      console.log('🔵 Enviando payload:', payload);

      const response = await fetch(`${API_BASE_URL}/evaluadores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      let responseData: BackendResponse<EvaluadorResponse>;

      try {
        responseData = JSON.parse(text);
      } catch {
        throw new ServiceError('La respuesta del servidor no es un JSON válido', 'BACKEND');
      }

      // ✅ Manejo de errores
      if (!response.ok) {
        if (response.status === 422 && responseData.errors) {
          const { errors } = responseData;

          if (errors.ci?.length) {
            throw new ServiceError(errors.ci[0], 'CI_DUPLICADO', errors);
          }
          if (errors.email?.length) {
            throw new ServiceError(errors.email[0], 'EMAIL_DUPLICADO', errors);
          }

          const primerError = Object.values(errors)[0]?.[0] ?? 'Error de validación';
          throw new ServiceError(primerError, 'VALIDACION', errors);
        }

        throw new ServiceError(responseData.message ?? 'Error al crear el evaluador', 'BACKEND');
      }

      console.log('✅ Evaluador creado exitosamente');
      return responseData.data as EvaluadorResponse;
    } catch (err) {
      if (err instanceof ServiceError) {
        console.error('❌ ServicioError:', err.type, err.message);
        throw err;
      }

      console.error('❌ Error inesperado:', err);
      throw new ServiceError('Error inesperado en el servicio', 'NETWORK');
    }
  },
};
