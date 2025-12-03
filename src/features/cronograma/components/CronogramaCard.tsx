import { Calendar, Edit, Plus, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { FaseCalendario } from '../types';

interface CronogramaCardProps {
  fase: FaseCalendario;
  onAction: (fase: FaseCalendario) => void;
}

export const CronogramaCard = ({ fase, onAction }: CronogramaCardProps) => {
  
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const parseFechaLocal = (isoString: string) => {
    const [year, month, day] = isoString.split('T')[0].split('-').map(Number);
    // Creamos la fecha tratando los números tal cual (Mes es index 0 en JS)
    return new Date(year, month - 1, day, 0, 0, 0, 0);
  };

  let estadoVisual: 'SIN_CONFIGURAR' | 'ACTIVA' | 'FINALIZADA' | 'PENDIENTE' = 'SIN_CONFIGURAR';
  let bordeClass = 'border-l-4 border-neutro-300 border-dashed';
  let bgIconClass = 'bg-neutro-100 text-neutro-400';

  if (fase.esta_configurada && fase.fecha_inicio && fase.fecha_fin) {
    const inicio = parseFechaLocal(fase.fecha_inicio);
    const fin = parseFechaLocal(fase.fecha_fin);
    
    const tHoy = hoy.getTime();
    const tInicio = inicio.getTime();
    const tFin = fin.getTime();

    // Lógica estricta:
    if (tHoy >= tInicio && tHoy <= tFin) {
      estadoVisual = 'ACTIVA';
      bordeClass = 'border-l-4 border-l-green-500 shadow-md';
      bgIconClass = 'bg-green-100 text-green-600';
    } else if (tHoy > tFin) {
      estadoVisual = 'FINALIZADA';
      bordeClass = 'border-l-4 border-l-principal-700 bg-neutro-50 opacity-90';
      bgIconClass = 'bg-principal-100 text-principal-700';
    } else {
      estadoVisual = 'PENDIENTE';
      bordeClass = 'border-l-4 border-l-principal-400';
      bgIconClass = 'bg-blue-50 text-blue-500';
    }
  }

  const formatDate = (isoString?: string) => {
    if (!isoString) return '--/--/----';
    const [year, month, day] = isoString.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div 
      className={`
        relative bg-white p-5 rounded-xl transition-all duration-300
        ${bordeClass} 
        ${!fase.esta_configurada ? 'hover:border-principal-300 hover:shadow-sm' : 'hover:shadow-lg'}
      `}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full shrink-0 ${bgIconClass}`}>
            {estadoVisual === 'SIN_CONFIGURAR' && <AlertCircle size={24} />}
            {estadoVisual === 'ACTIVA' && <Clock size={24} className="animate-pulse" />}
            {estadoVisual === 'FINALIZADA' && <CheckCircle2 size={24} />}
            {estadoVisual === 'PENDIENTE' && <Calendar size={24} />}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-neutro-500">
                Fase {fase.orden}
              </span>
              
              {estadoVisual === 'ACTIVA' && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 uppercase border border-green-200 animate-in fade-in">
                  En Curso
                </span>
              )}
              {estadoVisual === 'SIN_CONFIGURAR' && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutro-100 text-neutro-500 uppercase border border-neutro-200">
                  Sin Programar
                </span>
              )}
            </div>
            
            <h3 className="text-lg font-bold text-negro leading-tight">
              {fase.nombre}
            </h3>
            <p className="text-sm text-neutro-500 font-mono mt-0.5">
              CÓDIGO: {fase.codigo}
            </p>
          </div>
        </div>

        {fase.esta_configurada ? (
          <div className="flex items-center gap-6 bg-neutro-50 px-4 py-2 rounded-lg border border-neutro-100 mx-auto sm:mx-0 w-full sm:w-auto justify-center">
            <div className="text-center">
              <span className="block text-[10px] font-bold text-neutro-400 uppercase mb-0.5">Inicio</span>
              <span className="text-sm font-semibold text-negro block">
                {formatDate(fase.fecha_inicio)}
              </span>
            </div>
            
            <div className="w-8 h-[2px] bg-neutro-300 rounded-full"></div>
            
            <div className="text-center">
              <span className="block text-[10px] font-bold text-neutro-400 uppercase mb-0.5">Fin</span>
              <span className="text-sm font-semibold text-negro block">
                {formatDate(fase.fecha_fin)}
              </span>
            </div>
          </div>
        ) : (
          <div className="hidden sm:block text-sm text-neutro-400 italic">
            -- Definir rango de fechas --
          </div>
        )}

        <div className="w-full sm:w-auto">
          <button
            onClick={() => onAction(fase)}
            className={`
              w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all
              ${fase.esta_configurada 
                ? 'bg-white border-2 border-neutro-200 text-neutro-700 hover:border-principal-500 hover:text-principal-600' 
                : 'bg-principal-600 text-white hover:bg-principal-700 shadow-md hover:shadow-lg'
              }
            `}
          >
            {fase.esta_configurada ? (
              <>
                <Edit size={16} />
                <span>Reprogramar</span>
              </>
            ) : (
              <>
                <Plus size={18} />
                <span>Programar</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};