import { Trophy, ChevronDown } from 'lucide-react';

// Actualizamos para que coincida con el nuevo JSON de la API
interface Olimpiada {
  id: number;
  nombre: string;
}

interface Props {
  olimpiadas: Olimpiada[];
  seleccionada: string;
  onSelect: (id: string) => void;
}

export const SelectorOlimpiada = ({ olimpiadas, seleccionada, onSelect }: Props) => {
  return (
    <div className="relative group min-w-[240px]">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 z-10">
        <Trophy size={18} />
      </div>
      <select 
        value={seleccionada}
        onChange={(e) => onSelect(e.target.value)}
        className="appearance-none w-full bg-white border border-gray-200 text-gray-700 py-3 pl-10 pr-10 rounded-xl font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all cursor-pointer shadow-sm hover:border-blue-400"
      >
        <option value="">-- Seleccionar Olimpiada --</option>
        {olimpiadas.map((o) => (
          <option key={o.id} value={o.id.toString()}>
            {o.nombre}
          </option>
        ))}
      </select>
      <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-blue-600 transition-colors" />
    </div>
  );
};