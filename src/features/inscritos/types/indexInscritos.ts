export type CompetidorCSV = {
    nombres: string;
    apellidos: string;
    ci: string;
    email: string;
    departamento: string;
    celular_tutor: string;
    colegio_institucion: string;
    area: string;
    nivel: string;

    // ---- Columnas Opcionales (según .docx) ----
    // El `?` indica que pueden o no estar en el archivo CSV.
    fecha_nacimiento?: string;
    genero?: string;
    celular_estudiante?: string;
    grado_escolar?: string;
    celular_emergencia?: string;
    tipo_colegio?: string;
    departamento_colegio?: string;
    direccion_colegio?: string;
    telefono_colegio?: string;
    grupo?: string;
    descripcion_del_grupo?: string;
    capacidad_del_grupo?: string;
};

// --- TIPOS QUE SE MANTIENEN IGUAL (YA ERAN CORRECTOS) ---

// Representa una fila después de ser procesada, incluyendo su estado de validación.
export type FilaProcesada = {
    // Usamos Partial<> porque la fila puede tener errores antes de la validación completa
    datos: Partial<CompetidorCSV>; 
    esValida: boolean;
    errores?: { [key: string]: string };
    numeroDeFila: number;
};

// Payloads para la API (no necesitan cambios)
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

export type ApiErrorResponse = {
    message?: string;
    error?: string;
    errors?: {
        [key: string]: string[];
    };
};