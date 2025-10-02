export type CompetidorCSV = {
    nombre: string;
    ci: string;
    telftutor: string;
    colegio: string;
    departamento: string;
    nivel: string;
    area: string;
    tipodeinscripcion: string;
    [key: string]: string;
};

export type PersonaPayload = {
    nombre: string;
    apellido: string;
    ci: string;
    telefono: string | null;
    fecha_nac: string;
    genero: 'M' | 'F' | null;
    email: string;
};

export type CompetidorPayload = {
    grado_escolar: string | null;
    departamento: string | null;
    contacto_tutor: string | null;
    contacto_emergencia: string | null;
};

export type InstitucionPayload = {
    nombre: string;
    tipo: string | null;
    departamento: string | null;
    direccion: string | null;
    telefono: string | null;
};

export type GrupoPayload = {
    nombre: string | null;
    descripcion: string | null;
    max_integrantes: number | null;
};

export type CompetidorIndividualPayload = {
    persona: PersonaPayload;
    competidor: CompetidorPayload;
    institucion: InstitucionPayload;
    grupo: GrupoPayload;
    area: { nombre: string };
    nivel: { nombre: string };
};

export type InscripcionPayload = {
    competidores: CompetidorIndividualPayload[];
};

// Para manejar los errores de validación del backend
export type ApiErrorResponse = {
    message?: string;
    error?: string;
    errors?: {
        [key: string]: string[];
    };
};