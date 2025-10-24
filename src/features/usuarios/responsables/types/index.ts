// src/features/usuarios/responsables/types/index.ts

// Importamos el tipo Area ya existente si es el mismo que usamos en otras partes
import type { Area } from '@/features/areas/types'; // Asegúrate que la ruta sea correcta

/**
 * Describe los datos de una persona obtenidos tras verificar su CI en la API.
 * Ajusta los campos según lo que realmente devuelva tu endpoint de verificación.
 */
export type DatosPersonaVerificada = {
  id_persona?: number; // Puede ser undefined si la persona es nueva
  nombres: string;
  apellidos: string;
  email: string; // Puede ser correo personal, el formulario pide institucional
  celular: string; // O telefono
  // Podría incluir más datos si la API los devuelve (ej: fecha_nac, genero)
};

/**
 * Describe la estructura de una Gestión (para el dropdown opcional).
 * Ajusta según cómo obtengas estos datos de tu API.
 */
export type Gestion = {
  id_gestion: number; // O string si usas IDs diferentes
  nombre: string; // Ejemplo: "Gestión 2024", "Olimpiada Verano 2023"
};

/**
 * Define la estructura del payload que se enviará a la API
 * para crear (registrar) un nuevo responsable de área.
 * Asegúrate de que coincida con lo que espera tu backend.
 */
export type CrearResponsablePayload = {
  persona: {
    nombre: string;
    apellido: string;
    ci: string;
    email: string; // Correo institucional del formulario
    telefono: string; // Celular del formulario
    fecha_nac?: string; // Opcional o requerido por API?
    genero?: 'M' | 'F' | null; // Opcional o requerido por API?
  };
  id_gestion_pasada?: number; // Opcional
  areas: number[]; // Array de IDs de las áreas seleccionadas
};

/**
 * Describe la respuesta esperada de la API al crear exitosamente un responsable.
 * Ajusta según la estructura real de tu respuesta.
 */
export type ResponsableCreado = {
  id_responsable: number;
  persona: {
    id_persona: number;
    nombre: string;
    apellido: string;
    email: string;
  };
  usuario: {
    id_usuario: number;
    email: string;
    rol: string;
  };
  areas_asignadas: Array<{ id_area: number; nombre: string }>;
  message: string;
};

/**
 * Representa los diferentes pasos o estados visuales del proceso de registro.
 */
export type PasoRegistroResponsable =
  | 'VERIFICACION_CI'
  | 'CARGANDO_VERIFICACION'
  | 'FORMULARIO_DATOS'
  | 'CARGANDO_GUARDADO';

/**
 * Tipo para el estado del modal de feedback (éxito o error).
 */
export type ModalFeedbackState = {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
};

// Exportamos el tipo Area también desde aquí para conveniencia
export type { Area };

// El tipo ResponsableFormData se definirá en validations.ts