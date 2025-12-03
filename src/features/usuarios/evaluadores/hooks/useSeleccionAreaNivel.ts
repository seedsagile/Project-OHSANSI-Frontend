import { useEffect, useCallback, useState, useMemo } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import isEqual from 'lodash.isequal';
import type {
  AreaParaAsignar,
  ApiGestionRoles,
  ApiRolDetalle,
  ApiAsignacionDetalle,
} from '../types';
import type { EvaluadorFormData, EvaluadorFormInput } from '../utils/validations';

interface UseSeleccionAreaNivelProps {
  formMethods: UseFormReturn<EvaluadorFormData, any, EvaluadorFormInput>;
  areasDisponiblesQuery: ReturnType<typeof useQuery<AreaParaAsignar[], Error>>;
  gestionPasadaSeleccionadaAnio: string | null;
  rolesPorGestion: ApiGestionRoles[];
  preAsignadas: Set<number>;
}

export function useSeleccionAreaNivel({
  formMethods,
  areasDisponiblesQuery,
  gestionPasadaSeleccionadaAnio,
  rolesPorGestion,
  preAsignadas,
}: UseSeleccionAreaNivelProps) {
  const { setValue, getValues, control } = formMethods;

  const [areasExpandidasSet, setAreasExpandidasSet] = useState<Set<number>>(new Set());
  const [areasFromPastGestion, setAreasFromPastGestion] = useState<Set<number>>(
    new Set()
  );

  const watchedAreaNivelIds = useWatch({
    control,
    name: 'area_nivel_ids',
    defaultValue: [],
  });

  const nivelesSeleccionadosSet = useMemo(() => {
    return new Set(watchedAreaNivelIds || []);
  }, [watchedAreaNivelIds]);
  useEffect(() => {
    const { data: areasDisponibles } = areasDisponiblesQuery;
    if (!areasDisponibles) {
      return;
    }

    const mapaNivelesActuales: Map<string, number> = new Map();
    (areasDisponibles || []).forEach((area) => {
      area.niveles.forEach((nivel) => {
        const clave = `${area.area.trim()}|${nivel.nombre.trim()}`;
        mapaNivelesActuales.set(clave, nivel.id_area_nivel);
      });
    });

    const idsPreAsignados = Array.from(preAsignadas);
    if (gestionPasadaSeleccionadaAnio && rolesPorGestion.length > 0) {
      const gestionData = rolesPorGestion.find(
        (g) => g.gestion === gestionPasadaSeleccionadaAnio
      );

      const rolEvaluador = gestionData?.roles.find((r) => r.rol === 'Evaluador');
      const detalles = rolEvaluador?.detalles as ApiRolDetalle | undefined;
      const asignacionesPasadas: ApiAsignacionDetalle[] =
        detalles?.asignaciones_evaluador ?? [];

      const idsCargables: number[] = [];
      const idsHistoricosParaIcono: number[] = [];
      asignacionesPasadas.forEach((asignacionPasada) => {
        const clavePasada = `${asignacionPasada.nombre_area.trim()}|${asignacionPasada.nombre_nivel.trim()}`;
        const idActualCorrespondiente = mapaNivelesActuales.get(clavePasada);
        if (idActualCorrespondiente) {
          idsHistoricosParaIcono.push(idActualCorrespondiente);

          if (!preAsignadas.has(idActualCorrespondiente)) {
            idsCargables.push(idActualCorrespondiente);
          }
        }
      });

      setAreasFromPastGestion(new Set(idsHistoricosParaIcono));

      const newValue = [...new Set([...idsPreAsignados, ...idsCargables])];
      const currentFormValue = new Set(getValues('area_nivel_ids'));

      if (!isEqual(currentFormValue, new Set(newValue))) {
        setValue('area_nivel_ids', newValue, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    } else {
      setAreasFromPastGestion(new Set());
      const currentFormValue = new Set(getValues('area_nivel_ids'));

      if (!isEqual(currentFormValue, preAsignadas)) {
        setValue('area_nivel_ids', idsPreAsignados, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    }
  }, [
    gestionPasadaSeleccionadaAnio,
    rolesPorGestion,
    areasDisponiblesQuery.data,
    preAsignadas,
    setValue,
    getValues,
  ]);

  const handleToggleNivel = useCallback(
    (id_area_nivel: number) => {
      if (preAsignadas.has(id_area_nivel)) {
        return;
      }

      const newSet = new Set(nivelesSeleccionadosSet);

      if (newSet.has(id_area_nivel)) {
        newSet.delete(id_area_nivel);
      } else {
        newSet.add(id_area_nivel);
      }

      setValue('area_nivel_ids', Array.from(newSet), {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [nivelesSeleccionadosSet, preAsignadas, setValue]
  );

  const handleToggleArea = useCallback(
    (id_area: number) => {
      const newSet = new Set(areasExpandidasSet);

      if (newSet.has(id_area)) {
        newSet.delete(id_area);
      } else {
        newSet.add(id_area);
      }

      setAreasExpandidasSet(newSet);
    },
    [areasExpandidasSet]
  );

  const handleToggleSeleccionarTodas = useCallback(
    (nuevosIds: number[]) => {
      setValue('area_nivel_ids', nuevosIds, {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [setValue]
  );

  return {
    areasExpandidasSet,
    nivelesSeleccionadosSet,
    areasFromPastGestion,
    isLoading: areasDisponiblesQuery.isLoading,
    handleToggleNivel,
    handleToggleArea,
    handleToggleSeleccionarTodas,
  };
}