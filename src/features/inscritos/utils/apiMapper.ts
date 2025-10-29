import type { CompetidorCSV, CompetidorIndividualPayloadAPI } from '../types/indexInscritos';
// DEFAULT_FECHA_NAC ya no se usa directamente en el payload
import { DEFAULT_GRADO_ESCOLAR } from '../constants';

export const mapCSVRenglonToPayload = (datos: CompetidorCSV): CompetidorIndividualPayloadAPI => {
  // Asegura que genero sea 'M', 'F', o null si no es válido o está ausente.
  // El backend requiere 'M' o 'F', la validación Zod ya debería asegurar esto.
  const generoValidado = datos.genero?.toUpperCase() === 'M' || datos.genero?.toUpperCase() === 'F'
    ? datos.genero.toUpperCase() as 'M' | 'F'
    : null; // O lanzar error si es requerido y falta

  // Si el backend requiere 'M' o 'F' obligatoriamente, y generoValidado es null,
  // la validación Zod ya debería haber fallado. Aquí asumimos que Zod lo validó.
  if (!generoValidado) {
      // Esta situación no debería ocurrir si Zod funcionó. Podrías lanzar un error
      // o revisar la validación Zod para 'genero'.
      console.error(`Error de mapeo: Género inválido ('${datos.genero}') para CI ${datos.ci}. Se requiere 'M' o 'F'.`);
      // Forzar un valor o dejar que el backend lo rechace si es null
  }


  return {
    persona: {
      nombre: datos.nombres,
      apellido: datos.apellidos,
      ci: datos.ci,
      // Usar celular_estudiante para persona.telefono, enviar null si no existe
      telefono: datos.celular_estudiante || null,
      genero: generoValidado!, // Usar el valor validado (asumiendo que Zod lo hizo requerido)
      email: datos.email,
      // fecha_nac ya no se envía según el payload de la API
    },
    competidor: {
      // grado_escolar es requerido, usar default si falta (aunque Zod debería validarlo)
      grado_escolar: datos.grado_escolar || DEFAULT_GRADO_ESCOLAR,
      // departamento es requerido (Zod debería validarlo)
      departamento: datos.departamento,
      // contacto_tutor usa celular_tutor, enviar null si no existe
      contacto_tutor: datos.celular_tutor || null,
      // nombre_tutor y contacto_emergencia ya no se envían
    },
    institucion: {
      // Solo se envía el nombre, requerido (Zod debería validarlo)
      nombre: datos.colegio_institucion,
      // tipo, departamento, direccion, telefono ya no se envían
    },
    area: { nombre: datos.area }, // Requerido (Zod valida)
    nivel: { nombre: datos.nivel }, // Requerido (Zod valida)
    // Objeto grupo eliminado
  };
};

// Re-exportar el tipo correcto si cambió el nombre
export type { CompetidorIndividualPayloadAPI };