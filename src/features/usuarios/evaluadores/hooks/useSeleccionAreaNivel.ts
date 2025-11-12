import { useEffect, useCallback, useState, useMemo } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import isEqual from 'lodash.isequal';
import type {
  AreaParaAsignar,
  ApiGestionRoles,
  ApiRolDetalle,
  ApiAsignacionDetalle, // Importar este tipo es crucial
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

  // --- INICIO DE LA MODIFICACIÓN ---
  // Este useEffect ahora mapea por nombre en lugar de por ID
  useEffect(() => {
    const { data: areasDisponibles } = areasDisponiblesQuery;

    // Si aún no cargan las áreas de la gestión actual, no podemos hacer el mapeo.
    if (!areasDisponibles) {
      return;
    }

    // 1. Aplanar los datos actuales (Gestión 2025) para búsqueda por nombre.
    // Creamos un Map donde la clave es "NombreArea|NombreNivel" y el valor es el ID de 2025.
    const mapaNivelesActuales: Map<string, number> = new Map();
    (areasDisponibles || []).forEach((area) => {
      area.niveles.forEach((nivel) => {
        // Clave normalizada para evitar errores de espacios
        const clave = `${area.area.trim()}|${nivel.nombre.trim()}`;
        mapaNivelesActuales.set(clave, nivel.id_area_nivel);
      });
    });

    const idsPreAsignados = Array.from(preAsignadas);

    // 2. Si el usuario seleccionó una gestión pasada (ej. "2023")
    if (gestionPasadaSeleccionadaAnio && rolesPorGestion.length > 0) {
      // 3. Obtener las asignaciones pasadas (2023)
      const gestionData = rolesPorGestion.find(
        (g) => g.gestion === gestionPasadaSeleccionadaAnio
      );

      const rolEvaluador = gestionData?.roles.find((r) => r.rol === 'Evaluador');
      const detalles = rolEvaluador?.detalles as ApiRolDetalle | undefined;
      const asignacionesPasadas: ApiAsignacionDetalle[] =
        detalles?.asignaciones_evaluador ?? [];

      const idsCargables: number[] = [];
      const idsHistoricosParaIcono: number[] = [];

      // 4. Iterar sobre las asignaciones pasadas (2023)
      asignacionesPasadas.forEach((asignacionPasada) => {
        // 5. Crear la misma clave "NombreArea|NombreNivel" (ej. "Física|1ro de Secundaria")
        const clavePasada = `${asignacionPasada.nombre_area.trim()}|${asignacionPasada.nombre_nivel.trim()}`;

        // 6. Buscar el ID actual (2025) usando la clave de nombres
        const idActualCorrespondiente = mapaNivelesActuales.get(clavePasada);

        // 7. Si se encontró un ID correspondiente en 2025
        if (idActualCorrespondiente) {
          // Guardar este ID (de 2025) para mostrar el icono <History>
          idsHistoricosParaIcono.push(idActualCorrespondiente);

          // 8. Solo añadir si no está ya pre-asignado en 2025
          if (!preAsignadas.has(idActualCorrespondiente)) {
            idsCargables.push(idActualCorrespondiente);
          }
        }
      });

      // 9. Actualizar el estado para los iconos <History>
      setAreasFromPastGestion(new Set(idsHistoricosParaIcono));

      // 10. Establecer el valor del formulario
      const newValue = [...new Set([...idsPreAsignados, ...idsCargables])];
      const currentFormValue = new Set(getValues('area_nivel_ids'));

      if (!isEqual(currentFormValue, new Set(newValue))) {
        setValue('area_nivel_ids', newValue, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    } else {
      // 11. Lógica de reseteo (cuando se deselecciona la gestión pasada)
      setAreasFromPastGestion(new Set());
      const currentFormValue = new Set(getValues('area_nivel_ids'));

      if (!isEqual(currentFormValue, preAsignadas)) {
        setValue('area_nivel_ids', idsPreAsignados, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    gestionPasadaSeleccionadaAnio,
    rolesPorGestion,
    areasDisponiblesQuery.data, // <- Depender solo de .data previene re-renders innecesarios
    preAsignadas,
    setValue,
    getValues,
  ]);
  // --- FIN DE LA MODIFICACIÓN ---

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