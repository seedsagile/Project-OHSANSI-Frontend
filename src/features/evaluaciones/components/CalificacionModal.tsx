import { useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form'; // Agregado tipo SubmitHandler
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Save, LoaderCircle, User, FileSignature } from 'lucide-react'; // Eliminado AlertTriangle
import type { CompetidorSala, GuardarNotaPayload } from '../types/sala.types';
import { useAuth } from '@/auth/login/hooks/useAuth';

// --- Props ---
interface Props {
  isOpen: boolean;
  onClose: () => void;
  onGuardar: (data: GuardarNotaPayload) => void;
  competidor: CompetidorSala;
  isProcessing: boolean;
}

// --- 1. Definición del Esquema Base (Tipos estáticos estables) ---
const baseSchema = z.object({
  nota: z.number({ message: "Ingrese una nota válida" })
         .min(0, "La nota no puede ser negativa")
         .max(100, "La nota máxima es 100"),
  estado_participacion: z.enum(['presente', 'ausente']),
  // Definimos siempre como opcional para que coincida con el tipo TypeScript
  motivo_cambio: z.string().optional(),
});

// Inferimos el tipo una sola vez
type FormData = z.infer<typeof baseSchema>;

// --- 2. Función para crear el validador con lógica condicional ---
const createResolver = (isEditing: boolean) => {
  return zodResolver(
    baseSchema.refine((data) => {
      // Si está editando, el motivo es obligatorio y debe tener texto
      if (isEditing) {
        return !!data.motivo_cambio && data.motivo_cambio.trim().length >= 5;
      }
      return true; // Si no edita, siempre es válido
    }, {
      message: "Debe justificar el cambio de nota (mínimo 5 caracteres)",
      path: ["motivo_cambio"] // Apunta el error al campo correcto
    })
  );
};

export function CalificacionModal({ isOpen, onClose, onGuardar, competidor, isProcessing }: Props) {
  const { userId } = useAuth();
  
  // Determinar si es edición
  const isEditing = competidor.estado_evaluacion === 'Calificado';

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: createResolver(isEditing), // Usamos el resolver dinámico
    defaultValues: {
      nota: undefined,
      estado_participacion: 'presente',
      motivo_cambio: ''
    }
  });

  const estadoParticipacion = watch('estado_participacion');

  // Cargar datos iniciales
  useEffect(() => {
    if (isOpen && competidor) {
      // Lógica para inferir si el competidor estuvo ausente:
      // Si ya fue calificado y su nota es 0, se asume que fue por ausencia.
      reset({
        nota: competidor.nota_actual ? Number(competidor.nota_actual) : undefined,
        estado_participacion: Number(competidor.nota_actual) === 0 && competidor.estado_evaluacion === 'Calificado' ? 'ausente' : 'presente',
        motivo_cambio: ''
      });
    }
  }, [isOpen, competidor, reset]);

  // Si marca ausente, la nota se va a 0 automáticamente
  useEffect(() => {
    if (estadoParticipacion === 'ausente') {
      setValue('nota', 0);
    }
  }, [estadoParticipacion, setValue]);

  // Submit Handler con tipo correcto
  const onSubmit: SubmitHandler<FormData> = (data) => {
    if (!userId) return;

    const payload: GuardarNotaPayload = {
      user_id: userId,
      nota: data.nota,
      estado_participacion: data.estado_participacion,
      motivo_cambio: isEditing ? data.motivo_cambio : undefined
    };
    
    onGuardar(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-principal-50 border-b border-principal-100 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-principal-900">
              {isEditing ? 'Modificar Calificación' : 'Calificar Competidor'}
            </h2>
            <div className="flex items-center gap-2 mt-1 text-xs text-principal-700 font-medium">
               <User size={12}/> {competidor.nombre_completo}
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Cerrar modal"
            title="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          
          {/* Selector de Estado */}
          <div className="flex gap-4 p-1 bg-gray-100 rounded-lg">
             <button
               type="button"
               onClick={() => setValue('estado_participacion', 'presente')}
               className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${estadoParticipacion === 'presente' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
             >
               Presente
             </button>
             <button
               type="button"
               onClick={() => setValue('estado_participacion', 'ausente')}
               className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${estadoParticipacion === 'ausente' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
             >
               Ausente
             </button>
          </div>

          {/* Input de Nota */}
          <div className={`transition-all duration-300 ${estadoParticipacion === 'ausente' ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
            <label className="block text-sm font-bold text-gray-700 mb-1">Nota Obtenida</label>
            <div className="relative">
               <input 
                 type="number" 
                 step="0.01"
                 {...register('nota', { valueAsNumber: true })}
                 className="w-full text-center text-3xl font-mono py-3 border-2 border-gray-200 rounded-xl focus:border-principal-500 focus:ring-4 focus:ring-principal-100 outline-none transition-all"
                 placeholder="0.00"
                 autoFocus
               />
               <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">/ 100</span>
            </div>
            {errors.nota && <p className="text-xs text-red-500 mt-1 font-bold text-center">{errors.nota.message}</p>}
          </div>

          {/* Motivo de Cambio (Solo si es edición) */}
          {isEditing && (
            <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 animate-in slide-in-from-bottom-2">
               {/* 3. Corrección CSS: Eliminado 'block', dejado 'flex' */}
               <label className="flex items-center gap-1 text-xs font-bold text-amber-800 mb-1">
                 <FileSignature size={12}/> Motivo del cambio (Auditoría)
               </label>
               <textarea 
                 {...register('motivo_cambio')}
                 className="w-full px-3 py-2 text-sm border border-amber-300 rounded-md focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none bg-white min-h-[60px]"
                 placeholder="Ej: Error de dedo al transcribir..."
               />
               {errors.motivo_cambio && <p className="text-xs text-red-500 mt-1">{errors.motivo_cambio.message}</p>}
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="px-6 py-2 text-sm font-bold text-white bg-principal-600 hover:bg-principal-700 rounded-lg shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? <LoaderCircle className="animate-spin w-4 h-4" /> : <Save size={16} />}
              Guardar Nota
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}