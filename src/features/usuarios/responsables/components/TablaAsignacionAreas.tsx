import React, { useMemo, useRef, useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { History, Lock } from 'lucide-react';
import type { Area } from '../types';
import type { ResponsableFormData } from '../utils/validations';

type TablaAsignacionAreasProps = {
  areas: Area[];
  onSeleccionarArea: (areaId: number, seleccionado: boolean) => void;
  onToggleSeleccionarTodas: (nuevasAreas: number[]) => void;
  isLoading?: boolean;
  isReadOnly?: boolean;
  preAsignadas: Set<number>;
  areasFromPastGestion?: Set<number>;
  gestionPasadaId?: number | null;
};

export function TablaAsignacionAreas({
  areas,
  onSeleccionarArea,
  onToggleSeleccionarTodas,
  isLoading = false,
  isReadOnly = false,
  preAsignadas = new Set(),
  areasFromPastGestion = new Set(),
  gestionPasadaId = null,
}: TablaAsignacionAreasProps) {
  const {
    formState: { errors, isSubmitting },
    control,
  } = useFormContext<ResponsableFormData>();
  const errorAreas = errors.areas;
  const isDisabled = isLoading || isSubmitting || isReadOnly;
  const watchedAreas = useWatch({ control, name: 'areas', defaultValue: [] });
  const watchedAreasSet = useMemo(() => new Set(watchedAreas || []), [watchedAreas]);
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);

  const areasHabilitadas = useMemo(() => {
    return areas.filter((area) => !preAsignadas.has(area.id_area));
  }, [areas, preAsignadas]);

  const idsHabilitados = useMemo(() => {
    return areasHabilitadas.map((a) => a.id_area);
  }, [areasHabilitadas]);

  const todasSeleccionadas = useMemo(() => {
    if (idsHabilitados.length === 0) return false;
    return idsHabilitados.every((id) => watchedAreasSet.has(id));
  }, [idsHabilitados, watchedAreasSet]);

  const algunasSeleccionadas = useMemo(() => {
    if (idsHabilitados.length === 0) return false;
    const seleccionadasHabilitadasCount = idsHabilitados.filter((id) =>
      watchedAreasSet.has(id)
    ).length;
    return seleccionadasHabilitadasCount > 0 && !todasSeleccionadas;
  }, [idsHabilitados, watchedAreasSet, todasSeleccionadas]);

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      selectAllCheckboxRef.current.indeterminate = algunasSeleccionadas;
    }
  }, [algunasSeleccionadas]);

  const handleToggleTodas = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isDisabled) return;
    const seleccionar = event.target.checked;

    let nuevasAreas: number[];
    const idsPreAsignados = Array.from(preAsignadas);

    if (seleccionar) {
      nuevasAreas = [...new Set([...idsPreAsignados, ...idsHabilitados])];
    } else {
      nuevasAreas = idsPreAsignados;
    }
    onToggleSeleccionarTodas(nuevasAreas);
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>, areaId: number) => {
    if (isDisabled || preAsignadas.has(areaId)) return;
    onSeleccionarArea(areaId, event.target.checked);
  };

  const totalSeleccionadas = useMemo(() => {
    return watchedAreasSet.size;
  }, [watchedAreasSet]);

  return (
    <fieldset className="space-y-4" disabled={isDisabled}>
      <legend className="text-lg font-semibold text-neutro-800 border-b border-neutro-200 pb-2 w-full flex justify-between items-center">
        <span>Asignación de Áreas <span className="text-acento-500">*</span></span>
        <span className="text-sm font-normal text-neutro-500">
          {totalSeleccionadas} / {areas.length} seleccionada(s)
        </span>
      </legend>

      {/* Checkbox "Seleccionar Todas" */}
      {areas.length > 0 && (
        <div className="flex items-center mb-2 pl-1">
          <input
            id="seleccionar-todas-areas"
            type="checkbox"
            className={`w-4 h-4 text-principal-600 bg-neutro-100 border-neutro-300 rounded focus:ring-principal-500 focus:ring-offset-0 focus:ring-1 ${
              isDisabled || idsHabilitados.length === 0 ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
            }`}
            checked={todasSeleccionadas}
            ref={selectAllCheckboxRef}
            onChange={handleToggleTodas}
            disabled={isDisabled || idsHabilitados.length === 0} 
            aria-label="Seleccionar o deseleccionar todas las áreas habilitadas"
          />
          <label
            htmlFor="seleccionar-todas-areas"
            className={`ml-2 text-sm font-medium ${
              isDisabled || idsHabilitados.length === 0 ? 'text-neutro-400 cursor-not-allowed' : 'text-neutro-700 cursor-pointer'
            }`}
          >
            Seleccionar Todas (Habilitadas)
          </label>
        </div>
      )}

      {/* Tabla de Áreas */}
      <div className={`mb-4 overflow-hidden rounded-lg shadow-md ${errorAreas && !isDisabled ? 'border border-acento-500' : ''}`}>
        <div className="overflow-y-auto max-h-[384px] scrollbar-thin scrollbar-thumb-neutro-300 scrollbar-track-neutro-100 hover:scrollbar-thumb-neutro-400">
          <table className="w-full">
            <thead className="sticky top-0 bg-principal-500 text-white z-10">
              <tr>
                <th scope="col" className="py-3 px-4 font-semibold text-center uppercase text-sm tracking-wider w-16">NRO</th>
                <th scope="col" className="py-3 px-4 font-semibold text-left uppercase text-sm tracking-wider">Área</th>
                <th scope="col" className="py-3 px-4 font-semibold text-center uppercase text-sm tracking-wider w-20">Asignar</th>
              </tr>
            </thead>
            <tbody className={isDisabled ? 'opacity-50' : ''}>
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="text-center py-10 text-gray-400 italic">
                      Cargando áreas...
                  </td>
                </tr>
              ) : !(areas && areas.length > 0) ? (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-neutro-500 italic">
                      No se pudieron cargar las áreas disponibles.
                  </td>
                </tr>
              ) : (
                areas.map((area: Area, index: number) => {
                  const isPreAsignada = preAsignadas.has(area.id_area);
                  const isSelected = watchedAreasSet.has(area.id_area);
                  
                  const rowDisabled = isDisabled || isPreAsignada;
                  const isChecked = isSelected;

                  const loadedFromPast = !!gestionPasadaId && areasFromPastGestion.has(area.id_area) && isSelected && !isPreAsignada;
                  const originalIndex = index;

                  return (
                    <tr
                      key={area.id_area}
                      className={`${originalIndex % 2 === 0 ? 'bg-gray-50' : 'bg-neutro-100'} ${
                          isChecked ? (isPreAsignada ? 'bg-neutro-200' : 'bg-principal-100') : ''
                      } ${
                          rowDisabled ? 'cursor-not-allowed' : 'hover:bg-principal-50 transition-colors'
                      } h-16`}
                    >
                      <td className="py-3 px-4 text-center font-medium text-neutro-900">{originalIndex + 1}</td>
                      <td className="py-3 px-4 text-left flex items-center gap-2">
                        {area.nombre}
                        
                        {/* Icono de gestión pasada */}
                        {loadedFromPast && (
                          <span className="cursor-help" title="Cargado de gestión pasada">
                            <History size={14} className="text-blue-600" />
                          </span>
                        )}

                        {/* Icono de bloqueado (Caso 3) */}
                        {isPreAsignada && (
                          <span className="cursor-not-allowed" title="Área ya asignada en esta gestión">
                            <Lock size={14} className="text-neutro-500" />
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <input
                          id={`area-${area.id_area}`}
                          type="checkbox"
                          className={`w-4 h-4 text-principal-600 bg-neutro-100 border-neutro-300 rounded focus:ring-principal-500 focus:ring-offset-0 focus:ring-1 ${
                            rowDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                          }`}
                          checked={isChecked}
                          onChange={(e) => handleCheckboxChange(e, area.id_area)}
                          disabled={rowDisabled}
                          aria-labelledby={`area-label-${area.id_area}`}
                        />
                        <label htmlFor={`area-${area.id_area}`} id={`area-label-${area.id_area}`} className="sr-only">
                          Asignar área {area.nombre} {isPreAsignada ? '(Asignada y bloqueada)' : ''}
                        </label>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      {errorAreas && !isDisabled && (
        <p role="alert" className="mt-1 text-xs text-acento-600">{errorAreas.message}</p>
      )}
    </fieldset>
  );
}