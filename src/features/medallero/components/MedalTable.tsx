// src/features/medallero/components/MedalTable.tsx

import { MedalData } from '../types/medallero.types';

interface MedalTableProps {
  medalData: MedalData[];
  onUpdate: (index: number, field: keyof Omit<MedalData, 'id_area_nivel' | 'nombre_nivel'>, value: string) => void;
}

export const MedalTable = ({ medalData, onUpdate }: MedalTableProps) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full">
        <thead>
          <tr className="bg-blue-600 text-white">
            <th className="px-6 py-4 text-left font-semibold">NIVEL</th>
            <th className="px-6 py-4 text-center font-semibold">🥇 Oro</th>
            <th className="px-6 py-4 text-center font-semibold">🥈 Plata</th>
            <th className="px-6 py-4 text-center font-semibold">🥉 Bronce</th>
            <th className="px-6 py-4 text-center font-semibold">📜 Menciones</th>
          </tr>
        </thead>
        <tbody>
          {medalData.map((row, index) => (
            <tr 
              key={row.id_area_nivel}
              className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
            >
              <td className="px-6 py-4 font-medium text-gray-900">
                {row.nombre_nivel}
              </td>
              <td className="px-6 py-4 text-center">
                <input
                  type="text"
                  inputMode="numeric"
                  value={row.oro}
                  onChange={(e) => onUpdate(index, 'oro', e.target.value)}
                  className="w-16 text-center border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </td>
              <td className="px-6 py-4 text-center">
                <input
                  type="text"
                  inputMode="numeric"
                  value={row.plata}
                  onChange={(e) => onUpdate(index, 'plata', e.target.value)}
                  className="w-16 text-center border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </td>
              <td className="px-6 py-4 text-center">
                <input
                  type="text"
                  inputMode="numeric"
                  value={row.bronce}
                  onChange={(e) => onUpdate(index, 'bronce', e.target.value)}
                  className="w-16 text-center border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </td>
              <td className="px-6 py-4 text-center">
                <input
                  type="text"
                  inputMode="numeric"
                  value={row.menciones}
                  onChange={(e) => onUpdate(index, 'menciones', e.target.value)}
                  className="w-16 text-center border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};