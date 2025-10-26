// src/features/usuarios/responsables/components/TablaAsignacionAreas.tsx
import React, { useMemo, useRef, useEffect } from 'react'; // Eliminado useState
import { useFormContext, useWatch } from 'react-hook-form';
import { History } from 'lucide-react'; // Eliminado Search
import type { Area } from '../types';
import type { ResponsableFormData } from '../utils/validations';

type TablaAsignacionAreasProps = {
  areas: Area[];
  onSeleccionarArea: (areaId: number, seleccionado: boolean) => void;
  onToggleSeleccionarTodas: (seleccionar: boolean) => void;
  isLoading?: boolean;
  isReadOnly?: boolean;
  areasFromPastGestion?: Set<number>;
  gestionPasadaId?: number | null;
};

export function TablaAsignacionAreas({
  areas,
  onSeleccionarArea,
  onToggleSeleccionarTodas,
  isLoading = false,
  isReadOnly = false,
  areasFromPastGestion = new Set(),
  gestionPasadaId = null,
}: TablaAsignacionAreasProps) {
  const { formState: { errors, isSubmitting }, control } = useFormContext<ResponsableFormData>();
  const errorAreas = errors.areas;
  const isDisabled = isLoading || isSubmitting || isReadOnly;
  const watchedAreas = useWatch({ control, name: 'areas', defaultValue: [] });

  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);
  // --- ELIMINADO: Estado del filtro ---
  // const [filtro, setFiltro] = useState('');

  const todasSeleccionadas = useMemo(() => {
    return (
      areas && areas.length > 0 &&
      Array.isArray(watchedAreas) &&
      areas.length === watchedAreas.length &&
      areas.every(area => watchedAreas.includes(area.id_area))
    );
  }, [areas, watchedAreas]);

  const algunasSeleccionadas = useMemo(() => {
    return (
        Array.isArray(watchedAreas) &&
        watchedAreas.length > 0 && !todasSeleccionadas
    );
  }, [watchedAreas, todasSeleccionadas]);

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      selectAllCheckboxRef.current.indeterminate = algunasSeleccionadas;
    }
  }, [algunasSeleccionadas]);

  const handleToggleTodas = (_event: React.ChangeEvent<HTMLInputElement>) => {
    if (isDisabled) return;
    onToggleSeleccionarTodas(_event.target.checked);
  };

  const handleCheckboxChange = (_event: React.ChangeEvent<HTMLInputElement>, areaId: number) => {
      if (isDisabled) return;
      onSeleccionarArea(areaId, _event.target.checked);
  };

  // --- ELIMINADO: Lógica de areasFiltradas ---
  // const areasFiltradas = useMemo(() => { ... });

  return (
    <fieldset className="space-y-4" disabled={isReadOnly}>
      <legend className="text-lg font-semibold text-neutro-800 border-b border-neutro-200 pb-2 w-full flex justify-between items-center">
        <span>Asignación de Áreas <span className="text-acento-500">*</span></span>
        <span className="text-sm font-normal text-neutro-500">
          {Array.isArray(watchedAreas) ? watchedAreas.length : 0} / {(areas || []).length} seleccionada(s)
        </span>
      </legend>

      {/* --- ELIMINADO: Input de Filtro --- */}
      {/* <div className="relative"> ... </div> */}

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
            <tbody className={isDisabled ? 'opacity-50 cursor-not-allowed' : ''}>
              {isLoading ? (
                 <tr>
                    <td colSpan={3} className="text-center py-10 text-gray-400 italic">
                        Cargando áreas...
                    </td>
                 </tr>
              // --- MODIFICADO: Usar 'areas' directamente y comprobar si está vacío ---
              ) : !(areas && areas.length > 0) ? (
                 <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-neutro-500 italic">
                       No hay áreas disponibles para asignar.
                    </td>
                 </tr>
              ) : (
                // --- MODIFICADO: Iterar sobre 'areas' directamente ---
                areas.map((area: Area, index: number) => { // Usar 'index' del map ahora
                  const isSelected = Array.isArray(watchedAreas) && watchedAreas.includes(area.id_area);
                  const rowDisabled = isDisabled;
                  const loadedFromPast = !!gestionPasadaId && areasFromPastGestion.has(area.id_area) && isSelected;
                  // Usamos el 'index' del map para el fondo alterno
                  const originalIndex = index;

                  return (
                    <tr
                      key={area.id_area}
                      className={`${originalIndex % 2 === 0 ? 'bg-gray-50' : 'bg-neutro-100'} ${
                           isSelected ? (loadedFromPast ? 'bg-blue-100' : 'bg-principal-100') : ''
                      } ${
                           rowDisabled ? '' : 'hover:bg-principal-50 transition-colors'
                      } h-16`}
                    >
                      <td className="py-3 px-4 text-center font-medium text-neutro-900">{originalIndex + 1}</td>
                      <td className="py-3 px-4 text-left flex items-center gap-2">
                        {area.nombre}
                        {loadedFromPast && !isReadOnly && (
                          <span className="cursor-help">
                            <History size={14} className="text-blue-600" />
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
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