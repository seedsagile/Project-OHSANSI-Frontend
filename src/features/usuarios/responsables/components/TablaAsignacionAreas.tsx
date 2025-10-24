// src/features/usuarios/responsables/components/TablaAsignacionAreas.tsx
import { useState, useMemo } from 'react'; // Importar useState y useMemo
import { useFormContext } from 'react-hook-form';
import { Search } from 'lucide-react'; // Importar Search
import type { Area } from '../types';
import type { ResponsableFormData } from '../utils/validations';

type TablaAsignacionAreasProps = {
  areas: Area[];
  areasSeleccionadas: number[];
  onSeleccionarArea: (areaId: number, seleccionado: boolean) => void;
  isLoading?: boolean;
};

export function TablaAsignacionAreas({
  areas,
  areasSeleccionadas,
  onSeleccionarArea,
  isLoading = false,
}: TablaAsignacionAreasProps) {
  const { formState: { errors, isSubmitting } } = useFormContext<ResponsableFormData>();
  const errorAreas = errors.areas;
  const isDisabled = isLoading || isSubmitting;

  // --- NUEVO: Estado para el filtro ---
  const [filtro, setFiltro] = useState('');

  // --- NUEVO: Áreas filtradas ---
  const areasFiltradas = useMemo(() => {
    if (!filtro) return areas;
    const filtroLower = filtro.toLowerCase();
    return areas.filter(area => area.nombre.toLowerCase().includes(filtroLower));
  }, [areas, filtro]);


  const handleRowClick = (areaId: number) => {
    if (isDisabled) return;
    const currentlySelected = areasSeleccionadas.includes(areaId);
    onSeleccionarArea(areaId, !currentlySelected);
  };

  return (
    // --- NUEVO: Usar fieldset/legend ---
    <fieldset className="space-y-4">
      <legend className="text-lg font-semibold text-neutro-800 border-b border-neutro-200 pb-2 w-full flex justify-between items-center">
        <span>Asignación de Áreas <span className="text-acento-500">*</span></span>
        {/* --- NUEVO: Contador --- */}
        <span className="text-sm font-normal text-neutro-500">
          {areasSeleccionadas.length} seleccionada(s)
        </span>
      </legend>

      {/* --- NUEVO: Input de Filtro --- */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutro-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar área por nombre..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          disabled={isDisabled || areas.length === 0} // Deshabilitar si carga o no hay áreas
          className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
             isDisabled || areas.length === 0 ? 'bg-neutro-100 cursor-not-allowed' : 'border-neutro-300 focus:border-principal-500 focus:ring-principal-300'
          }`}
          aria-label="Filtrar áreas por nombre"
        />
      </div>
      {/* --- Fin Filtro --- */}


      <div className={`rounded-lg border overflow-hidden ${errorAreas && !isDisabled ? 'border-acento-500' : 'border-neutro-300'}`}>
        {/* --- MODIFICADO: Añadidas clases para scrollbar --- */}
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
            <tbody className={isDisabled ? 'opacity-50' : ''}>
              {/* --- MODIFICADO: Usar areasFiltradas --- */}
              {!isLoading && areasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-neutro-500 italic">
                     {filtro ? 'No se encontraron áreas con ese nombre.' : 'No hay áreas disponibles para asignar.'}
                  </td>
                </tr>
              ) : (
                areasFiltradas.map((area, index) => { // Usar areasFiltradas
                  const isSelected = areasSeleccionadas.includes(area.id_area);
                  return (
                    <tr
                      key={area.id_area}
                      onClick={() => handleRowClick(area.id_area)}
                       // --- MODIFICADO: Añadido hover:shadow-sm ---
                      className={`border-b border-neutro-200 transition-all duration-150 ${ // Cambiado transition-colors a transition-all
                         isDisabled ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-principal-50 hover:shadow-sm' // Añadido hover:shadow-sm
                       } ${
                         isSelected ? 'bg-principal-100 hover:bg-principal-100/80' : 'bg-white'
                       }`}
                    >
                      {/* Mostrar índice original si no se filtra, o índice filtrado si se filtra */}
                      <td className="px-4 py-2 text-center font-medium text-neutro-900">{filtro ? index + 1 : areas.findIndex(a => a.id_area === area.id_area) + 1}</td>
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
    </fieldset> // --- NUEVO: Cierre de fieldset ---
  );
}