import React, { useState, useEffect } from 'react';
import { useSistemaStore } from '@/features/sistema/stores/useSistemaStore';
import { cn } from '@/utils/cn';
import { Activity, Calendar, Clock } from 'lucide-react';
import { SistemaActivoResponse } from '@/features/sistema/types/sistema.types';

export const SystemStatusBar: React.FC = () => {
  const { data, status } = useSistemaStore((state) => state);
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  if (status !== 'active' || !data) return null;

  const { gestion_actual, fase_global_activa, cronograma_vigente } = data as SistemaActivoResponse;

  if (!gestion_actual || !fase_global_activa) return null;

  const getMensajeAmigable = () => {
    if (!cronograma_vigente) return null;

    const ahora = new Date();
    const inicio = new Date(cronograma_vigente.fecha_inicio);
    const fin = new Date(cronograma_vigente.fecha_fin);

    // 1. Aún no ha empezado
    if (ahora < inicio) {
      const diffMs = inicio.getTime() - ahora.getTime();
      const horas = Math.floor(diffMs / (1000 * 60 * 60));
      
      if (horas < 1) return "INICIA EN MENOS DE 1 HORA";
      if (horas < 24) return `INICIA EN ${horas} HORAS`;
      const dias = Math.floor(horas / 24);
      return `INICIA EN ${dias} DÍA${dias !== 1 ? 'S' : ''}`;
    }

    if (ahora >= inicio && ahora <= fin) {
      const diffMs = fin.getTime() - ahora.getTime();
      const horas = Math.floor(diffMs / (1000 * 60 * 60));
      
      if (horas < 1) return "FINALIZA EN MENOS DE 1 HORA";
      if (horas < 24) return `FINALIZA EN ${horas} HORAS`;
      const dias = Math.floor(horas / 24);
      return `FINALIZA EN ${dias} DÍA${dias !== 1 ? 'S' : ''}`;
    }

    return "TIEMPO FINALIZADO";
  };

  const mensajeEspanol = getMensajeAmigable();

  return (
    <div className="flex items-center gap-2 sm:gap-4 ml-auto animate-in fade-in duration-500">
      
      <div className="flex items-center gap-2 sm:gap-4 bg-slate-50 border border-slate-100 rounded-lg px-2 sm:px-3 py-1.5 shadow-sm">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-principal-600 hidden xs:block" />
          <span className="text-[11px] sm:text-xs font-bold text-principal-700">
            {gestion_actual.gestion}
          </span>
        </div>
        
        <div className="h-3 w-px bg-slate-200" />
        
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-principal-600 hidden xs:block" />
          <span className="text-[10px] sm:text-[11px] font-black text-principal-700 uppercase tracking-tight">
            {fase_global_activa.nombre}
          </span>
        </div>
      </div>

      {cronograma_vigente && mensajeEspanol && (
        <div className={cn(
          "flex items-center gap-1.5 px-2 py-1.5 rounded-md border text-[9px] sm:text-[10px] font-black uppercase shadow-sm transition-colors",
          cronograma_vigente.en_fecha 
            ? "bg-green-50 border-green-100 text-green-700" 
            : "bg-amber-50 border-amber-100 text-amber-700"
        )}>
          <Clock className="w-3 h-3" />
          <span className="hidden sm:inline whitespace-nowrap">
            {mensajeEspanol}
          </span>
        </div>
      )}
    </div>
  );
};