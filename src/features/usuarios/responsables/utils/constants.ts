import { useSistemaStore } from '@/features/sistema/stores/useSistemaStore';

const state = useSistemaStore.getState();
const gestionData = state.getGestionActual();
export const GESTION_ACTUAL_ANIO = state.getAnioGestion() || '';
  
export const ID_OLIMPIADA_ACTUAL = gestionData 
  ? Number((gestionData as unknown as { id: number }).id) 
  : 0;