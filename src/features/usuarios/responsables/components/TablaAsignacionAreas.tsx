import { useMemo, useRef, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import type { Area } from '../types';
import type { ResponsableFormData } from '../utils/validations';

type TablaAsignacionAreasProps = {
  areas: Area[];
  areasSeleccionadas: number[];
  onSeleccionarArea: (areaId: number, seleccionado: boolean) => void;
  onToggleSeleccionarTodas: (seleccionar: boolean) => void;
  isLoading?: boolean;
  isReadOnly?: boolean;
};

export function TablaAsignacionAreas({
  areas,
  areasSeleccionadas,
  onSeleccionarArea,
  onToggleSeleccionarTodas,
  isLoading = false,
  isReadOnly = false,
}: TablaAsignacionAreasProps) {
  const { formState: { errors, isSubmitting } } = useFormContext<ResponsableFormData>();
  const errorAreas = errors.areas;
  const isDisabled = isLoading || isSubmitting || isReadOnly;

  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);

  const todasSeleccionadas = useMemo(() => {
    return areas.length > 0 && areas.every(area => areasSeleccionadas.includes(area.id_area));
  }, [areas, areasSeleccionadas]);

  const algunasSeleccionadas = useMemo(() => {
    return areasSeleccionadas.length > 0 && !todasSeleccionadas;
  }, [areasSeleccionadas, todasSeleccionadas]);

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      selectAllCheckboxRef.current.indeterminate = algunasSeleccionadas;
    }
  }, [algunasSeleccionadas]);

  const handleRowClick = (areaId: number) => {
    if (isDisabled) return;
    const currentlySelected = areasSeleccionadas.includes(areaId);
    onSeleccionarArea(areaId, !currentlySelected);
  };

  const handleToggleTodas = () => {
    if (isDisabled) return;
    onToggleSeleccionarTodas(!todasSeleccionadas);
  };

  return (
    <fieldset className="space-y-4" disabled={isReadOnly}>
      <legend className="text-lg font-semibold text-neutro-800 border-b border-neutro-200 pb-2 w-full flex justify-between items-center">
        <span>Asignación de Áreas <span className="text-acento-500">*</span></span>
        <span className="text-sm font-normal text-neutro-500">
          {areasSeleccionadas.length} / {areas.length} seleccionada(s)
        </span>
      </legend>

      {areas.length > 0 && (
        <div className="flex items-center mb-2 pl-1">
          <input
            id="seleccionar-todas-areas"
            type="checkbox"
            className={`w-4 h-4 text-principal-600 bg-neutro-100 border-neutro-300 rounded focus:ring-principal-500 focus:ring-offset-0 focus:ring-1 ${isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
            checked={todasSeleccionadas}
            // ** CORRECCIÓN: Asignar la ref creada **
            ref={selectAllCheckboxRef}
            // ** Fin Corrección **
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
              {!isLoading && areas.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-neutro-500 italic">
                    No hay áreas disponibles para asignar.
                  </td>
                </tr>
              ) : (
                areas.map((area, index) => {
                  const isSelected = areasSeleccionadas.includes(area.id_area);
                  return (
                    <tr
                      key={area.id_area}
                      onClick={() => handleRowClick(area.id_area)}
                      className={`border-b border-neutro-200 transition-all duration-150 ${
                          isDisabled ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-principal-50 hover:shadow-sm'
                        } ${
                          isSelected ? 'bg-principal-100 hover:bg-principal-100/80' : 'bg-white'
                        }`
                      }
                      aria-disabled={isDisabled ? "true" : "false"}
                    >
                      <td className="px-4 py-2 text-center font-medium text-neutro-900">{index + 1}</td>
                      <td className="px-4 py-2">{area.nombre}</td>
                      <td className="px-4 py-2 text-center">
                        <input
                          id={`area-${area.id_area}`}
                          type="checkbox"
                          readOnly tabIndex={-1}
                          className={`w-4 h-4 text-principal-600 bg-neutro-100 border-neutro-300 rounded focus:ring-principal-500 focus:ring-offset-0 focus:ring-1 pointer-events-none`}
                          checked={isSelected}
                          disabled={isDisabled}
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