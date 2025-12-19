import { Calendar, Edit, Play, Clock } from 'lucide-react';
import { clsx } from 'clsx';
import type { FaseGlobal } from '../types';
import { formatDateTimePretty } from '../utils/dateUtils';

interface Props {
  fase: FaseGlobal;
  onEdit: (fase: FaseGlobal) => void;
  onActivate: (id: number) => void;
}

export const CronogramaCard = ({ fase, onEdit, onActivate }: Props) => {
  
  const cronograma = fase.cronograma;
  const estaConfigurada = !!cronograma;
  const esActiva = cronograma?.estado === 1;

  let borderClass = 'border-l-gray-300';
  let badge = <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-[10px] font-bold border border-gray-200">INACTIVA</span>;
  
  if (esActiva) {
    borderClass = 'border-l-green-500 shadow-md';
    badge = <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold border border-green-200 animate-pulse">EN CURSO</span>;
  } else if (estaConfigurada && !esActiva) {
    borderClass = 'border-l-principal-400';
    badge = <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-100">PROGRAMADA</span>;
  }

  return (
    <div className={clsx("relative bg-white p-5 rounded-xl transition-all border-l-4 hover:shadow-lg mb-4", borderClass)}>
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
           <div className={clsx("p-3 rounded-full", esActiva ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400")}>
             {esActiva ? <Clock className="animate-pulse" size={24} /> : <Calendar size={24} />}
           </div>
           <div>
             <div className="flex items-center gap-2 mb-1">
               <span className="text-xs font-bold text-gray-400">FASE 0{fase.orden}</span>
               {badge}
             </div>
             <h3 className="text-lg font-bold text-gray-900">{fase.nombre}</h3>
             <p className="text-xs font-mono text-gray-400">{fase.codigo}</p>
           </div>
        </div>

        {estaConfigurada ? (
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
             <div className="text-center">
               <span className="text-[10px] font-bold text-gray-400 block">INICIO</span>
               {/* AHORA MUESTRA HORA */}
               <span className="text-sm font-semibold">{formatDateTimePretty(cronograma.fecha_inicio)}</span>
             </div>
             <div className="w-px h-8 bg-gray-300 hidden sm:block"></div>
             <div className="text-center">
               <span className="text-[10px] font-bold text-gray-400 block">FIN</span>
               {/* AHORA MUESTRA HORA */}
               <span className="text-sm font-semibold">{formatDateTimePretty(cronograma.fecha_fin)}</span>
             </div>
          </div>
        ) : (
          <span className="text-sm italic text-gray-400">Sin fechas definidas</span>
        )}

        <div className="flex items-center gap-2">
          {estaConfigurada && !esActiva && (
            <button 
              onClick={() => onActivate(fase.id_fase_global)}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm text-sm font-bold"
              title="Activar Fase (Apaga las demás)"
            >
              <Play size={16} fill="currentColor" />
              <span className="hidden md:inline">Activar</span>
            </button>
          )}

          <button
            onClick={() => onEdit(fase)}
            className="flex items-center gap-2 px-3 py-2 border border-gray-200 text-gray-700 rounded-lg hover:border-principal-500 hover:text-principal-600 transition-colors text-sm font-semibold bg-white"
          >
            <Edit size={16} />
            <span>{estaConfigurada ? 'Editar' : 'Programar'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};