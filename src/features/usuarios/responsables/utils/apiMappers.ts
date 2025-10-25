// src/features/usuarios/responsables/utils/apiMappers.ts

import type { DatosPersonaVerificada, ResponsableCreado, Gestion } from '../types';

/**
 * Define la estructura esperada de la respuesta de la API para la verificación de CI.
 * AJUSTA ESTO para que coincida exactamente con lo que devuelve tu endpoint GET /usuarios/ci/{ci}.
 * Presta atención a mayúsculas/minúsculas y campos opcionales/nulos.
 */
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
    // Añade aquí cualquier otro campo que devuelva tu API al verificar CI
    // Ejemplo: fecha_nacimiento?: string | null;
}

/**
 * Define la estructura esperada de la respuesta de la API al crear un responsable.
 * AJUSTA ESTO para que coincida exactamente con lo que devuelve tu endpoint POST /responsables.
 */
interface ApiResponsableCreadoResponse {
    message: string;
    // Ejemplo: Asume una estructura anidada, ajusta si es diferente
    responsable?: {
        id_responsable: number;
        // otros campos...
    };
    persona?: {
        id_persona: number;
        nombre: string;
        apellido: string;
        email: string;
        // otros campos...
    };
    usuario?: {
        id_usuario: number;
        email: string;
        rol: string | { id: number; nombre: string }; // Ejemplo: Rol puede ser string u objeto
        // otros campos...
    };
    areas_asignadas?: Array<{
        id_area: number;
        nombre: string;
        // otros campos...
    }>;
    // Permite cualquier otro campo que la API pueda devolver
    [key: string]: any;
}

/**
 * Define la estructura esperada de la respuesta de la API para obtener gestiones pasadas.
 * AJUSTA ESTO para que coincida con tu endpoint GET /responsables/ci/{ci}/gestiones
 */
interface ApiGestionResponse {
    Id_olimpiada: number;
    gestion: string; // Ejemplo: "2023", "2024"
    // Añade otros campos si existen
}

/**
 * Mapea la respuesta de la API de verificación de CI al tipo `DatosPersonaVerificada` del frontend.
 *
 * @param apiData - El objeto 'data' recibido de la respuesta de la API (`/usuarios/ci/{ci}`). Puede ser null o undefined.
 * @returns Un objeto `DatosPersonaVerificada` o `null` si no hay datos válidos o falta el ID de usuario.
 */
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

/**
 * Mapea la respuesta de la API de creación de responsable al tipo `ResponsableCreado` del frontend.
 *
 * @param apiData - El objeto recibido de la respuesta de la API (`POST /responsables`).
 * @returns Un objeto `ResponsableCreado`. Lanza un error si faltan datos esenciales como el 'message'.
 */
export const mapApiResponsableCreado = (apiData: ApiResponsableCreadoResponse | null | undefined): ResponsableCreado => {
    if (!apiData || typeof apiData.message !== 'string') {
        console.error("Respuesta inválida al crear responsable:", apiData);
        throw new Error("La respuesta del servidor al crear el responsable no tiene el formato esperado (falta 'message').");
    }

    // Corrección: Se elimina la definición explícita de 'message'
    // ya que será incluida por el operador de propagación.
    const responsableCreado: ResponsableCreado = {
        // message: apiData.message, // <-- LÍNEA ELIMINADA
        ...apiData, // Copia todos los campos, incluyendo 'message'
        // Si necesitas mapear explícitamente OTROS campos con nombres diferentes, hazlo aquí:
        // ejemploCampoFrontend: apiData.ejemplo_campo_backend,
    };

    // El tipo ResponsableCreado permite campos adicionales

    return responsableCreado;
};

/**
 * Mapea la respuesta de la API de gestiones pasadas al tipo `Gestion` del frontend.
 *
 * @param apiData - El array recibido de la respuesta de la API (`GET /responsables/ci/{ci}/gestiones`).
 * @returns Un array de objetos `Gestion` o un array vacío si no hay datos o el formato es incorrecto.
 */
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

// Puedes añadir más funciones de mapeo aquí si es necesario.