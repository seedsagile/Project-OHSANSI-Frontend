//ESTES SON MIS TIPOS DE AREA DEBE SER REEMPLAZADO POR LO DEL VIVEL
export type Nivel = {
    id_nivel: number;
    nombre: string;
    descripcion?: string;
    id_area: number;
    activo: number;
    created_at: string;
    updated_at: string;
};

export type CrearNivelData = {
    nombre: string;
    descripcion?: string;
    id_area: number;
};