// responsabless/types/index.ts
import type { Area as AreaGeneral } from '@/features/areas/types'; //

export type DatosPersonaVerificada = { //
  Id_usuario: number;
  Nombres: string;
  Apellidos: string;
  Correo: string;
  Ci: string;
  Teléfono: string;
  Rol?: {
    Id_rol: number;
    Nombre_rol: string;
  };
};

export type Gestion = { //
  Id_olimpiada: number;
  gestion: string;
};

export type AreaPasadaResponse = { //
  id_responsable_area: number;
  Area: {
    Id_area: number;
    Nombre: string;
  };
};

// Payload para Crear (POST)
export type CrearResponsablePayload = { //
  nombre: string;
  apellido: string;
  ci: string;
  email: string;
  password?: string; // Password es opcional al crear (backend puede generarlo)
  telefono: string;
  id_olimpiada?: number; // Puede ser opcional si el backend usa uno por defecto
  areas: number[];
};

// Payload para Actualizar (PUT) - Ajustado a la nueva estructura simple
export type ActualizarResponsablePayload = { //
  id_olimpiada: number; // ID de la olimpiada actual
  areas: number[];      // Lista completa de áreas asignadas
};

// Respuesta de Crear (POST)
export type ResponsableCreado = { //
  message: string;
  [key: string]: any; // Permite campos adicionales que pueda devolver la API
};

// Respuesta de Actualizar (PUT) - Puede ser similar a la de Crear
export type ResponsableActualizado = { //
  message: string;
  [key: string]: any; // Permite campos adicionales
};

// Estados del flujo de registro/edición
export type PasoRegistroResponsable = //
  | 'VERIFICACION_CI'
  | 'CARGANDO_VERIFICACION'
  | 'FORMULARIO_DATOS' // Representa tanto creación como edición
  | 'CARGANDO_GUARDADO' // Representa creación o actualización en progreso
  | 'READ_ONLY'; // Estado cuando el usuario ya está asignado

// Estado para el modal de feedback
export type ModalFeedbackState = { //
  isOpen: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
};

// Re-exporta el tipo Area general para uso dentro de esta feature
export type { AreaGeneral as Area }; //