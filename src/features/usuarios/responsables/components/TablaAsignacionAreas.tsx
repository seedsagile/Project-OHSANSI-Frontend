import React, { useMemo, useRef, useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import type { Area } from '../types';
import type { ResponsableFormData } from '../utils/validations';

type TablaAsignacionAreasProps = {
  areas: Area[];
  onSeleccionarArea: (areaId: number, seleccionado: boolean) => void;
  onToggleSeleccionarTodas: (seleccionar: boolean) => void;
  isLoading?: boolean;
  isReadOnly?: boolean;
};

export function TablaAsignacionAreas({
  areas,
  onSeleccionarArea,
  onToggleSeleccionarTodas,
  isLoading = false,
  isReadOnly = false,
}: TablaAsignacionAreasProps) {
  const { formState: { errors, isSubmitting }, control } = useFormContext<ResponsableFormData>();
  const errorAreas = errors.areas;
  const isDisabled = isLoading || isSubmitting || isReadOnly; 
  const watchedAreas = useWatch({ control, name: 'areas', defaultValue: [] });

  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);

  const todasSeleccionadas = useMemo(() => {
    const result = (
      areas && areas.length > 0 &&
      Array.isArray(watchedAreas) &&
      areas.length === watchedAreas.length &&
      areas.every(area => watchedAreas.includes(area.id_area))
    );
    return result;
  }, [areas, watchedAreas]);

  const algunasSeleccionadas = useMemo(() => {
    const result = (
        Array.isArray(watchedAreas) &&
        watchedAreas.length > 0 && !todasSeleccionadas
    );
    return result;
  }, [watchedAreas, todasSeleccionadas]);

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      selectAllCheckboxRef.current.indeterminate = algunasSeleccionadas;
    }
  }, [algunasSeleccionadas]);


  const handleToggleTodas = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isDisabled) return;
    onToggleSeleccionarTodas(event.target.checked);
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>, areaId: number) => {
      if (isDisabled) return;
      onSeleccionarArea(areaId, event.target.checked);
  };

  return (
    <fieldset className="space-y-4" disabled={isReadOnly}> 
      <legend className="text-lg font-semibold text-neutro-800 border-b border-neutro-200 pb-2 w-full flex justify-between items-center">
        <span>Asignación de Áreas <span className="text-acento-500">*</span></span>
        <span className="text-sm font-normal text-neutro-500">
          {Array.isArray(watchedAreas) ? watchedAreas.length : 0} / {(areas || []).length} seleccionada(s)
        </span>
      </legend>

      {areas && areas.length > 0 && !isReadOnly && ( 
        <div className="flex items-center mb-2 pl-1">
          <input
            id="seleccionar-todas-areas"
            type="checkbox"
            className={`w-4 h-4 text-principal-600 bg-neutro-100 border-neutro-300 rounded focus:ring-principal-500 focus:ring-offset-0 focus:ring-1 ${isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
            checked={todasSeleccionadas && !algunasSeleccionadas}
            ref={selectAllCheckboxRef}
            onChange={handleToggleTodas}
            disabled={isDisabled}
            aria-label="Seleccionar o deseleccionar todas las áreas"
          />
          <label
            htmlFor="seleccionar-todas-areas"
            className={`ml-2 text-sm font-medium ${isDisabled ? 'text-neutro-400 cursor-not-allowed' : 'text-neutro-700 cursor-pointer'}`}
          >
            Seleccionar Todas
          </label>
        </div>
      )}

      {/* Contenedor de la tabla */}
      <div className={`rounded-lg border overflow-hidden ${errorAreas && !isDisabled ? 'border-acento-500' : 'border-neutro-300'}`}>
        <div className="max-h-60 overflow-y-auto relative scrollbar-thin scrollbar-thumb-neutro-300 scrollbar-track-neutro-100 hover:scrollbar-thumb-neutro-400">
          {isLoading && (
            <div className="absolute inset-0 bg-white/50 flex justify-center items-center z-10">
              <span className="text-neutro-500 italic">Cargando áreas...</span>
            </div>
          )}
          <table className="w-full text-sm text-left text-neutro-700">
            <thead className="text-xs text-blanco uppercase bg-principal-500 sticky top-0 z-10">
              <tr>
                <th scope="col" className="px-4 py-2 w-16 text-center">NRO</th>
                <th scope="col" className="px-4 py-2">Área</th>
                <th scope="col" className="px-4 py-2 w-20 text-center">Asignar</th>
              </tr>
            </thead>
            <tbody className={isDisabled ? 'opacity-50 cursor-not-allowed' : ''}> 
              {!isLoading && (!areas || areas.length === 0) ? (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-neutro-500 italic">
                    No hay áreas disponibles para asignar.
                  </td>
                </tr>
              ) : (
                (areas || []).map((area, index) => {
                  const isSelected = Array.isArray(watchedAreas) && watchedAreas.includes(area.id_area);
                  
                  const rowDisabled = isDisabled; 
                  
                  return (
                    <tr
                      key={area.id_area}
                      className={`border-b border-neutro-200 transition-colors ${
                          isSelected ? 'bg-principal-100' : 'bg-white'
                      } ${
                          rowDisabled ? '' : 'hover:bg-principal-50'
                      }`}
                      aria-disabled={rowDisabled ? "true" : "false"}
                    >
                      <td className="px-4 py-2 text-center font-medium text-neutro-900">{index + 1}</td>
                      <td className="px-4 py-2">{area.nombre}</td>
                      <td className="px-4 py-2 text-center">
                        <input
                          id={`area-${area.id_area}`}
                          type="checkbox"
                          className={`w-4 h-4 text-principal-600 bg-neutro-100 border-neutro-300 rounded focus:ring-principal-500 focus:ring-offset-0 focus:ring-1 ${rowDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                          checked={isSelected} 
                          onChange={(e) => handleCheckboxChange(e, area.id_area)}
                          disabled={rowDisabled}
                          aria-labelledby={`area-label-${area.id_area}`}
                        />
                        <label htmlFor={`area-${area.id_area}`} id={`area-label-${area.id_area}`} className="sr-only">
                          Asignar área {area.nombre}
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