import type { MatrizConfiguracionResponse } from '../types';

export const mockConfiguracion2025: MatrizConfiguracionResponse = {
  
  // 1. Identificador de la gestión que estamos configurando
  gestion: '2025',

  // 2. Definición de las Columnas (Fases Globales)
  fases: [
    { 
      id_fase: 1, 
      nombre: 'Fase de Configuración', 
      codigo: 'CONFIG', 
      orden: 1, 
      activa: false,
      descripcion: 'Etapa inicial para registro de participantes y configuración de pruebas.' 
    },
    { 
      id_fase: 2, 
      nombre: 'Fase de Calificación', 
      codigo: 'EVAL', 
      orden: 2, 
      activa: true, // <--- Simulamos que el sistema está actualmente en esta fase
      descripcion: 'Etapa de carga de notas y validación por parte de evaluadores.'
    },
    { 
      id_fase: 3, 
      nombre: 'Fase Final', 
      codigo: 'FINAL', 
      orden: 3, 
      activa: false,
      descripcion: 'Cierre de gestión, publicación de resultados y certificados.'
    },
  ],

  // 3. Definición de las Filas (Acciones del Sistema)
  // Agrupadas por categorías para facilitar la lectura visual en la tabla
  acciones: [
    // --- Grupo: Gestión de Usuarios y Registros ---
    { 
      id_accion: 1, 
      nombre: 'Registrar Estudiantes', 
      codigo: 'REG_ESTUDIANTES', 
      categoria: 'Gestión Usuarios' 
    },
    { 
      id_accion: 2, 
      nombre: 'Editar Datos de Estudiantes', 
      codigo: 'EDIT_ESTUDIANTES', 
      categoria: 'Gestión Usuarios' 
    },
    { 
      id_accion: 3, 
      nombre: 'Registrar Evaluadores', 
      codigo: 'REG_EVALUADORES', 
      categoria: 'Gestión Usuarios' 
    },
    { 
      id_accion: 4, 
      nombre: 'Asignar Responsables de Área', 
      codigo: 'ASIGNAR_RESPONSABLES', 
      categoria: 'Gestión Usuarios' 
    },

    // --- Grupo: Gestión Académica ---
    { 
      id_accion: 5, 
      nombre: 'Configurar Exámenes/Áreas', 
      codigo: 'CONF_EXAMENES', 
      categoria: 'Académico' 
    },
    { 
      id_accion: 6, 
      nombre: 'Subir Bancos de Preguntas', 
      codigo: 'UPLOAD_QUESTIONS', 
      categoria: 'Académico' 
    },

    // --- Grupo: Evaluación y Notas ---
    { 
      id_accion: 7, 
      nombre: 'Cargar Notas', 
      codigo: 'CARGAR_NOTAS', 
      categoria: 'Evaluación' 
    },
    { 
      id_accion: 8, 
      nombre: 'Validar Calificaciones', 
      codigo: 'VALIDAR_NOTAS', 
      categoria: 'Evaluación' 
    },
    { 
      id_accion: 9, 
      nombre: 'Cerrar Actas de Sub-fases', 
      codigo: 'CERRAR_SUBFASES', 
      categoria: 'Evaluación' 
    },

    // --- Grupo: Resultados y Reportes ---
    { 
      id_accion: 10, 
      nombre: 'Publicar Clasificados', 
      codigo: 'PUB_CLASIFICADOS', 
      categoria: 'Resultados' 
    },
    { 
      id_accion: 11, 
      nombre: 'Generar Certificados', 
      codigo: 'GEN_CERTIFICADOS', 
      categoria: 'Resultados' 
    },
    { 
      id_accion: 12, 
      nombre: 'Exportar Reportes Finales', 
      codigo: 'EXP_REPORTES', 
      categoria: 'Resultados' 
    },
  ],

  // 4. Definición de la Matriz (Celdas: Checkboxes)
  // Define qué acción está permitida (true) o bloqueada (false) en cada fase.
  permisos: [
    // ========================================================================
    // FASE 1: CONFIGURACIÓN (Todo abierto para registro, cerrado para notas)
    // ========================================================================
    { id_fase: 1, id_accion: 1, habilitado: true },  // Registrar Estudiantes: SI
    { id_fase: 1, id_accion: 2, habilitado: true },  // Editar Estudiantes: SI
    { id_fase: 1, id_accion: 3, habilitado: true },  // Registrar Evaluadores: SI
    { id_fase: 1, id_accion: 4, habilitado: true },  // Asignar Responsables: SI
    { id_fase: 1, id_accion: 5, habilitado: true },  // Configurar Exámenes: SI
    { id_fase: 1, id_accion: 6, habilitado: true },  // Subir Preguntas: SI
    
    { id_fase: 1, id_accion: 7, habilitado: false }, // Cargar Notas: NO (Aún no empieza)
    { id_fase: 1, id_accion: 8, habilitado: false }, // Validar Notas: NO
    { id_fase: 1, id_accion: 9, habilitado: false }, // Cerrar Actas: NO
    { id_fase: 1, id_accion: 10, habilitado: false }, // Publicar: NO
    { id_fase: 1, id_accion: 11, habilitado: false }, // Certificados: NO
    { id_fase: 1, id_accion: 12, habilitado: false }, // Reportes: NO

    // ========================================================================
    // FASE 2: CALIFICACIÓN (Cerrado registro, abierto notas)
    // ========================================================================
    { id_fase: 2, id_accion: 1, habilitado: false }, // Registrar Estudiantes: NO (Plazo cerrado)
    { id_fase: 2, id_accion: 2, habilitado: true },  // Editar Estudiantes: SI (Correcciones menores)
    { id_fase: 2, id_accion: 3, habilitado: false }, // Registrar Evaluadores: NO
    { id_fase: 2, id_accion: 4, habilitado: false }, // Asignar Responsables: NO
    { id_fase: 2, id_accion: 5, habilitado: false }, // Configurar Exámenes: NO
    { id_fase: 2, id_accion: 6, habilitado: false }, // Subir Preguntas: NO
    
    { id_fase: 2, id_accion: 7, habilitado: true },  // Cargar Notas: SI (Foco principal)
    { id_fase: 2, id_accion: 8, habilitado: true },  // Validar Notas: SI
    { id_fase: 2, id_accion: 9, habilitado: true },  // Cerrar Actas: SI
    
    { id_fase: 2, id_accion: 10, habilitado: false }, // Publicar: NO (Aún en revisión)
    { id_fase: 2, id_accion: 11, habilitado: false }, // Certificados: NO
    { id_fase: 2, id_accion: 12, habilitado: true },  // Reportes: SI (Internos)

    // ========================================================================
    // FASE 3: FINAL (Cerrado todo edición, abierto lectura y exportación)
    // ========================================================================
    { id_fase: 3, id_accion: 1, habilitado: false },
    { id_fase: 3, id_accion: 2, habilitado: false },
    { id_fase: 3, id_accion: 3, habilitado: false },
    { id_fase: 3, id_accion: 4, habilitado: false },
    { id_fase: 3, id_accion: 5, habilitado: false },
    { id_fase: 3, id_accion: 6, habilitado: false },
    
    { id_fase: 3, id_accion: 7, habilitado: false }, // Cargar Notas: NO (Ya cerró)
    { id_fase: 3, id_accion: 8, habilitado: true },  // Validar Notas: SI (Solo lectura/auditoría)
    { id_fase: 3, id_accion: 9, habilitado: false }, // Cerrar Actas: NO (Ya están cerradas)
    
    { id_fase: 3, id_accion: 10, habilitado: true }, // Publicar: SI
    { id_fase: 3, id_accion: 11, habilitado: true }, // Certificados: SI
    { id_fase: 3, id_accion: 12, habilitado: true }, // Reportes: SI
  ],
};