import { useEffect, useCallback, useState, useRef } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import isEqual from 'lodash.isequal';
import * as evaluadorService from '../services/evaluadorService';
import type { Area } from '../types';
import type { EvaluadorFormData, EvaluadorFormInput } from '../utils/validations';

interface UseSeleccionAreasProps {
  formMethods: UseFormReturn<EvaluadorFormData, any, EvaluadorFormInput>;
  ciVerificado: string | null;
  gestionPasadaSeleccionadaAnio: string | null;
  initialAreas?: number[];
  isReadOnly: boolean;
  areasDisponiblesQuery: {
      data: Area[] | undefined;
      isLoading: boolean;
  };
}

export function useSeleccionAreasEvaluador({
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
      queryFn: () => evaluadorService.obtenerAreasPasadas(gestionPasadaSeleccionadaAnio!, ciVerificado!),
      enabled: !!ciVerificado && !!gestionPasadaSeleccionadaAnio && !isReadOnly,
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
  });

  const prevAreasPasadasIdsRef = useRef<number[] | undefined>(undefined);
  const prevAreasDisponiblesRef = useRef<Area[] | undefined>(undefined);

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
          setAreasLoadedFromPast(newAreasLoadedFromPast);
          const currentFormAreas = getValues('areas') || [];
          if (!isEqual(new Set(currentFormAreas), newAreasLoadedFromPast)) {
              setValue('areas', idsComunes, { shouldValidate: true, shouldDirty: true });
          }
      }

    } else if (!gestionPasadaSeleccionadaAnio && !isReadOnly) {
      if (areasLoadedFromPast.size > 0) {
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

  useEffect(() => {
    if (isReadOnly && initialAreas.length > 0) {
        const currentFormAreas = getValues('areas') || [];
        if(!isEqual(new Set(currentFormAreas), new Set(initialAreas))) {
            setValue('areas', initialAreas, { shouldValidate: true });
        }
    }
  }, [isReadOnly, initialAreas, setValue, getValues]);

  const handleSeleccionarArea = useCallback((areaId: number, seleccionado: boolean) => {
    if (isReadOnly) return;
    const currentAreas = watchedAreas || [];
    const nuevasAreas = seleccionado
        ? [...currentAreas, areaId]
        : currentAreas.filter(id => id !== areaId);
    setValue('areas', nuevasAreas, { shouldValidate: true, shouldDirty: true });
  }, [isReadOnly, setValue, watchedAreas]);

  const handleToggleSeleccionarTodas = useCallback((seleccionar: boolean) => {
    if (isReadOnly || isLoadingAreasActuales) return;
    const todosLosIds = seleccionar ? areasDisponibles.map(area => area.id_area) : [];
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