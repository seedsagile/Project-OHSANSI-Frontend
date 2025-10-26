// src/features/usuarios/responsables/hooks/useSeleccionAreasResponsable.ts
import { useEffect, useCallback, useState, useRef } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import isEqual from 'lodash.isequal';
import * as responsableService from '../services/responsablesService';
import type { Area } from '../types';
import type { ResponsableFormData, ResponsableFormInput } from '../utils/validations';

interface UseSeleccionAreasProps {
  formMethods: UseFormReturn<ResponsableFormData, any, ResponsableFormInput>;
  ciVerificado: string | null;
  gestionPasadaSeleccionadaAnio: string | null;
  initialAreas?: number[];
  isReadOnly: boolean;
  areasDisponiblesQuery: {
      data: Area[] | undefined;
      isLoading: boolean;
  };
}

export function useSeleccionAreasResponsable({
  formMethods,
  ciVerificado,
  gestionPasadaSeleccionadaAnio,
  initialAreas = [],
  isReadOnly,
  areasDisponiblesQuery,
}: UseSeleccionAreasProps) {
  const { setValue, getValues, control } = formMethods;
  const { data: areasDisponibles = [], isLoading: isLoadingAreasActuales } = areasDisponiblesQuery;
  const [areasLoadedFromPast, setAreasLoadedFromPast] = useState<Set<number>>(new Set());
  const watchedAreas = useWatch({ control, name: 'areas', defaultValue: initialAreas });

  const { data: areasPasadasIds = [], isLoading: isLoadingAreasPasadas, isFetching: isFetchingAreasPasadas } = useQuery<number[], Error>({
      queryKey: ['areasPasadas', gestionPasadaSeleccionadaAnio, ciVerificado],
      queryFn: () => responsableService.obtenerAreasPasadas(gestionPasadaSeleccionadaAnio!, ciVerificado!),
      enabled: !!ciVerificado && !!gestionPasadaSeleccionadaAnio && !isReadOnly,
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
  });

  const prevAreasPasadasIdsRef = useRef<number[] | undefined>(undefined);
  const prevAreasDisponiblesRef = useRef<Area[] | undefined>(undefined);

  // --- useEffect para sincronizar con la selección de GESTIÓN PASADA ---
  useEffect(() => {
    const areasPasadasChanged = !isEqual(prevAreasPasadasIdsRef.current, areasPasadasIds);
    const areasDisponiblesChanged = !isEqual(prevAreasDisponiblesRef.current, areasDisponibles);

    prevAreasPasadasIdsRef.current = areasPasadasIds;
    prevAreasDisponiblesRef.current = areasDisponibles;

    if (gestionPasadaSeleccionadaAnio && !isLoadingAreasPasadas && !isFetchingAreasPasadas && areasPasadasIds.length > 0 && areasDisponibles.length > 0) {
      const idsAreasActualesSet = new Set(areasDisponibles.map((a) => a.id_area));
      const idsComunes = areasPasadasIds.filter((idPasada) => idsAreasActualesSet.has(idPasada));
      const newAreasLoadedFromPast = new Set(idsComunes);

      if (areasPasadasChanged || areasDisponiblesChanged || !isEqual(areasLoadedFromPast, newAreasLoadedFromPast)) {
          console.log("[DEBUG useEffect Gestión Pasada] Datos cambiaron o áreas cargadas son diferentes. Actualizando estado local.");
          setAreasLoadedFromPast(newAreasLoadedFromPast);

          const currentFormAreas = getValues('areas') || [];
          if (!isEqual(new Set(currentFormAreas), newAreasLoadedFromPast)) {
              console.log("[DEBUG useEffect Gestión Pasada] Actualizando áreas en RHF:", idsComunes);
              setValue('areas', idsComunes, { shouldValidate: true, shouldDirty: true });
          } else {
              console.log("[DEBUG useEffect Gestión Pasada] Áreas en RHF ya coinciden, no se llama a setValue.");
          }
      } else {
          console.log("[DEBUG useEffect Gestión Pasada] Datos de query no cambiaron significativamente y áreas cargadas son iguales, omitiendo actualización.");
      }

    } else if (!gestionPasadaSeleccionadaAnio && !isReadOnly) {
      if (areasLoadedFromPast.size > 0) {
        console.log("[DEBUG useEffect Gestión Pasada] Limpiando áreas de gestión pasada del estado local.");
        setAreasLoadedFromPast(new Set());
      }
    }
  }, [
    gestionPasadaSeleccionadaAnio,
    isLoadingAreasPasadas,
    isFetchingAreasPasadas,
    areasPasadasIds,
    areasDisponibles,
    isReadOnly,
    setValue,
    getValues,
    areasLoadedFromPast
  ]);


  // --- useEffect para sincronizar con el modo READ-ONLY ---
  useEffect(() => {
    if (isReadOnly && initialAreas.length > 0) {
        const currentFormAreas = getValues('areas') || [];
        if(!isEqual(new Set(currentFormAreas), new Set(initialAreas))) {
            console.log("[DEBUG useEffect ReadOnly] Estableciendo áreas iniciales en RHF:", initialAreas);
            setValue('areas', initialAreas, { shouldValidate: true });
        }
    }
  }, [isReadOnly, initialAreas, setValue, getValues]);


  // --- Callback para seleccionar/deseleccionar UN área ---
  const handleSeleccionarArea = useCallback((areaId: number, seleccionado: boolean) => {
    if (isReadOnly) return;
    const currentAreas = watchedAreas || [];
    const nuevasAreas = seleccionado
        ? [...currentAreas, areaId]
        : currentAreas.filter(id => id !== areaId);
    console.log(`[DEBUG handleSeleccionarArea] Area ID: ${areaId}, Seleccionado: ${seleccionado}, Nuevas Áreas:`, nuevasAreas);
    setValue('areas', nuevasAreas, { shouldValidate: true, shouldDirty: true });
  }, [isReadOnly, setValue, watchedAreas]);


  // --- Callback para seleccionar/deseleccionar TODAS las áreas ---
  const handleToggleSeleccionarTodas = useCallback((seleccionar: boolean) => {
    if (isReadOnly || isLoadingAreasActuales) return;
    const todosLosIds = seleccionar ? areasDisponibles.map(area => area.id_area) : [];
    console.log(`[DEBUG handleToggleSeleccionarTodas] Seleccionar Todas: ${seleccionar}, IDs:`, todosLosIds);
    setValue('areas', todosLosIds, { shouldValidate: true, shouldDirty: true });
  }, [areasDisponibles, isReadOnly, isLoadingAreasActuales, setValue]);


  return {
    areasSeleccionadas: watchedAreas || [],
    handleSeleccionarArea,
    handleToggleSeleccionarTodas,
    isLoadingAreas: isLoadingAreasActuales || isLoadingAreasPasadas || isFetchingAreasPasadas,
    areasLoadedFromPast,
  };
}