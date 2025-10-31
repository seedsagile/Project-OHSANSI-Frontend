// Define qué campos son *realmente* enviados en el payload según el ejemplo
export type PersonaPayloadAPI = {
  nombre: string;
  apellido: string;
  ci: string;
  genero: 'M' | 'F'; // Backend requiere M o F
  telefono: string | null; // Incluido en el ejemplo
  email: string;
};

export type CompetidorPayloadAPI = {
  grado_escolar: string; // Requerido por backend
  departamento: string; // Requerido por backend
  contacto_tutor: string | null; // Incluido en el ejemplo, enviar null si no existe
};

export type InstitucionPayloadAPI = {
  nombre: string; // Requerido por backend
};

export type CompetidorIndividualPayloadAPI = {
  persona: PersonaPayloadAPI;
  competidor: CompetidorPayloadAPI;
  institucion: InstitucionPayloadAPI;
  area: { nombre: string }; // Requerido por backend
  nivel: { nombre: string }; // Requerido por backend
};

// Payload principal para la API de importación
export type InscripcionPayloadAPI = {
  nombre_archivo: string;
  competidores: CompetidorIndividualPayloadAPI[];
};

// --- Tipos para el procesamiento del CSV (pueden ser más amplios) ---
export type CompetidorCSV = {
  nro?: string;
  nombres: string;
  apellidos: string;
  ci: string;
  email: string;
  departamento: string;
  // celular_tutor es opcional en el CSV pero usado en competidor.contacto_tutor
  celular_tutor?: string;
  colegio_institucion: string;
  area: string;
  nivel: string;
  fecha_nacimiento?: string; // Útil para validación frontend si se quiere
  genero?: string; // Requerido ('M' o 'F')
  celular_estudiante?: string; // Mapeado a persona.telefono
  grado_escolar?: string; // Requerido
  celular_emergencia?: string; // No enviado a la API
  tipo_colegio?: string; // No enviado a la API
  departamento_colegio?: string; // No enviado a la API
  nombre_tutor?: string; // No enviado a la API
  direccion_colegio?: string; // No enviado a la API
  telefono_colegio?: string; // No enviado a la API
  grupo?: string; // No enviado a la API
  descripcion_del_grupo?: string; // No enviado a la API
  capacidad_del_grupo?: string; // No enviado a la API
};

export type FilaProcesada = {
  datos: Partial<CompetidorCSV>; // Mantiene todos los datos del CSV
  rawData: { [key: string]: string };
  esValida: boolean;
  errores?: { [key: string]: string };
  numeroDeFila: number;
};

// --- Otros tipos (ApiErrorResponse, NivelAsignado, AreaConNiveles, ApiResponseAreas) sin cambios ---
export type ApiErrorResponse = {
  message?: string;
  error?: string;
  errors?: {
    [key: string]: string[];
  };
};

export type NivelAsignado = {
  id_nivel: number;
  nombre: string;
  // orden?: number; // No presente en la respuesta GET /areas-con-niveles
  asignado_activo: boolean;
};

export type AreaConNiveles = {
  id_area: number;
  nombre: string;
  // activo?: boolean; // No presente en la respuesta GET /areas-con-niveles
  niveles: NivelAsignado[];
};

export type ApiResponseAreas = {
  success: boolean;
  data: AreaConNiveles[];
  olimpiada_actual?: string;
  message: string;
};

// Alias para usar en el hook y servicio (tipos que se envían a la API)
export type { InscripcionPayloadAPI as InscripcionPayload };