// src/features/evaluaciones/utils/concurrenciaLocal.ts

export class ConcurrenciaLocal {
  private static STORAGE_KEY = 'evaluaciones_en_proceso';
  private static TIMEOUT = 5 * 60 * 1000; // 5 minutos

  /**
   * Intenta bloquear un competidor
   */
  static bloquear(ci: string, idEvaluador: number): boolean {
    const bloqueados = this.obtenerBloqueados();
    const ahora = Date.now();

    // Verificar si ya está bloqueado
    if (bloqueados[ci]) {
      const bloqueo = bloqueados[ci];
      
      // Si pasó el timeout, liberar
      if (ahora - bloqueo.timestamp > this.TIMEOUT) {
        delete bloqueados[ci];
        this.guardarBloqueados(bloqueados);
      } else if (bloqueo.idEvaluador !== idEvaluador) {
        // Bloqueado por otro evaluador
        return false;
      }
    }

    // Bloquear
    bloqueados[ci] = {
      idEvaluador,
      timestamp: ahora,
    };
    this.guardarBloqueados(bloqueados);
    return true;
  }

  /**
   * Desbloquea un competidor
   */
  static desbloquear(ci: string): void {
    const bloqueados = this.obtenerBloqueados();
    delete bloqueados[ci];
    this.guardarBloqueados(bloqueados);
  }

  /**
   * Verifica si un competidor está bloqueado
   */
  static estaBloqueado(ci: string, idEvaluador: number): boolean {
    const bloqueados = this.obtenerBloqueados();
    const ahora = Date.now();

    if (!bloqueados[ci]) return false;

    const bloqueo = bloqueados[ci];

    // Si pasó el timeout, liberar y retornar false
    if (ahora - bloqueo.timestamp > this.TIMEOUT) {
      delete bloqueados[ci];
      this.guardarBloqueados(bloqueados);
      return false;
    }

    // Está bloqueado por otro evaluador
    return bloqueo.idEvaluador !== idEvaluador;
  }

  /**
   * Limpia bloqueos vencidos
   */
  static limpiarVencidos(): void {
    const bloqueados = this.obtenerBloqueados();
    const ahora = Date.now();
    let cambios = false;

    Object.keys(bloqueados).forEach((ci) => {
      if (ahora - bloqueados[ci].timestamp > this.TIMEOUT) {
        delete bloqueados[ci];
        cambios = true;
      }
    });

    if (cambios) {
      this.guardarBloqueados(bloqueados);
    }
  }

  private static obtenerBloqueados(): Record<string, { idEvaluador: number; timestamp: number }> {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  private static guardarBloqueados(bloqueados: Record<string, { idEvaluador: number; timestamp: number }>): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(bloqueados));
    } catch (error) {
      console.error('Error al guardar bloqueos:', error);
    }
  }
}