import React from 'react';
import { useSistemaStore } from '@/features/sistema/stores/useSistemaStore';
import { cn } from '@/utils/cn';
import { Calendar, Activity, Clock } from 'lucide-react';

export const SystemStatusBar: React.FC = () => {
  const config = useSistemaStore((state) => state.config);

  if (!config) return null;

  const { gestion_actual, fase_global_activa, cronograma_vigente } = config;

  return (
    <div className="flex items-center gap-3 ml-auto">
      <div className="hidden sm:flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
        {/* Gestión */}
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-principal-600" />
          <span className="text-xs font-bold text-principal-700">{gestion_actual.gestion}</span>
        </div>

        <div className="h-3 w-px bg-slate-200" />

        {/* Fase */}
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-principal-600" />
          <span className="text-[11px] font-black text-principal-700 uppercase tracking-tight">
            {fase_global_activa.nombre}
          </span>
        </div>
      </div>

      {/* Cronograma (Badge separado) */}
      <div className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-tighter shadow-sm",
        cronograma_vigente.en_fecha 
          ? "bg-green-50 border-green-100 text-green-700" 
          : "bg-amber-50 border-amber-100 text-amber-700"
      )}>
        <Clock className="w-3 h-3" />
        {cronograma_vigente.mensaje}
      </div>
    </div>
  );
};