import type {
  DatosPersonaVerificada,
  ResponsableCreado,
  Gestion,
  ApiUsuarioResponse,
  VerificacionUsuarioCompleta,
} from '../types';
import { GESTION_ACTUAL_ANIO } from '../utils/constants';

interface ApiModificacionResponse {
  message: string;
  [key: string]: any;
}

export const mapApiUsuarioToVerificacionCompleta = (
  apiData: ApiUsuarioResponse | null | undefined
): VerificacionUsuarioCompleta => {
  if (!apiData || typeof apiData.id_usuario !== 'number') {
    console.warn('API de verificación de CI devolvió datos inválidos:', apiData);
    throw new Error('Respuesta de verificación de CI inválida o incompleta.');
  }

  const datosPersona: DatosPersonaVerificada = {
    Id_usuario: apiData.id_usuario,
    Nombres: apiData.nombre ?? '',
    Apellidos: apiData.apellido ?? '',
    Correo: apiData.email ?? '',
    Ci: apiData.ci ?? '',
    Teléfono: apiData.telefono ?? '',
  };

  const gestionesPasadas: Gestion[] = apiData.roles_por_gestion
    .filter((g) => g.gestion !== GESTION_ACTUAL_ANIO)
    .map((g) => ({
      Id_olimpiada: g.id_olimpiada,
      gestion: g.gestion,
    }));

  let isAssignedToCurrentGestion = false;
  let initialAreas: number[] = [];

  const gestionActual = apiData.roles_por_gestion.find(
    (g) => g.gestion === GESTION_ACTUAL_ANIO
  );

  if (gestionActual) {
    const rolResponsable = gestionActual.roles.find(
      (r) => r.rol === 'Responsable Area'
    );

    if (rolResponsable && rolResponsable.detalles?.areas_responsable) {
      isAssignedToCurrentGestion = true;
      initialAreas = rolResponsable.detalles.areas_responsable.map((a) => a.id_area);
    }
  }

  return {
    datosPersona,
    isAssignedToCurrentGestion,
    initialAreas,
    gestionesPasadas,
    rolesPorGestion: apiData.roles_por_gestion,
  };
};

export const mapApiResponsableCreado = (
  apiData: ApiModificacionResponse | null | undefined
): ResponsableCreado => {
  if (!apiData || typeof apiData.message !== 'string') {
    console.error('Respuesta inválida al crear/asignar responsable:', apiData);
    throw new Error(
      "La respuesta del servidor no tiene el formato esperado (falta 'message')."
    );
  }
  const responsableCreado: ResponsableCreado = {
    ...apiData,
  };

  return responsableCreado;
};