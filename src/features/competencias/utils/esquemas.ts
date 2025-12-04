// src/features/competencias/utils/esquemas.ts
import { z } from 'zod';

export const crearCompetenciaEsquema = z.object({
  id_area_nivel: z.number(),
  fecha_inicio: z.string(),
  fecha_fin: z.string(),
});

export type CrearCompetenciaFormData = z.infer<typeof crearCompetenciaEsquema>;