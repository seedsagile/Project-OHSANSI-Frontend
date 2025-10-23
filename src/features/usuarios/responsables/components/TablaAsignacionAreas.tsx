// src/features/usuarios/responsables/components/TablaAsignacionAreas.tsx
import { useFormContext } from 'react-hook-form';
// Asegúrate que las rutas sean correctas
import type { Area } from '../types'; // Asume index.ts
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
  const isDisabled = isLoading || isSubmitting; // Deshabilitar si carga o envía

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-neutro-800 border-b border-neutro-200 pb-2">
        Asignación de Áreas <span className="text-acento-500">*</span>
      </h2>

      <div className={`rounded-lg border overflow-hidden ${errorAreas && !isDisabled ? 'border-acento-500' : 'border-neutro-300'}`}>
        <div className="max-h-60 overflow-y-auto relative"> {/* Añadir relative */}
          {/* Indicador de carga si aplica */}
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
              {/* No mostrar "Cargando" aquí si ya hay overlay */}
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
                    <tr key={area.id_area} className="bg-white border-b border-neutro-200 hover:bg-neutro-50">
                      <td className="px-4 py-2 text-center font-medium text-neutro-900">{index + 1}</td>
                      <td className="px-4 py-2">{area.nombre}</td>
                      <td className="px-4 py-2 text-center">
                        <input
                          id={`area-${area.id_area}`}
                          type="checkbox"
                          className="w-4 h-4 text-principal-600 bg-neutro-100 border-neutro-300 rounded focus:ring-principal-500 focus:ring-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
                          checked={isSelected}
                          disabled={isDisabled} // Deshabilitar checkbox durante carga/envío
                          onChange={(e) => onSeleccionarArea(area.id_area, e.target.checked)}
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
       {/* Mostrar error debajo si existe y no está cargando */}
       {errorAreas && !isDisabled && (
        <p role="alert" className="mt-1 text-xs text-acento-600">{errorAreas.message}</p>
      )}
    </div>
  );
}