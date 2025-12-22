export const DEPARTAMENTOS_VALIDOS = [
  'COCHABAMBA',
  'LA PAZ',
  'ORURO',
  'POTOSI',
  'TARIJA',
  'SANTA CRUZ',
  'BENI',
  'PANDO',
  'CHUQUISACA',
  'SUCRE',
  'EL ALTO',
] as const;

export const DEFAULT_FECHA_NAC = '2000-01-01';
export const DEFAULT_GRADO_ESCOLAR = 'No especificado';

import { useSistemaStore } from '@/features/sistema/stores/useSistemaStore';

const state = useSistemaStore.getState();
const gestionData = state.getGestionActual();
export const GESTION_ACTUAL_ANIO = state.getAnioGestion() || '';
  
export const ID_OLIMPIADA_ACTUAL = gestionData 
  ? Number((gestionData as unknown as { id: number }).id) 
  : 0;