import { Play, CheckSquare, LoaderCircle, Users, UserCheck, AlertCircle } from 'lucide-react';
import type { SubFase } from '../types';

interface SubFaseCardProps {
  fase: SubFase;
  onIniciar: () => void;
  onFinalizar: () => void;
  puedeIniciar: boolean;
  puedeFinalizar: boolean;
  isUpdating: boolean;
}

export const SubFaseCard = ({ 
  fase, 
  onIniciar, 
  onFinalizar, 
  puedeIniciar, 
  puedeFinalizar,
  isUpdating 
}: SubFaseCardProps) => {
  
  const estadoConfig = {
    NO_INICIADA: { 
        label: 'No iniciada', 
        bgBadge: 'bg-neutro-100 text-neutro-600 border border-neutro-200', 
        borderCard: 'border-neutro-200 hover:border-neutro-300',
        progressColor: 'bg-neutro-300'
    },
    EN_EVALUACION: { 
        label: 'En evaluación', 
        bgBadge: 'bg-principal-50 text-principal-700 border border-principal-200', 
        borderCard: 'border-principal-500 ring-1 ring-principal-200 shadow-md', 
        progressColor: 'bg-principal-500'
    },
    FINALIZADA: { 
        label: 'Finalizada', 
        bgBadge: 'bg-green-50 text-green-700 border border-green-200', 
        borderCard: 'border-green-500',
        progressColor: 'bg-green-500'
    },
  };

  const style = estadoConfig[fase.estado];
  const progressLabelId = `progress-label-${fase.id_subfase}`;

  return (
    <div 
      className={`
        bg-white rounded-xl p-5 flex flex-col gap-5 transition-all duration-300
        border-2 ${style.borderCard} 
        ${fase.estado === 'NO_INICIADA' ? 'hover:shadow-lg' : ''}
      `}
    >
      
      {/* --- SECCIÓN SUPERIOR --- */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-lg font-bold text-neutro-800 leading-tight min-h-[3rem]">
            {fase.nombre}
          </h3>
          <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide select-none ${style.bgBadge}`}>
            {style.label}
          </span>
        </div>
      </div>

      {/* --- SECCIÓN CENTRAL: ESTADÍSTICAS --- */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="bg-neutro-50 p-3 rounded-lg border border-neutro-100 flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-1.5 text-neutro-500 mb-1">
                <Users size={16} />
                <span className="text-xs font-medium uppercase">Estudiantes</span>
            </div>
            <span className="text-lg font-extrabold text-neutro-800">
                {fase.cant_estudiantes}
            </span>
        </div>

        <div className="bg-neutro-50 p-3 rounded-lg border border-neutro-100 flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-1.5 text-neutro-500 mb-1">
                <UserCheck size={16} />
                <span className="text-xs font-medium uppercase">Evaluadores</span>
            </div>
            <span className="text-lg font-extrabold text-neutro-800">
                {fase.cant_evaluadores}
            </span>
        </div>
      </div>

      {/* --- BARRA DE PROGRESO (Corregida) --- */}
      <div className="space-y-1.5">
        <div 
          id={progressLabelId} 
          className="flex justify-between text-xs font-medium text-neutro-500"
        >
          <span>Progreso de notas</span>
          <span>{fase.progreso}%</span>
        </div>
        
        <div className="w-full bg-neutro-100 rounded-full h-2.5 overflow-hidden border border-neutro-100">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ease-out ${style.progressColor}`} 
            style={{ width: `${fase.progreso || 0}%` }} 
            role="progressbar"
            aria-labelledby={progressLabelId}
            aria-valuenow={fase.progreso || 0}
            aria-valuemin={0}
            aria-valuemax={100}
          ></div>
        </div>
      </div>

      {/* --- SECCIÓN INFERIOR: BOTONES --- */}
      <div className="mt-auto pt-4 border-t border-neutro-100 flex gap-3">
        <button
          onClick={onIniciar}
          disabled={!puedeIniciar || isUpdating}
          className={`
            flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm transition-all
            ${puedeIniciar 
              ? 'bg-principal-600 text-white hover:bg-principal-700 hover:shadow-md active:scale-95' 
              : 'bg-neutro-100 text-neutro-400 cursor-not-allowed opacity-60'
            }
          `}
          title={!puedeIniciar && fase.estado === 'NO_INICIADA' ? "Complete la fase anterior para habilitar" : ""}
        >
          {isUpdating && puedeIniciar ? (
            <LoaderCircle className="animate-spin w-4 h-4"/> 
          ) : (
            <Play size={18} fill={puedeIniciar ? "currentColor" : "none"} />
          )}
          <span>Iniciar Fase</span>
        </button>

        <button
          onClick={onFinalizar}
          disabled={!puedeFinalizar || isUpdating}
          className={`
            flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm transition-all
            ${puedeFinalizar 
              ? 'bg-acento-600 text-white hover:bg-acento-700 hover:shadow-md active:scale-95' 
              : 'bg-neutro-100 text-neutro-400 cursor-not-allowed opacity-60'
            }
          `}
        >
          {isUpdating && puedeFinalizar ? (
            <LoaderCircle className="animate-spin w-4 h-4"/> 
          ) : (
            <CheckSquare size={18} />
          )}
          <span>Finalizar</span>
        </button>
      </div>

      {!puedeIniciar && fase.estado === 'NO_INICIADA' && (
        <div className="flex items-center justify-center gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-100">
          <AlertCircle size={14} />
          <span>Requiere finalizar fase previa</span>
        </div>
      )}

    </div>
  );
};