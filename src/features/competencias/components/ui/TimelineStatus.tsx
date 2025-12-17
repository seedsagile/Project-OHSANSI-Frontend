import { Check, Circle, LoaderCircle } from 'lucide-react';
import type { EstadoFase } from '../../types';

const PASOS: EstadoFase[] = ['borrador', 'publicada', 'en_proceso', 'concluida', 'avalada'];

export const TimelineStatus = ({ estado }: { estado: EstadoFase }) => {
  const indiceActual = PASOS.indexOf(estado);

  return (
    <div className="flex items-center gap-1">
      {PASOS.map((paso, index) => {
        const esPasado = index < indiceActual;
        const esActual = index === indiceActual;
        
        let colorClass = "bg-gray-200 text-gray-400";
        if (esPasado) colorClass = "bg-green-500 text-white";
        if (esActual) {
          if (estado === 'en_proceso') colorClass = "bg-green-500 text-white animate-pulse";
          else if (estado === 'borrador') colorClass = "bg-blue-500 text-white";
          else colorClass = "bg-principal-500 text-white";
        }

        return (
          <div key={paso} className="flex items-center">
            {/* Nodo */}
            <div 
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-500 ${colorClass}`}
              title={paso.replace('_', ' ').toUpperCase()}
            >
              {esPasado ? <Check size={12} strokeWidth={3} /> : 
              esActual && estado === 'en_proceso' ? <LoaderCircle size={12} className="animate-spin"/> :
              esActual ? <Circle size={8} fill="currentColor" /> : 
              <span className="opacity-0">.</span>}
            </div>
            
            {index < PASOS.length - 1 && (
              <div className={`w-3 h-1 rounded-full mx-0.5 ${index < indiceActual ? 'bg-green-500' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};