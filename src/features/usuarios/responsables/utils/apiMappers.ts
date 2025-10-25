import type { DatosPersonaVerificada, ResponsableCreado, Gestion } from '../types';

interface ApiUserResponse {
    Id_usuario: number;
    Nombres: string | null;
    Apellidos: string | null;
    Correo: string | null;
    Ci: string | null;
    Teléfono: string | null;
    Rol?: {
        Id_rol: number;
        Nombre_rol: string | null;
    } | null;
}

interface ApiResponsableCreadoResponse {
    message: string;
    responsable?: {
        id_responsable: number;
    };
    persona?: {
        id_persona: number;
        nombre: string;
        apellido: string;
        email: string;
    };
    usuario?: {
        id_usuario: number;
        email: string;
        rol: string | { id: number; nombre: string };
    };
    areas_asignadas?: Array<{
        id_area: number;
        nombre: string;
    }>;
    [key: string]: any;
}

interface ApiGestionResponse {
    Id_olimpiada: number;
    gestion: string;
}

export const mapApiUserDataToPersonaVerificada = (apiData: ApiUserResponse | null | undefined): DatosPersonaVerificada | null => {
    if (!apiData || typeof apiData.Id_usuario !== 'number') {
    console.warn("API de verificación de CI devolvió datos inválidos o sin Id_usuario:", apiData);
    return null;
    }

    const personaVerificada: DatosPersonaVerificada = {
    Id_usuario: apiData.Id_usuario,
    Nombres: apiData.Nombres ?? '',
    Apellidos: apiData.Apellidos ?? '',
    Correo: apiData.Correo ?? '',
    Ci: apiData.Ci ?? '',
    Teléfono: apiData.Teléfono ?? '',
    Rol: apiData.Rol && apiData.Rol.Nombre_rol ? {
    Id_rol: apiData.Rol.Id_rol,
    Nombre_rol: apiData.Rol.Nombre_rol,
    } : undefined,
    };

    return personaVerificada;
};

export const mapApiResponsableCreado = (apiData: ApiResponsableCreadoResponse | null | undefined): ResponsableCreado => {
    if (!apiData || typeof apiData.message !== 'string') {
        console.error("Respuesta inválida al crear responsable:", apiData);
        throw new Error("La respuesta del servidor al crear el responsable no tiene el formato esperado (falta 'message').");
    }
    const responsableCreado: ResponsableCreado = {
        ...apiData,
    };

    return responsableCreado;
};

export const mapApiGestionToGestion = (apiData: ApiGestionResponse[] | null | undefined): Gestion[] => {
    if (!Array.isArray(apiData)) {
        console.warn("API de gestiones pasadas no devolvió un array:", apiData);
        return [];
    }

    return apiData
        .filter(g => typeof g?.Id_olimpiada === 'number' && typeof g?.gestion === 'string')
        .map(g => ({
            Id_olimpiada: g.Id_olimpiada,
            gestion: g.gestion,
        }));
};