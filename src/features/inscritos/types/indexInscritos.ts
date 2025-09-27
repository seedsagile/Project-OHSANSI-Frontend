/**
 * Representa la estructura de una única fila de datos
 * tal como se lee del archivo CSV después de parsearlo.
 */
export type CompetidorCSV = {
    nombre: string;
    ci: string;
    telftutor: string;
    colegio: string;
    departamento: string;
    grado: string;
    nivel: string;
    area: string;
};

// --- Tipos para el Payload de la API ---

export type PersonaPayload = {
    nombre: string;
    apellido: string;
    ci: string;
    fecha_nac: string;
    genero: string;
    telefono: string;
    email: string;
};

export type CompetidorPayload = {
    grado_escolar: string;
    departamento: string;
    contacto_tutor: string;
    contacto_emergencia: string;
};

export type InstitucionPayload = {
    nombre: string;
    tipo: string;
    departamento: string;
    direccion: string;
    telefono: string;
};

export type GrupoPayload = {
    nombre: string;
    descripcion: string;
};

/**
 * Representa el objeto completo para un único competidor
 * que se enviará a la API.
 */
export type InscripcionPayload = {
    persona: PersonaPayload;
    competidor: CompetidorPayload;
    institucion: InstitucionPayload;
    grupo: GrupoPayload;
    max_integrantes: number;
    area: { 
        nombre: string;
    };
    nivel: { 
        nombre: string;
    };
};

/**
 * Define la estructura esperada para la respuesta de error de la API.
 * Esto nos permite evitar el uso de 'any' en el manejo de errores.
 */
export type ApiErrorResponse = {
  error: string;
};