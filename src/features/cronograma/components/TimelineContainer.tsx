import { Layers, LoaderCircle } from 'lucide-react';
import { CronogramaCard } from './CronogramaCard';
import type { FaseGlobal } from '../types';

interface TimelineContainerProps {
  fases: FaseGlobal[];
  onEdit: (fase: FaseGlobal) => void;
  onActivate: (id: number) => void;
  isLoading: boolean;
}

export const TimelineContainer = ({ 
  fases, 
  onEdit,
  onActivate,
  isLoading 
}: TimelineContainerProps) => {

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
        <LoaderCircle className="animate-spin text-principal-600 h-12 w-12 mb-4" />
        <p className="text-neutro-500 font-medium animate-pulse">
          Sincronizando cronograma...
        </p>
      </div>
    );
  }

  if (fases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed border-neutro-200 rounded-2xl bg-white/50">
        <div className="bg-neutro-100 p-4 rounded-full mb-4">
          <Layers size={40} className="text-neutro-400" />
        </div>
        <h3 className="text-xl font-bold text-neutro-700 mb-2">
          No hay fases configuradas
        </h3>
        <p className="text-neutro-500 text-center max-w-md">
          Comience creando una nueva Fase Global desde el botón superior.
        </p>
      </div>
    );
  }

  return (
    <div className="relative py-4 px-2 sm:px-4">
      <div 
        className="absolute left-8 sm:left-[3.25rem] top-8 bottom-8 w-0.5 bg-gradient-to-b from-principal-200 via-principal-300 to-neutro-200 hidden sm:block" 
        aria-hidden="true"
      />

      <div className="space-y-8 sm:space-y-10 relative z-10">
        {fases.map((fase) => {
          const estaConfigurada = !!fase.cronograma;
          const esActiva = fase.cronograma?.estado === 1;

          return (
            <div key={fase.id_fase_global} className="relative sm:pl-24 group">
              
              <div 
                className="absolute left-[3.25rem] top-1/2 w-8 h-0.5 bg-principal-200 hidden sm:block -translate-y-1/2 group-hover:bg-principal-400 transition-colors" 
              />

              <div 
                className={`
                  absolute left-[2.65rem] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-4 border-white shadow-sm hidden sm:block transition-all duration-300
                  ${esActiva 
                    ? 'bg-green-500 scale-125 ring-4 ring-green-100' 
                    : estaConfigurada 
                      ? 'bg-principal-500 scale-110' 
                      : 'bg-neutro-300 scale-100'
                  }
                `}
              />

              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-8 text-center hidden sm:block">
                <span className={`text-xs font-bold ${esActiva ? 'text-green-600' : 'text-neutro-400'}`}>
                  0{fase.orden}
                </span>
              </div>

              <CronogramaCard 
                fase={fase} 
                onEdit={onEdit} 
                onActivate={onActivate}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};