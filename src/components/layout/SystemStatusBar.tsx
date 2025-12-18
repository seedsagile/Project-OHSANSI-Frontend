import React from 'react';
import { useSistemaStore } from '@/features/sistema/stores/useSistemaStore';
import { cn } from '@/utils/cn';
import { Activity, Calendar, Clock } from 'lucide-react';

export const SystemStatusBar: React.FC = () => {
  const config = useSistemaStore((state) => state.config);

  if (!config) return null;

  const { gestion_actual, fase_global_activa, cronograma_vigente } = config;

  return (
    <div className="flex items-center gap-2 sm:gap-4 ml-auto">
      <div className="flex items-center gap-2 sm:gap-4 bg-slate-50 border border-slate-100 rounded-lg px-2 sm:px-3 py-1">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-principal-600 hidden xs:block" />
          <span className="text-[11px] sm:text-xs font-bold text-principal-700">{gestion_actual.gestion}</span>
        </div>
        
        <div className="h-3 w-px bg-slate-200" />
        
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-principal-600 hidden xs:block" />
          <span className="text-[10px] sm:text-[11px] font-black text-principal-700 uppercase tracking-tight">
            {fase_global_activa.nombre}
          </span>
        </div>
      </div>

      <div className={cn(
        "flex items-center gap-1.5 px-2 py-1 rounded-md border text-[9px] sm:text-[10px] font-black uppercase shadow-sm",
        cronograma_vigente.en_fecha 
          ? "bg-green-50 border-green-100 text-green-700" 
          : "bg-amber-50 border-amber-100 text-amber-700"
      )}>
        <Clock className="w-3 h-3" />
        <span className="hidden sm:inline">{cronograma_vigente.mensaje}</span>
      </div>
    </div>
  );
};