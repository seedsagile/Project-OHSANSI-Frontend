export type Evaluador = {
    id: number;
    name: string;
    emailStudent: string;
    ci: string;
    codigoAcceso: string;
    imagen?: string;
};

export type CrearEvaluadorData = {
    name: string;
    emailStudent: string;
    ci: string;
    codigoAcceso: string;
    imagen?: string;
};