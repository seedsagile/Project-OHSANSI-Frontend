import { SubFase, EstadoSubFase } from '../types';
// Importamos los datos simulados desde el archivo de utilidades
import { 
  MOCK_AREAS, 
  MOCK_NIVELES_MATEMATICAS,
  MOCK_NIVELES_ROBOTICA,
  MOCK_NIVELES_FISICA,
  MOCK_SUBFASES_MATE,
  MOCK_SUBFASES_ROBO,
  MOCK_SUBFASES_FISICA
} from '../utils/mocks';

/**
 * ============================================================================
 * SERVICIO DE SUB-FASES (MOCK IMPLEMENTATION)
 * ============================================================================
 * Este servicio actúa como intermediario entre la UI y los datos.
 * Simula llamadas asíncronas a una API y aplica reglas de negocio.
 */

// 🔹 VARIABLES DE PERSISTENCIA EN MEMORIA
// Al copiarlos aquí, podemos modificar el estado (iniciar/finalizar) y que se mantenga
// mientras el usuario no recargue la página.
let db_subfases_mate = [...MOCK_SUBFASES_MATE];
let db_subfases_robo = [...MOCK_SUBFASES_ROBO];
let db_subfases_fisica = [...MOCK_SUBFASES_FISICA];

export const subFasesService = {
  
  /**
   * 1. OBTENER ÁREAS DISPONIBLES
   * Simula: GET /areas
   * Retorna la lista maestra de áreas para el primer dropdown.
   */
  async obtenerAreasMock() {
    // Simulamos un pequeño retraso de red (300ms) para ver el estado de carga
    await new Promise((resolve) => setTimeout(resolve, 300));
    return MOCK_AREAS;
  },

  /**
   * 2. OBTENER NIVELES POR ÁREA
   * Simula: GET /niveles?areaId={areaId}
   * * LÓGICA CLAVE: Devuelve una lista diferente dependiendo del ID del área seleccionada.
   * Esto implementa la regla de negocio: "Un área tiene sus propios niveles".
   */
  async obtenerNivelesPorAreaMock(areaId: number) {
    console.log(`[Servicio] Buscando niveles para Área ID: ${areaId}`);
    
    await new Promise((resolve) => setTimeout(resolve, 400));

    switch (areaId) {
      case 1: return MOCK_NIVELES_MATEMATICAS; // Cursos
      case 2: return MOCK_NIVELES_FISICA;      // Niveles
      case 3: return MOCK_NIVELES_ROBOTICA;    // Categorías
      default: return []; // Retorna vacío si el ID no coincide (o es Química)
    }
  },

  /**
   * 3. OBTENER SUB-FASES
   * Simula: GET /subfases?areaId={areaId}&nivelId={nivelId}
   * * Recupera la lista de sub-fases y su estado actual.
   * En un backend real, filtraríamos por ambos IDs en la base de datos.
   * Aquí seleccionamos el array en memoria correspondiente al área.
   */
  async obtenerSubFases(areaId: number, nivelId: number): Promise<SubFase[]> {
    console.log(`[Servicio] Cargando sub-fases -> Área: ${areaId}, Nivel: ${nivelId}`);
    
    await new Promise((resolve) => setTimeout(resolve, 600));
    
    // Selección de la "tabla" correcta según el área
    let resultados: SubFase[] = [];

    if (areaId === 1) resultados = [...db_subfases_mate];
    else if (areaId === 2) resultados = [...db_subfases_fisica];
    else if (areaId === 3) resultados = [...db_subfases_robo];
    
    // Siempre devolvemos ordenado por secuencia (1, 2, 3...)
    return resultados.sort((a, b) => a.orden - b.orden);
  },

  /**
   * 4. CAMBIAR ESTADO DE UNA SUB-FASE
   * Simula: PATCH /subfases/{id}
   * * Aplica la lógica crítica de validación secuencial:
   * "No se puede iniciar la fase 2 si la fase 1 no ha finalizado".
   */
  async cambiarEstadoSubFase(id: number, nuevoEstado: EstadoSubFase): Promise<SubFase> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 1. Buscar la sub-fase en todas nuestras "tablas" en memoria
    // (En backend real sería un simple `UPDATE subfases WHERE id = ?`)
    let listaOrigen = null;
    let index = -1;

    const fuentesDeDatos = [db_subfases_mate, db_subfases_robo, db_subfases_fisica];

    for (const lista of fuentesDeDatos) {
        const idx = lista.findIndex((f) => f.id_subfase === id);
        if (idx !== -1) {
            listaOrigen = lista;
            index = idx;
            break;
        }
    }

    if (!listaOrigen || index === -1) {
        throw new Error('Error: Sub-fase no encontrada en el sistema.');
    }

    const faseActual = listaOrigen[index];

    // 2. VALIDACIÓN DE NEGOCIO (SECUECIALIDAD)
    // Si intentamos iniciar ('EN_EVALUACION'), verificamos la fase anterior.
    if (nuevoEstado === 'EN_EVALUACION') {
      // Buscamos si existe una fase con orden inmediatamente anterior (orden - 1)
      const faseAnterior = listaOrigen.find((f) => f.orden === faseActual.orden - 1);
      
      if (faseAnterior && faseAnterior.estado !== 'FINALIZADA') {
        // Regla de negocio violada:
        throw new Error(`Bloqueo de Secuencia: Debes finalizar "${faseAnterior.nombre}" antes de iniciar esta fase.`);
      }
    }

    // 3. ACTUALIZACIÓN DEL ESTADO
    const faseActualizada = { 
        ...faseActual, 
        estado: nuevoEstado,
        // Si finalizamos, forzamos el progreso al 100% visualmente
        progreso: nuevoEstado === 'FINALIZADA' ? 100 : faseActual.progreso 
    };
    
    // Guardamos en memoria
    listaOrigen[index] = faseActualizada;
    
    console.log(`[Servicio] Estado actualizado: ${faseActual.nombre} -> ${nuevoEstado}`);
    return faseActualizada;
  }
};