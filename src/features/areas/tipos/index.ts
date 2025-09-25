export type Area = {
    id_area: number;            //ver db talvez es unico preguntar a maria
    nombre: string;
    descripcion?:string;
    activo: number;
    created_at: string;
    update_ad: string
};

export type CrearAreaData = {
    //id: number;            //ver db talvez es unico preguntar a maria
    nombre: string;
    descripcion?:string;
}