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

type NivelRowProps = {
  id: number;
  nombre: string;
  isPreAsignado: boolean;
  isSelected: boolean;
  isFromPast: boolean;
  isDisabled: boolean;
  onToggle: () => void;
};

const NivelRow: React.FC<NivelRowProps> = ({
  id,
  nombre,
  isPreAsignado,
  isSelected,
  isFromPast,
  isDisabled,
  onToggle,
}) => {
  return (
    <div className="grid grid-cols-[1fr,90px] items-center border-t border-neutro-200 first:border-t-0 py-3">
      <label
        htmlFor={`nivel-${id}`}
        className={`flex items-center gap-2 text-sm ${
          isDisabled ? 'text-neutro-400 cursor-not-allowed' : 'text-neutro-700 cursor-pointer'
        }`}
      >
        {nombre}
        {isFromPast && !isPreAsignado && (
          <span className="cursor-help" title="Cargado de gestión pasada">
            <History size={14} className="text-blue-600" />
          </span>
        )}
        {isPreAsignado && (
          <span className="cursor-not-allowed" title="Ya asignado en esta gestión">
            <Lock size={14} className="text-neutro-500" />
          </span>
        )}
      </label>

      <div className="text-center">
        <input
          id={`nivel-${id}`}
          type="checkbox"
          className={`w-4 h-4 text-principal-600 bg-neutro-100 border-neutro-300 rounded focus:ring-principal-500 focus:ring-offset-0 focus:ring-1 ${
            isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
          }`}
          checked={isSelected}
          onChange={onToggle}
          disabled={isDisabled}
          aria-labelledby={`nivel-label-${id}`}
        />
        <label id={`nivel-label-${id}`} htmlFor={`nivel-${id}`} className="sr-only">
          {`Asignar ${nombre} ${isPreAsignado ? '(Asignada y bloqueada)' : ''}`}
        </label>
      </div>
    </div>
  );
};

type AreaAcordeonProps = {
  area: AreaParaAsignar;
  isExpandida: boolean;
  isDisabled: boolean;
  preAsignadas: Set<number>;
  areasFromPastGestion: Set<number>;
  nivelesSeleccionados: Set<number>;
  onToggleArea: () => void;
  onToggleNivel: (id: number) => void;
};

const AreaAcordeon: React.FC<AreaAcordeonProps> = ({
  area,
  isExpandida,
  isDisabled,
  preAsignadas,
  areasFromPastGestion,
  nivelesSeleccionados,
  onToggleArea,
  onToggleNivel,
}) => {
  return (
    <div className="even:bg-gray-50 odd:bg-neutro-100">

      <button
        type="button"
        onClick={onToggleArea}
        disabled={isDisabled}
        className="w-full flex justify-between items-center text-left hover:bg-principal-50 transition-colors py-4 px-4 disabled:opacity-70"
        aria-expanded={isExpandida}
        aria-controls={`area-panel-${area.id_area}`}
      >
        <span className="font-semibold text-principal-700">{area.area}</span>
        <ChevronDown
          size={20}
          className={`text-principal-700 transition-transform duration-200 ${
            isExpandida ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isExpandida && (
        <div
          id={`area-panel-${area.id_area}`}
          role="region"
          className="pb-2 pl-8 pr-4 bg-white border-t border-b border-neutro-200"
        >
          {area.niveles.length === 0 ? (
            <div className="py-3 text-neutro-500 text-sm italic">
              No hay niveles asignados a esta área.
            </div>
          ) : (
            area.niveles.map((nivel) => {
              const id = nivel.id_area_nivel;
              const isPreAsignado = preAsignadas.has(id);
              const isSelected = nivelesSeleccionados.has(id);
              const rowDisabled = isDisabled || isPreAsignado;
              const isFromPast = areasFromPastGestion.has(id);

              return (
                <NivelRow
                  key={id}
                  id={id}
                  nombre={nivel.nombre}
                  isPreAsignado={isPreAsignado}
                  isSelected={isSelected}
                  isFromPast={isFromPast}
                  isDisabled={rowDisabled}
                  onToggle={() => onToggleNivel(id)}
                />
              );
            })
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
  const totalNiveles = useMemo(
    () => areas.reduce((acc, area) => acc + area.niveles.length, 0),
    [areas]
  );

  return (
    <fieldset className="space-y-4" disabled={isDisabled}>
      <legend className="text-lg font-semibold text-neutro-800 border-b border-neutro-200 pb-2 w-full flex justify-between items-center">
        <span>Asignación de Áreas y Niveles <span className="text-acento-500">*</span></span>
        <span className="text-sm font-normal text-neutro-500">
          {totalSeleccionadas} / {totalNiveles} seleccionada(s)
        </span>
      </legend>

      {areas.length > 0 && (
        <div className="flex items-center mb-2 pl-1">
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
        className={`rounded-lg border overflow-hidden ${
          errorAsignacion && !isDisabled
            ? 'border-acento-500'
            : 'border-neutro-200'
        }`}
      >
        <div
          className="overflow-y-auto max-h-[400px] scrollbar-thin scrollbar-thumb-neutro-300 scrollbar-track-neutro-100 hover:scrollbar-thumb-neutro-400"
        >
          <div className="sticky top-0 bg-principal-500 text-white z-10 flex justify-between items-center">
            <span className="py-3 px-4 font-semibold text-left uppercase text-sm tracking-wider">
              Área / Nivel
            </span>
            <span className="py-3 px-4 font-semibold text-center uppercase text-sm tracking-wider w-[90px]">
              Asignar
            </span>
          </div>

          {isLoading ? (
            <div className="text-center py-10 text-gray-400 italic">
              Cargando áreas y niveles...
            </div>
          ) : areas.length === 0 ? (
            <div className="px-4 py-6 text-center text-neutro-500 italic">
              No hay áreas y niveles disponibles para asignar.
            </div>
          ) : (
            areas.map((area) => (
              <AreaAcordeon
                key={area.id_area}
                area={area}
                isExpandida={areasExpandidas.has(area.id_area)}
                isDisabled={isDisabled}
                preAsignadas={preAsignadas}
                areasFromPastGestion={areasFromPastGestion}
                nivelesSeleccionados={nivelesSeleccionados}
                onToggleArea={() => onToggleArea(area.id_area)}
                onToggleNivel={onToggleNivel}
              />
            ))
          )}
        </div>
      </div>
      {errorAsignacion && !isDisabled && (
        <p role="alert" className="mt-1 text-xs text-acento-600">
          {errorAsignacion.message}
        </p>
      )}
    </fieldset>
  );
}