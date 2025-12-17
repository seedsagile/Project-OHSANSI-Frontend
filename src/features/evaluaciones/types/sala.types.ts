// src/features/evaluaciones/types/sala.types.ts

export type EstadoEvaluacion = 'Sin calificar' | 'Calificando' | 'Calificado' | 'Descalificado';

export interface CompetidorSala {
  id_evaluacion: number;
  id_competidor: number;
  ci: string;
  nombre_completo: string;
  grado_escolaridad: string;
  estado_evaluacion: EstadoEvaluacion;
  nota_actual: string | number; // Backend manda string "0.00" a veces
  es_bloqueado: boolean;
  bloqueado_por_mi: boolean;
}

// Para el selector de Exámenes
export interface ExamenCombo {
  id_examen: number;
  nombre_examen: string;
}

// Para el payload de guardar nota
export interface GuardarNotaPayload {
  user_id: number;
  nota: number;
  estado_participacion: 'presente' | 'ausente';
  motivo_cambio?: string; // Solo si se edita
}

// Respuesta limpia para los selectores de Area/Nivel del Evaluador
export interface AreaEvaluador {
  id_area: number;
  nombre_area: string;
  niveles: {
    id_area_nivel: number; // El ID para consultar exámenes
    id_area_nivel_real: number; 
    nombre_nivel: string;
  }[];
}