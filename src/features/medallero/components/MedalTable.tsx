import { MedalData } from '../types/medallero.types';

interface MedalTableProps {
  medalData: MedalData[];
  onUpdate: (index: number, field: keyof Omit<MedalData, 'id_area_nivel' | 'nombre_nivel' | 'ya_parametrizado'>, value: string) => void;
  isParametrized: boolean;
}

export const MedalTable = ({ medalData, onUpdate }: MedalTableProps) => {
  const handleIncrement = (index: number, field: keyof Omit<MedalData, 'id_area_nivel' | 'nombre_nivel' | 'ya_parametrizado'>, nivelParametrizado: boolean) => {
    if (nivelParametrizado) return;
    
    const currentValue = medalData[index][field];
    const maxValue = field === 'menciones' ? 20 : 10;
    
    if (currentValue < maxValue) {
      onUpdate(index, field, String(currentValue + 1));
    }
  };

  const handleDecrement = (index: number, field: keyof Omit<MedalData, 'id_area_nivel' | 'nombre_nivel' | 'ya_parametrizado'>, nivelParametrizado: boolean) => {
    if (nivelParametrizado) return;
    
    const currentValue = medalData[index][field];
    
    if (currentValue > 0) {
      onUpdate(index, field, String(currentValue - 1));
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full">
        <thead>
          <tr className="bg-blue-600 text-white">
            <th className="px-6 py-4 text-left font-semibold">NIVEL</th>
            <th className="px-6 py-4 text-center font-semibold">Oro</th>
            <th className="px-6 py-4 text-center font-semibold">Plata</th>
            <th className="px-6 py-4 text-center font-semibold">Bronce</th>
            <th className="px-6 py-4 text-center font-semibold">Menciones</th>
          </tr>
        </thead>
        <tbody>
          {medalData.map((row, index) => {
            const nivelParametrizado = row.ya_parametrizado || false;
            
            return (
              <tr 
                key={row.id_area_nivel}
                className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
              >
                <td className="px-6 py-4 font-medium text-gray-900">
                  {row.nombre_nivel}
                </td>
                {(['oro', 'plata', 'bronce', 'menciones'] as const).map((field) => (
                  <td key={field} className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleDecrement(index, field, nivelParametrizado)}
                        disabled={nivelParametrizado}
                        className="w-6 h-6 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={row[field]}
                        onChange={(e) => !nivelParametrizado && onUpdate(index, field, e.target.value)}
                        disabled={nivelParametrizado}
                        className="w-16 text-center border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                      <button
                        type="button"
                        onClick={() => handleIncrement(index, field, nivelParametrizado)}
                        disabled={nivelParametrizado}
                        className="w-6 h-6 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                    </div>
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};