import type { CompetidorCSV, CompetidorIndividualPayload } from '../types/indexInscritos';
import { DEFAULT_FECHA_NAC, DEFAULT_GRADO_ESCOLAR } from '../constants';

export const mapCSVRenglonToPayload = (datos: CompetidorCSV): CompetidorIndividualPayload => {
    const esGrupal = datos.grupo || datos.descripcion_del_grupo || datos.capacidad_del_grupo;

    return {
        persona: {
            nombre: datos.nombres,
            apellido: datos.apellidos,
            ci: datos.ci,
            email: datos.email,
            fecha_nac: datos.fecha_nacimiento || DEFAULT_FECHA_NAC,
            genero: (datos.genero?.toUpperCase() as 'M' | 'F') || null,
            telefono: datos.celular_estudiante || null,
        },
        competidor: {
            grado_escolar: datos.grado_escolar || DEFAULT_GRADO_ESCOLAR,
            departamento: datos.departamento,
            nombre_tutor: datos.nombre_tutor || "",
            contacto_tutor: datos.celular_tutor,
            contacto_emergencia: datos.celular_emergencia || datos.celular_tutor,
        },
        institucion: {
            nombre: datos.colegio_institucion,
            tipo: datos.tipo_colegio || null,
            departamento: datos.departamento_colegio || datos.departamento,
            direccion: datos.direccion_colegio || null,
            telefono: datos.telefono_colegio || null,
        },
        grupo: {
            nombre: datos.grupo || (esGrupal ? `Grupo de ${datos.area}` : `Individual ${datos.ci}`),
            descripcion: datos.descripcion_del_grupo || 'Inscripción desde archivo CSV',
            max_integrantes: datos.capacidad_del_grupo ? parseInt(datos.capacidad_del_grupo, 10) : (esGrupal ? 5 : 1),
        },
        area: { nombre: datos.area },
        nivel: { nombre: datos.nivel }
    };
};