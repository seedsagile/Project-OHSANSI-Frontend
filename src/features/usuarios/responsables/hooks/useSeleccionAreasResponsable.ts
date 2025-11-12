import { useEffect, useCallback, useState, useRef } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';
import isEqual from 'lodash.isequal';
import type { Area, ApiGestionRoles } from '../types';
import type { ResponsableFormData, ResponsableFormInput } from '../utils/validations';

interface UseSeleccionAreasProps {
  formMethods: UseFormReturn<ResponsableFormData, any, ResponsableFormInput>;
  gestionPasadaSeleccionadaAnio: string | null;
  isReadOnly: boolean;
  areasDisponiblesQuery: {
    data: Area[] | undefined;
    isLoading: boolean;
  };
  preAsignadas: Set<number>;
  ocupadasSet: Set<number>; // <-- 1. ACEPTAR LA NUEVA PROP
  rolesPorGestion: ApiGestionRoles[];
}

export function useSeleccionAreasResponsable({
  formMethods,
  gestionPasadaSeleccionadaAnio,
  isReadOnly,
  areasDisponiblesQuery,
  preAsignadas = new Set(),
  ocupadasSet = new Set(), // <-- 2. USAR LA NUEVA PROP
  rolesPorGestion = [],
}: UseSeleccionAreasProps) {
  const { setValue, getValues, control } = formMethods;
  const { data: areasDisponibles = [], isLoading: isLoadingAreasActuales } =
    areasDisponiblesQuery;
  const [areasLoadedFromPast, setAreasLoadedFromPast] = useState<Set<number>>(
    new Set()
  );
  const watchedAreas = useWatch({ control, name: 'areas', defaultValue: [] });
  const prevGestionAnioRef = useRef<string | null>(undefined);
  const prevAreasDisponiblesRef = useRef<Area[] | undefined>(undefined);

  // Este useEffect es seguro. Solo se re-ejecuta si sus dependencias (props/datos de query) cambian.
  useEffect(() => {
    const gestionAnioChanged =
      prevGestionAnioRef.current !== gestionPasadaSeleccionadaAnio;
    const areasDisponiblesChanged = !isEqual(
      prevAreasDisponiblesRef.current,
      areasDisponibles
    );

    prevGestionAnioRef.current = gestionPasadaSeleccionadaAnio;
    prevAreasDisponiblesRef.current = areasDisponibles;

    const idsPreAsignados = Array.from(preAsignadas);

    if (
      gestionPasadaSeleccionadaAnio &&
      rolesPorGestion.length > 0 &&
      areasDisponibles.length > 0
    ) {
      const gestionPasadaData = rolesPorGestion.find(
        (g) => g.gestion === gestionPasadaSeleccionadaAnio
      );

      let areasPasadasIds: number[] = [];
      if (gestionPasadaData) {
        const rolResponsable = gestionPasadaData.roles.find(
          (r) => r.rol === 'Responsable Area'
        );
        if (rolResponsable && rolResponsable.detalles?.areas_responsable) {
          areasPasadasIds =
            rolResponsable.detalles.areas_responsable.map((a) => a.id_area);
        }
      }

      const idsAreasActualesSet = new Set(areasDisponibles.map((a) => a.id_area));
      
      // Lista para los iconos (History) - Muestra todas las históricas que existen hoy
      const idsComunesHistoricos = areasPasadasIds.filter((idPasada) =>
        idsAreasActualesSet.has(idPasada)
      );

      // --- INICIO DE LA CORRECCIÓN ---
      // Lista para AÑADIR AL FORMULARIO
      // Filtramos las que ya están asignadas a ESTE usuario (preAsignadas)
      // Y también filtramos las que están asignadas a OTRO usuario (ocupadasSet)
      const idsComunesCargables = idsComunesHistoricos.filter(
        (id) => !preAsignadas.has(id) && !ocupadasSet.has(id)
      );
      // --- FIN DE LA CORRECCIÓN ---

      const newAreasLoadedFromPast = new Set(idsComunesHistoricos); // El icono se muestra igual

      if (
        gestionAnioChanged ||
        areasDisponiblesChanged ||
        !isEqual(areasLoadedFromPast, newAreasLoadedFromPast)
      ) {
        setAreasLoadedFromPast(newAreasLoadedFromPast);

        // El valor del formulario SÓLO incluye las pre-asignadas + las cargables (válidas)
        const newValue = [...new Set([...idsPreAsignados, ...idsComunesCargables])];
        const currentFormAreas = getValues('areas') || [];

        if (!isEqual(new Set(currentFormAreas), new Set(newValue))) {
          setValue('areas', newValue, { shouldValidate: true, shouldDirty: true });
        }
      }
    } else if (!gestionPasadaSeleccionadaAnio && !isReadOnly) {
      if (areasLoadedFromPast.size > 0) {
        setAreasLoadedFromPast(new Set());
      }
      const currentFormAreas = getValues('areas') || [];
      if (!isEqual(new Set(currentFormAreas), preAsignadas)) {
        setValue('areas', idsPreAsignados, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    }
  }, [
    gestionPasadaSeleccionadaAnio,
    rolesPorGestion,
    areasDisponibles,
    isReadOnly,
    setValue,
    getValues,
    areasLoadedFromPast,
    preAsignadas,
    ocupadasSet, // <-- 3. AÑADIR DEPENDENCIA
  ]);

  const handleSeleccionarArea = useCallback(
    (areaId: number, seleccionado: boolean) => {
      // 4. AÑADIR LÓGICA DE BLOQUEO AQUÍ TAMBIÉN
      if (isReadOnly || preAsignadas.has(areaId) || ocupadasSet.has(areaId)) return;

      const currentAreas = watchedAreas || [];
      const nuevasAreas = seleccionado
        ? [...currentAreas, areaId]
        : currentAreas.filter((id) => id !== areaId);
      setValue('areas', nuevasAreas, { shouldValidate: true, shouldDirty: true });
    },
    [isReadOnly, setValue, watchedAreas, preAsignadas, ocupadasSet] // <-- 5. AÑADIR DEPENDENCIA
  );

  const handleToggleSeleccionarTodas = useCallback(
    (nuevasAreas: number[]) => {
      if (isReadOnly || isLoadingAreasActuales) return;
      setValue('areas', nuevasAreas, { shouldValidate: true, shouldDirty: true });
    },
    [isReadOnly, isLoadingAreasActuales, setValue]
  );

  const isLoadingAreas = isLoadingAreasActuales;

  return {
    areasSeleccionadas: watchedAreas || [],
    handleSeleccionarArea,
    handleToggleSeleccionarTodas,
    isLoadingAreas,
    areasLoadedFromPast,
  };
}