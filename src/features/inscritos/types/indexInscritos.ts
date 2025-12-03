export type PersonaPayloadAPI = {
  nombre: string;
  apellido: string;
  ci: string;
  genero: 'M' | 'F';
  telefono: string | null;
  email: string;
};

export type CompetidorPayloadAPI = {
  grado_escolar: string;
  departamento: string;
  contacto_tutor: string | null;
};

export type InstitucionPayloadAPI = {
  nombre: string;
};

export type CompetidorIndividualPayloadAPI = {
  persona: PersonaPayloadAPI;
  competidor: CompetidorPayloadAPI;
  institucion: InstitucionPayloadAPI;
  area: { nombre: string };
  nivel: { nombre: string };
};

export type InscripcionPayloadAPI = {
  nombre_archivo: string;
  competidores: CompetidorIndividualPayloadAPI[];
};

export type CompetidorCSV = {
  nro?: string;
  nombres: string;
  apellidos: string;
  ci: string;
  email: string;
  departamento: string;
  celular_tutor?: string;
  colegio_institucion: string;
  area: string;
  nivel: string;
  fecha_nacimiento?: string;
  genero?: string;
  celular_estudiante?: string;
  grado_escolar?: string;
  celular_emergencia?: string;
  tipo_colegio?: string;
  departamento_colegio?: string;
  nombre_tutor?: string;
  direccion_colegio?: string;
  telefono_colegio?: string;
  grupo?: string;
  descripcion_del_grupo?: string;
  capacidad_del_grupo?: string;
};

export type FilaProcesada = {
  datos: Partial<CompetidorCSV>;
  rawData: { [key: string]: string };
  esValida: boolean;
  errores?: { [key: string]: string };
  numeroDeFila: number;
};

export type ApiErrorResponse = {
  message?: string;
  error?: string;
  errors?: {
    [key: string]: string[];
  };
};

export type GradoAsignado = {
  id_grado_escolaridad: number;
  nombre_grado: string;
};

export type NivelAsignado = {
  id_nivel: number;
  nombre_nivel: string;
  grados: GradoAsignado[];
};

export type AreaConNiveles = {
  id_area: number;
  nombre: string;
  niveles: NivelAsignado[];
};

export type ApiResponseAreas = {
  success: boolean;
  data: AreaConNiveles[];
  olimpiada_actual?: string;
  message: string;
};

export interface DetalleDuplicado {
  nombre_completo: string;
  ci: string;
  motivo: string;
}

export interface ResumenImportacion {
  total_procesados: number;
  total_registrados: number;
  total_duplicados: number;
  total_errores: number;
}

export interface ImportacionResponse {
  success: boolean;
  message: string;
  data: {
    resumen: ResumenImportacion;
    archivo: {
      id: number;
      nombre: string;
    };
    competidores_creados: any[];
  };
  detalles_duplicados?: DetalleDuplicado[];
}

export type { InscripcionPayloadAPI as InscripcionPayload };