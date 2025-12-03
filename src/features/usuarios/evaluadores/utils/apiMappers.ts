import type {
  DatosPersonaVerificada,
  EvaluadorCreado,
  Gestion,
  ApiUsuarioResponse,
  VerificacionUsuarioCompleta,
  ApiAsignacionDetalle,
  ApiRolDetalle,
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
  let initialAsignaciones: ApiAsignacionDetalle[] = [];
  let esResponsableExistente = false;

  const gestionActual = apiData.roles_por_gestion.find(
    (g) => g.gestion === GESTION_ACTUAL_ANIO
  );

  if (gestionActual) {
    const rolEvaluador = gestionActual.roles.find(
      (r) => r.rol === 'Evaluador'
    );
    const rolResponsable = gestionActual.roles.find(
      (r) => r.rol === 'Responsable Area' 
    );
    esResponsableExistente = !!rolResponsable;

    const detalles = rolEvaluador?.detalles as ApiRolDetalle | undefined;

    if (
      detalles &&
      detalles.asignaciones_evaluador &&
      detalles.asignaciones_evaluador.length > 0
    ) {
      isAssignedToCurrentGestion = true;
      initialAsignaciones = detalles.asignaciones_evaluador;
    }
  }

  return {
    datosPersona,
    isAssignedToCurrentGestion,
    initialAsignaciones,
    gestionesPasadas,
    rolesPorGestion: apiData.roles_por_gestion,
    esResponsableExistente,
  };
};

export const mapApiEvaluadorModificado = (
  apiData: ApiModificacionResponse | null | undefined
): EvaluadorCreado => {
  if (!apiData || typeof apiData.message !== 'string') {
    console.error('Respuesta inválida al crear/asignar evaluador:', apiData);
    throw new Error(
      "La respuesta del servidor no tiene el formato esperado (falta 'message')."
    );
  }
  
  const evaluadorCreado: EvaluadorCreado = {
    ...apiData,
  };

  return evaluadorCreado;
};