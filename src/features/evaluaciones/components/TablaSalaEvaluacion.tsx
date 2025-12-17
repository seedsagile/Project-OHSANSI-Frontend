import { Lock, Edit2,UserX } from 'lucide-react'; // Eliminado UserX
import type { CompetidorSala } from '../types/sala.types';

interface Props {
  competidores: CompetidorSala[];
  onCalificar: (comp: CompetidorSala) => void;
  onDescalificar: (comp: CompetidorSala) => void;//clau
  isLoading: boolean;
}

export const TablaSalaEvaluacion = ({ competidores, onCalificar,onDescalificar, isLoading }: Props) => {
  
  if (isLoading) {
    return <div className="text-center py-20 text-gray-500 animate-pulse">Cargando sala...</div>;
  }

  if (competidores.length === 0) {
    return <div className="text-center py-20 text-gray-400">No hay estudiantes en este examen.</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase">
          <tr>
            <th className="px-6 py-4">Estudiante</th>
            <th className="px-6 py-4">CI / Código</th>
            <th className="px-6 py-4 text-center">Estado</th>
            <th className="px-6 py-4 text-center">Nota</th>
            <th className="px-6 py-4 text-right">Acción</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {competidores.map((comp) => {
            
            // --- Lógica de Estado Visual ---
            const estaBloqueadoAjeno = comp.es_bloqueado && !comp.bloqueado_por_mi;
            // Eliminada variable 'estaBloqueadoPorMi' que no se usaba
            const esDescalificado = comp.estado_evaluacion === 'Descalificado';
            
            let rowClass = "hover:bg-gray-50 transition-colors";
            let statusBadge = <span className="badge-gray">Pendiente</span>;
            let notaDisplay = <span className="text-gray-400">-</span>;

            // 1. Rojo + Candado (Bloqueado por otro)
            if (estaBloqueadoAjeno) {
               rowClass = "bg-red-50/60";
               statusBadge = (
                 <span className="flex items-center justify-center gap-1 text-red-600 font-bold text-xs">
                   <Lock size={12} /> Calificando...
                 </span>
               );
            }
            
            // 2. Verde (Ya calificado)
            else if (comp.estado_evaluacion === 'Calificado') {
               rowClass = "bg-white";
               statusBadge = <span className="badge-green">Calificado</span>;
               notaDisplay = <span className="font-bold text-gray-800">{Number(comp.nota_actual).toFixed(2)}</span>;
            }

            // 3. Negro (Descalificado)
            else if (esDescalificado) {
               rowClass = "bg-gray-100 opacity-70";
               statusBadge = <span className="badge-black">Descalificado</span>;
               notaDisplay = <span className="font-bold text-black">0.00</span>;
            }

            return (
              <tr key={comp.id_evaluacion} className={rowClass}>
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{comp.nombre_completo}</div>
                  <div className="text-xs text-gray-500">{comp.grado_escolaridad}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                  {comp.ci}
                </td>
                <td className="px-6 py-4 text-center">
                  {statusBadge}
                </td>
                <td className="px-6 py-4 text-center">
                  {notaDisplay}
                </td>
                <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">

                  {/* CALIFICAR / EDITAR */}
                  <button
                    onClick={() => onCalificar(comp)}
                    disabled={estaBloqueadoAjeno || esDescalificado}
                    className={`
                      px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all active:scale-95
                      ${estaBloqueadoAjeno || esDescalificado
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                        : 'bg-principal-600 text-white hover:bg-principal-700'
                      }
                    `}
                  >
                    {comp.estado_evaluacion === 'Calificado' ? (
                      <span className="flex items-center gap-2">
                        <Edit2 size={14} /> Editar
                      </span>
                    ) : (
                      <span>Calificar</span>
                    )}
                  </button>

                  {/* DESCALIFICAR */}
                  <button
                    onClick={() => onDescalificar(comp)}
                    disabled={estaBloqueadoAjeno || esDescalificado}
                    className={`
                      px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all active:scale-95
                      ${estaBloqueadoAjeno || esDescalificado
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                        : 'bg-red-600 text-white hover:bg-red-700'
                      }
                    `}
                    title="Descalificar estudiante"
                  >
                    <span className="flex items-center gap-2">
                      <UserX size={14} />
                      Descalificar
                    </span>
                  </button>

                </div>
              </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      <style>{`
        .badge-gray { @apply px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-semibold; }
        .badge-green { @apply px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold border border-green-200; }
        .badge-black { @apply px-2 py-1 bg-gray-900 text-white rounded text-xs font-bold; }
      `}</style>
    </div>
  );
};