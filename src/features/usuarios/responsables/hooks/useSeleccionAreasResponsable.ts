// src/features/usuarios/responsables/hooks/useSeleccionAreasResponsable.ts
// CORRECCIÓN: Se elimina useMemo. Se importa useState, useEffect, useCallback
import { useState, useEffect, useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import isEqual from 'lodash.isequal';
import * as responsableService from '../services/responsablesService';
// CORRECCIÓN: Importar Area desde ../types
import type { Area } from '../types';
// CORRECCIÓN: Importar tipos de formulario desde ../utils/validations
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
  const [areasSeleccionadas, setAreasSeleccionadas] = useState<number[]>(initialAreas);
  const { setValue, getValues } = formMethods;
  const { data: areasDisponibles = [], isLoading: isLoadingAreasActuales } = areasDisponiblesQuery;

  const { data: areasPasadasIds = [], isLoading: isLoadingAreasPasadas } = useQuery<number[], Error>({
      queryKey: ['areasPasadas', gestionPasadaSeleccionadaAnio, ciVerificado],
      queryFn: () => responsableService.obtenerAreasPasadas(gestionPasadaSeleccionadaAnio!, ciVerificado!),
      enabled: !!ciVerificado && !!gestionPasadaSeleccionadaAnio && !isReadOnly,
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
  });

  // Efecto para sincronizar áreas cuando cambia la gestión pasada
  useEffect(() => {
      const currentFormAreas = getValues('areas') || [];
      if (gestionPasadaSeleccionadaAnio && !isLoadingAreasPasadas && areasPasadasIds.length > 0 && areasDisponibles.length > 0) {
          const idsAreasActualesSet = new Set(areasDisponibles.map((a) => a.id_area));
          const idsComunes = areasPasadasIds.filter((idPasada) => idsAreasActualesSet.has(idPasada));
          const currentFormAreasSet = new Set(currentFormAreas);
          const idsComunesSet = new Set(idsComunes);

          if (!isEqual(currentFormAreasSet, idsComunesSet)) {
              setAreasSeleccionadas(idsComunes);
              setValue('areas', idsComunes, { shouldValidate: true, shouldDirty: true });
          }
      } else if (!gestionPasadaSeleccionadaAnio && !isReadOnly && currentFormAreas.length > 0) {
          setAreasSeleccionadas([]);
          setValue('areas', [], { shouldValidate: true, shouldDirty: true });
      }
  }, [
      gestionPasadaSeleccionadaAnio,
      isLoadingAreasPasadas,
      areasPasadasIds,
      areasDisponibles,
      isReadOnly,
      setValue,
      getValues, // getValues es estable, usualmente seguro incluirlo aquí
  ]);

   // Inicializar áreas en modo READ_ONLY
   useEffect(() => {
    if (isReadOnly && initialAreas.length > 0) {
        const currentFormAreas = getValues('areas') || [];
        if(!isEqual(new Set(currentFormAreas), new Set(initialAreas))) {
            setAreasSeleccionadas(initialAreas);
            setValue('areas', initialAreas, { shouldValidate: true });
        }
    }
   // Incluir getValues como dependencia aquí es seguro porque solo se ejecuta al cambiar isReadOnly o initialAreas
   }, [isReadOnly, initialAreas, setValue, getValues]);


  const handleSeleccionarArea = useCallback((areaId: number, seleccionado: boolean) => {
    if (isReadOnly) return;
    setAreasSeleccionadas(prev => {
      const nuevasAreas = seleccionado ? [...prev, areaId] : prev.filter(id => id !== areaId);
      setValue('areas', nuevasAreas, { shouldValidate: true, shouldDirty: true });
      return nuevasAreas;
    });
  }, [isReadOnly, setValue]);

  const handleToggleSeleccionarTodas = useCallback((seleccionar: boolean) => {
    if (isReadOnly || isLoadingAreasActuales) return;
    const todosLosIds = areasDisponibles.map(area => area.id_area);
    const nuevasAreas = seleccionar ? todosLosIds : [];
    setAreasSeleccionadas(nuevasAreas);
    setValue('areas', nuevasAreas, { shouldValidate: true, shouldDirty: true });
  }, [areasDisponibles, isReadOnly, isLoadingAreasActuales, setValue]);

  const resetAreaSelection = useCallback((areasToResetTo: number[] = []) => {
      setAreasSeleccionadas(areasToResetTo);
  }, []);

  return {
    areasSeleccionadas,
    handleSeleccionarArea,
    handleToggleSeleccionarTodas,
    isLoadingAreas: isLoadingAreasActuales || isLoadingAreasPasadas,
    resetAreaSelection,
  };
}