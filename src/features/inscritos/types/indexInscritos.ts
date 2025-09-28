export type CompetidorCSV = {
    nombre: string;
    ci: string;
    telftutor: string;
    colegio: string;
    departamento: string;
    grado: string;
    nivel: string;
    area: string;
    tipodeinscripcion: string;
};

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

export type ApiErrorResponse = {
    error: string;
};