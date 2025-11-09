import React, { useMemo, useRef, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { History, Lock, ChevronDown } from 'lucide-react';
import type { AreaParaAsignar } from '../types';
import type { EvaluadorFormData } from '../utils/validations';

type TablaAsignacionAreaNivelProps = {
  areas: AreaParaAsignar[];
  isLoading?: boolean;
  isReadOnly?: boolean;
  preAsignadas: Set<number>;
  areasFromPastGestion: Set<number>;
  nivelesSeleccionados: Set<number>;
  areasExpandidas: Set<number>;
  onToggleNivel: (id_area_nivel: number) => void;
  onToggleArea: (id_area: number) => void;
  onToggleSeleccionarTodas: (nuevosIds: number[]) => void;
};

const AreaColumn: React.FC<{
  area: AreaParaAsignar;
  isExpandida: boolean;
  isDisabled: boolean;
  preAsignadas: Set<number>;
  areasFromPastGestion: Set<number>;
  nivelesSeleccionados: Set<number>;
  onToggleNivel: (id_area_nivel: number) => void;
  onToggleArea: (id_area: number) => void;
}> = ({
  area,
  isExpandida,
  isDisabled,
  preAsignadas,
  areasFromPastGestion,
  nivelesSeleccionados,
  onToggleNivel,
  onToggleArea,
}) => {
  return (
    <div className="flex-shrink-0 w-64 min-w-56 bg-white rounded-lg border border-neutro-200 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => onToggleArea(area.id_area)}
        disabled={isDisabled}
        className={`w-full flex justify-between items-center text-left py-3 px-4 rounded-t-lg transition-colors ${
          isExpandida
            ? 'bg-principal-500 text-blanco'
            : 'bg-principal-100 text-principal-700 hover:bg-principal-200'
        } disabled:opacity-70`}
        aria-expanded={isExpandida}
        aria-controls={`area-panel-${area.id_area}`}
      >
        <span className="font-semibold text-sm">{area.area}</span>
        <ChevronDown
          size={18}
          className={`transition-transform duration-200 ${
            isExpandida ? 'rotate-180 text-blanco' : 'text-principal-700'
          }`}
        />
      </button>

      {isExpandida && (
        <div
          id={`area-panel-${area.id_area}`}
          role="region"
          className="p-3 max-h-44 overflow-y-auto scrollbar-thin scrollbar-thumb-neutro-300 scrollbar-track-neutro-100"
        >
          {area.niveles.length === 0 ? (
            <div className="text-neutro-500 text-sm italic">No hay niveles.</div>
          ) : (
            <div className="space-y-2">
              {area.niveles.map((nivel) => {
                const id = nivel.id_area_nivel;
                const isPreAsignado = preAsignadas.has(id);
                const isSelected = nivelesSeleccionados.has(id);
                const rowDisabled = isDisabled || isPreAsignado;
                const isFromPast = areasFromPastGestion.has(id);

                return (
                  <div
                    key={id}
                    className="flex justify-between items-center py-1"
                  >
                    <label
                      htmlFor={`nivel-${id}`}
                      id={`nivel-label-${id}`}
                      className={`text-sm ${
                        rowDisabled
                          ? 'text-neutro-400 cursor-not-allowed'
                          : 'text-neutro-700 cursor-pointer'
                      } flex items-center gap-1`}
                    >
                      {nivel.nombre}
                      {isFromPast && !isPreAsignado && (
                        <span
                          className="cursor-help"
                          title="Cargado de gestión pasada"
                        >
                          <History size={12} className="text-blue-600" />
                        </span>
                      )}
                      {isPreAsignado && (
                        <span
                          className="cursor-not-allowed"
                          title="Ya asignado en esta gestión"
                        >
                          <Lock size={12} className="text-neutro-500" />
                        </span>
                      )}
                    </label>
                    <input
                      id={`nivel-${id}`}
                      type="checkbox"
                      className={`w-4 h-4 text-principal-600 bg-neutro-100 border-neutro-300 rounded focus:ring-principal-500 focus:ring-offset-0 focus:ring-1 ${
                        rowDisabled
                          ? 'cursor-not-allowed opacity-60'
                          : 'cursor-pointer'
                      }`}
                      checked={isSelected}
                      onChange={() => onToggleNivel(id)}
                      disabled={rowDisabled}
                      aria-labelledby={`nivel-label-${id}`}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export function TablaAsignacionAreaNivel({
  areas,
  isLoading = false,
  isReadOnly = false,
  preAsignadas,
  areasFromPastGestion,
  nivelesSeleccionados,
  areasExpandidas,
  onToggleNivel,
  onToggleArea,
  onToggleSeleccionarTodas,
}: TablaAsignacionAreaNivelProps) {
  const {
    formState: { errors, isSubmitting },
  } = useFormContext<EvaluadorFormData>();

  const errorAsignacion = errors.area_nivel_ids;
  const isDisabled = isLoading || isSubmitting || isReadOnly;
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);

  const idsDisponibles = useMemo(() => {
    return areas
      .flatMap((area) => area.niveles)
      .map((nivel) => nivel.id_area_nivel)
      .filter((id) => !preAsignadas.has(id));
  }, [areas, preAsignadas]);

  const todosSeleccionados = useMemo(() => {
    if (idsDisponibles.length === 0) return false;
    return idsDisponibles.every((id) => nivelesSeleccionados.has(id));
  }, [idsDisponibles, nivelesSeleccionados]);

  const algunosSeleccionados = useMemo(() => {
    if (idsDisponibles.length === 0) return false;
    const seleccionadosDisponibles = idsDisponibles.filter((id) =>
      nivelesSeleccionados.has(id)
    ).length;
    return seleccionadosDisponibles > 0 && !todosSeleccionados;
  }, [idsDisponibles, nivelesSeleccionados, todosSeleccionados]);

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      selectAllCheckboxRef.current.indeterminate = algunosSeleccionados;
    }
  }, [algunosSeleccionados]);

  const handleToggleTodas = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isDisabled) return;
    const seleccionar = event.target.checked;
    const idsPreAsignados = Array.from(preAsignadas);
    let nuevosIds: number[];

    if (seleccionar) {
      nuevosIds = [...new Set([...idsPreAsignados, ...idsDisponibles])];
    } else {
      nuevosIds = idsPreAsignados;
    }
    onToggleSeleccionarTodas(nuevosIds);
  };

  const totalSeleccionadas = nivelesSeleccionados.size;
  const totalNivelesDisponibles = useMemo(
    () => areas.reduce((acc, area) => acc + area.niveles.length, 0),
    [areas]
  );

  return (
    <fieldset className="space-y-4" disabled={isDisabled}>
      <legend className="text-lg font-semibold text-neutro-800 border-b border-neutro-200 pb-2 w-full flex justify-between items-center">
        <span>Asignar Niveles a Áreas <span className="text-acento-500">*</span></span>
        <span className="text-sm font-normal text-neutro-500">
          {totalSeleccionadas} / {totalNivelesDisponibles} seleccionada(s)
        </span>
      </legend>

      {/* Checkbox "Seleccionar Todas" */}
      {areas.length > 0 && (
        <div className="flex items-center mb-4 pl-1">
          <input
            id="seleccionar-todas-areas"
            type="checkbox"
            className={`w-4 h-4 text-principal-600 bg-neutro-100 border-neutro-300 rounded focus:ring-principal-500 focus:ring-offset-0 focus:ring-1 ${
              isDisabled || idsDisponibles.length === 0
                ? 'cursor-not-allowed opacity-60'
                : 'cursor-pointer'
            }`}
            checked={todosSeleccionados}
            ref={selectAllCheckboxRef}
            onChange={handleToggleTodas}
            disabled={isDisabled || idsDisponibles.length === 0}
            aria-label="Seleccionar o deseleccionar todas las áreas-niveles habilitadas"
          />
          <label
            htmlFor="seleccionar-todas-areas"
            className={`ml-2 text-sm font-medium ${
              isDisabled || idsDisponibles.length === 0
                ? 'text-neutro-400 cursor-not-allowed'
                : 'text-neutro-700 cursor-pointer'
            }`}
          >
            Seleccionar Todos (Habilitados)
          </label>
        </div>
      )}

      <div
        className={`flex flex-wrap gap-4 overflow-y-auto max-h-96 rounded-lg p-2 scrollbar-thin scrollbar-thumb-neutro-300 scrollbar-track-neutro-100 ${
          errorAsignacion && !isDisabled
            ? 'border border-acento-500'
            : 'border border-neutro-200'
        }`}
      >
        {isLoading ? (
          <div className="flex-grow text-center py-10 text-gray-400 italic">
            Cargando áreas y niveles...
          </div>
        ) : areas.length === 0 ? (
          <div className="flex-grow px-4 py-6 text-center text-neutro-500 italic">
            No hay áreas y niveles disponibles para asignar.
          </div>
        ) : (
          areas.map((area) => (
            <AreaColumn
              key={area.id_area}
              area={area}
              isExpandida={areasExpandidas.has(area.id_area)}
              isDisabled={isDisabled}
              preAsignadas={preAsignadas}
              areasFromPastGestion={areasFromPastGestion}
              nivelesSeleccionados={nivelesSeleccionados}
              onToggleNivel={onToggleNivel}
              onToggleArea={onToggleArea}
            />
          ))
        )}
      </div>

      {errorAsignacion && !isDisabled && (
        <p role="alert" className="mt-1 text-xs text-acento-600">
          {errorAsignacion.message}
        </p>
      )}
    </fieldset>
  );
}