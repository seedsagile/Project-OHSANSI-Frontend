import { useEffect, useCallback } from 'react';
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

  console.log('[useSeleccionAreasResponsable] Hook inicializado con initialAreas:', initialAreas, 'isReadOnly:', isReadOnly);

  const watchedAreas = useWatch({ control, name: 'areas', defaultValue: initialAreas });

  useEffect(() => {
    console.log('[useSeleccionAreasResponsable] watchedAreas cambió:', watchedAreas);
  }, [watchedAreas]);

  const { data: areasPasadasIds = [], isLoading: isLoadingAreasPasadas } = useQuery<number[], Error>({
      queryKey: ['areasPasadas', gestionPasadaSeleccionadaAnio, ciVerificado],
      queryFn: () => responsableService.obtenerAreasPasadas(gestionPasadaSeleccionadaAnio!, ciVerificado!),
      enabled: !!ciVerificado && !!gestionPasadaSeleccionadaAnio && !isReadOnly,
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const currentFormAreas = getValues('areas') || [];
    console.log('[useSeleccionAreasResponsable] useEffect [gestionPasada] - Start. gestion:', gestionPasadaSeleccionadaAnio, 'currentFormAreas:', currentFormAreas, 'areasPasadasIds:', areasPasadasIds, 'isReadOnly:', isReadOnly);

    if (gestionPasadaSeleccionadaAnio && !isLoadingAreasPasadas && areasPasadasIds.length > 0 && areasDisponibles.length > 0) {
        const idsAreasActualesSet = new Set(areasDisponibles.map((a) => a.id_area));
        const idsComunes = areasPasadasIds.filter((idPasada) => idsAreasActualesSet.has(idPasada));
        if (!isEqual(new Set(currentFormAreas), new Set(idsComunes))) {
            console.log(`[useSeleccionAreasResponsable] useEffect [gestionPasada] - Setting RHF areas based on past gestion:`, idsComunes);
            setValue('areas', idsComunes, { shouldValidate: true, shouldDirty: true });
        } else {
            console.log(`[useSeleccionAreasResponsable] useEffect [gestionPasada] - No change needed.`);
        }
    } else if (!gestionPasadaSeleccionadaAnio && !isReadOnly) {
        // --- LÓGICA DE LIMPIEZA ELIMINADA ---
        // Ya no limpiamos automáticamente aquí solo porque la gestión sea null.
        // El reset general (handleCancelar) o un cambio explícito de gestión (handleGestionPasadaChange) deberían encargarse.
        console.log('[useSeleccionAreasResponsable] useEffect [gestionPasada] - Gestion is null, doing nothing.');
    }
    console.log('[useSeleccionAreasResponsable] useEffect [gestionPasada] - End.');
    // *** MODIFICADO: QUITAR watchedAreas y getValues de las dependencias ***
  }, [
      gestionPasadaSeleccionadaAnio,
      isLoadingAreasPasadas,
      areasPasadasIds,
      areasDisponibles,
      isReadOnly,
      setValue,
  ]);

  useEffect(() => {

    const currentFormAreas = getValues('areas') || [];
    console.log('[useSeleccionAreasResponsable] useEffect [readOnly] - Start. isReadOnly:', isReadOnly, 'initialAreas:', initialAreas, 'currentFormAreas:', currentFormAreas);
    if (isReadOnly && initialAreas.length > 0) {
        if(!isEqual(new Set(currentFormAreas), new Set(initialAreas))) {
            console.log(`[useSeleccionAreasResponsable] useEffect [readOnly] - Setting RHF areas for readOnly mode:`, initialAreas);
            setValue('areas', initialAreas, { shouldValidate: true });
        } else {
            console.log(`[useSeleccionAreasResponsable] useEffect [readOnly] - No change needed.`);
        }
    } else if (!isReadOnly) {
        console.log('[useSeleccionAreasResponsable] useEffect [readOnly] - Not in readOnly mode.');
    }
    console.log('[useSeleccionAreasResponsable] useEffect [readOnly] - End.');
     // *** MODIFICADO: QUITAR watchedAreas y getValues de las dependencias ***
  }, [isReadOnly, initialAreas, setValue]);

  const handleSeleccionarArea = useCallback((areaId: number, seleccionado: boolean) => {
    if (isReadOnly) {
        console.log('[useSeleccionAreasResponsable] handleSeleccionarArea - Ignored (readOnly)');
        return;
    }
    const currentAreas = watchedAreas || [];
    const nuevasAreas = seleccionado
        ? [...currentAreas, areaId]
        : currentAreas.filter(id => id !== areaId);
    console.log(`[useSeleccionAreasResponsable] handleSeleccionarArea - Area ID: ${areaId}, Seleccionado: ${seleccionado}, Calculando Nuevas Áreas:`, nuevasAreas);
    setValue('areas', nuevasAreas, { shouldValidate: true, shouldDirty: true });
    console.log('[useSeleccionAreasResponsable] handleSeleccionarArea - Called setValue');
  }, [isReadOnly, setValue, watchedAreas]);

  const handleToggleSeleccionarTodas = useCallback((seleccionar: boolean) => {
    if (isReadOnly || isLoadingAreasActuales) {
        console.log(`[useSeleccionAreasResponsable] handleToggleSeleccionarTodas - Ignored (readOnly: ${isReadOnly}, loading: ${isLoadingAreasActuales})`);
        return;
    }
    const todosLosIds = seleccionar ? areasDisponibles.map(area => area.id_area) : [];
    console.log(`[useSeleccionAreasResponsable] handleToggleSeleccionarTodas - Seleccionar: ${seleccionar}, Setting RHF areas:`, todosLosIds);
    setValue('areas', todosLosIds, { shouldValidate: true, shouldDirty: true });
  }, [areasDisponibles, isReadOnly, isLoadingAreasActuales, setValue]);

  // Reset Function (sin cambios)
  /*const resetAreaSelection = useCallback((areasToResetTo: number[] = []) => {
      console.log('[useSeleccionAreasResponsable] resetAreaSelection called');
      // Podrías explícitamente llamar a setValue aquí si el reset general no funciona
      // setValue('areas', areasToResetTo, { shouldValidate: false });
  },setValue ]);*/
  

  console.log('[useSeleccionAreasResponsable] Hook Render. Returning watchedAreas:', watchedAreas);

  return {
    areasSeleccionadas: watchedAreas || [],
    handleSeleccionarArea,
    handleToggleSeleccionarTodas,
    isLoadingAreas: isLoadingAreasActuales || isLoadingAreasPasadas,
    //resetAreaSelection,
  };
}