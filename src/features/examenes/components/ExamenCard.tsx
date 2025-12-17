import { 
  Play, Edit, Trash2, Clock, CheckCircle2, AlertTriangle, FileText 
} from 'lucide-react';
import type { Examen } from '../types';
import { HoldButton } from '@/features/competencias/components/ui/HoldButton';

interface Props {
  examen: Examen;
  onEditar: (ex: Examen) => void;
  onEliminar: (id: number) => void;
  onIniciar: (id: number) => void;
  onFinalizar: (id: number) => void;
  isProcessing: boolean;
}

export const ExamenCard = ({ examen, onEditar, onEliminar, onIniciar, onFinalizar, isProcessing }: Props) => {
  
  const estadoConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    no_iniciada: { color: 'bg-gray-100 text-gray-600 border-gray-200', icon: <Clock size={16}/>, label: 'No Iniciado' },
    en_curso: { color: 'bg-green-100 text-green-700 border-green-200 animate-pulse', icon: <Play size={16}/>, label: 'En Curso' },
    finalizada: { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: <CheckCircle2 size={16}/>, label: 'Finalizado' },
  };

  const estilo = estadoConfig[examen.estado_ejecucion] || estadoConfig['no_iniciada'];

  return (
    <div className={`bg-white rounded-xl border p-5 shadow-sm transition-all hover:shadow-md ${examen.estado_ejecucion === 'en_curso' ? 'border-green-400 ring-1 ring-green-100' : 'border-gray-200'}`}>
      
      <div className="flex justify-between items-start mb-3">
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase border ${estilo.color}`}>
          {estilo.icon}
          <span>{estilo.label}</span>
        </div>
        <span className="text-xs font-semibold text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-100">
          {Number(examen.ponderacion)}% Ponderación
        </span>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-800 leading-tight mb-1">{examen.nombre}</h3>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          {examen.tipo_regla === 'nota_corte' && (
            <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-1.5 rounded text-xs font-medium border border-amber-100">
              <AlertTriangle size={12}/> Nota Corte: {examen.configuracion_reglas?.nota_minima}
            </span>
          )}
          <span className="flex items-center gap-1 text-gray-400 text-xs">
            <FileText size={12}/> Nota Máx: {examen.maxima_nota}
          </span>
        </div>
      </div>

      <div className="text-xs text-gray-400 mb-5 font-mono">
        Inicio: {examen.fecha_hora_inicio ? new Date(examen.fecha_hora_inicio).toLocaleString() : 'No definido'}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        
        <div className="flex gap-2">
          {examen.estado_ejecucion === 'no_iniciada' && (
            <>
              <button 
                onClick={() => onEditar(examen)} 
                disabled={isProcessing} 
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Editar examen"
                title="Editar examen"
              >
                <Edit size={18} />
              </button>
              <button 
                onClick={() => onEliminar(examen.id_examen)} 
                disabled={isProcessing} 
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                aria-label="Eliminar examen"
                title="Eliminar examen"
              >
                <Trash2 size={18} />
              </button>
            </>
          )}
        </div>

        <div className="flex gap-2">
          {examen.estado_ejecucion === 'no_iniciada' && (
              <button 
                onClick={() => onIniciar(examen.id_examen)} 
                disabled={isProcessing}
                className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors shadow-sm active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <Play size={16} fill="currentColor"/> Iniciar
              </button>
          )}

          {examen.estado_ejecucion === 'en_curso' && (
              <HoldButton
                label="Finalizar"
                onHoldComplete={() => onFinalizar(examen.id_examen)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 w-32 focus:outline-none focus:ring-2 focus:ring-red-500"
                loading={isProcessing}
              />
          )}
        </div>

      </div>
    </div>
  );
};