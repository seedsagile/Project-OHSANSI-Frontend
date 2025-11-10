import type { Area as AreaGeneral } from '@/features/areas/types';
// 🔽 Importación de 'ResponsableFormData' eliminada de aquí para corregir el error ts(6133)

// --- Tipos de API (Respuesta) ---

export type ApiAreaResponsable = {
  id_area: number;
  nombre_area: string;
};

export type ApiRolDetalle = {
  areas_responsable?: ApiAreaResponsable[];
  [key: string]: any; // Permite otros detalles (ej. evaluador)
};

export type ApiRolPorGestion = {
  rol: string;
  detalles: ApiRolDetalle | null;
};

export type ApiGestionRoles = {
  id_olimpiada: number;
  gestion: string;
  roles: ApiRolPorGestion[];
};

export type ApiUsuarioResponse = {
  id_usuario: number;
  nombre: string;
  apellido: string;
  ci: string;
  email: string;
  telefono: string;
  created_at: string;
  updated_at: string;
  roles_por_gestion: ApiGestionRoles[];
};

// --- Tipos de Dominio (Frontend) ---

/**
 * Objeto de dominio limpio que representa los datos de la verificación.
 * Generado por apiMappers.ts
 */
export type VerificacionUsuarioCompleta = {
  datosPersona: DatosPersonaVerificada;
  isAssignedToCurrentGestion: boolean; // True si ya es RESPONSABLE en gestión actual
  initialAreas: number[];
  gestionesPasadas: Gestion[];
  rolesPorGestion: ApiGestionRoles[];
  // 🔽 CAMPOS NUEVOS PARA CUMPLIR CA
  esEvaluadorExistente: boolean; // True si tiene rol de Evaluador en gestión actual
  esResponsableExistente: boolean; // True si tiene rol de Responsable en gestión actual
};

export type DatosPersonaVerificada = {
  Id_usuario: number;
  Nombres: string;
  Apellidos: string;
  Correo: string;
  Ci: string;
  Teléfono: string;
};

export type Gestion = {
  Id_olimpiada: number;
  gestion: string;
};

export type AreaPasadaResponse = {
  id_responsable_area: number;
  Area: {
    Id_area: number;
    Nombre: string;
  };
};

// --- Tipos de API (Payload/Envío) ---

/**
 * Payload para crear un NUEVO responsable (Escenario 1).
 */
export type CrearResponsablePayload = {
  nombre: string;
  apellido: string;
  ci: string;
  email: string;
  password?: string;
  telefono: string;
  id_olimpiada?: number;
  areas: number[];
  force_create_role?: boolean; // 🔽 NUEVO CAMPO PARA CA (force_create_role)
};

/**
 * Payload para asignar áreas a un responsable EXISTENTE (Escenarios 2 y 3).
 */
export type AsignarResponsablePayload = {
  id_olimpiada: number;
  areas: number[];
};

// --- Tipos de Respuesta de Mutación ---

export type ResponsableCreado = {
  message: string;
  [key: string]: any;
};

export type ResponsableAsignado = ResponsableCreado;
export type ResponsableActualizado = ResponsableAsignado;

// --- Tipos de Estado Interno del Hook ---

export type PasoRegistroResponsable =
  | 'VERIFICACION_CI'
  | 'CARGANDO_VERIFICACION'
  | 'FORMULARIO_DATOS'
  | 'CARGANDO_GUARDADO';

/**
 * Estado para el modal de feedback (éxito, error, info)
 * y confirmación (sí/no).
 */
export type ModalFeedbackState = {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'confirmation';
  onConfirm?: () => void; // 🔽 Para el botón "Sí"
  confirmText?: string;
  cancelText?: string;
};

// --- Re-exportación de Tipos Generales ---

export type { AreaGeneral as Area };

// 🔽 Tipo del formulario de Zod (re-exportado directamente)
export type { ResponsableFormData } from '../utils/validations';