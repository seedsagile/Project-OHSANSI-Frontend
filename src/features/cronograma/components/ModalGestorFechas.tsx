import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, CalendarClock } from 'lucide-react';
import { Modal1 } from '@/components/ui/Modal1';
import type { FaseGlobal } from '../types';

const datesShape = z.object({
  fecha_inicio: z.string().min(1, 'La fecha y hora de inicio son requeridas'),
  fecha_fin: z.string().min(1, 'La fecha y hora de fin son requeridas'),
});

const validarFechas = (data: { fecha_inicio: string, fecha_fin: string }) => {
  if (!data.fecha_inicio || !data.fecha_fin) return false;
  return new Date(data.fecha_fin) > new Date(data.fecha_inicio);
};

const errorFechas = { 
  message: "La fecha de fin debe ser posterior a la fecha de inicio", 
  path: ["fecha_fin"] 
};

const baseSchema = datesShape.refine(validarFechas, errorFechas);

const createSchema = datesShape.extend({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  codigo: z.enum(['CONFIGURACION', 'EVALUACION', 'FINAL']),
  orden: z.coerce.number().min(1, 'El orden debe ser mayor a 0'),
  activar_ahora: z.boolean().default(false).optional(),
}).refine(validarFechas, errorFechas);

type CreateValues = z.infer<typeof createSchema>;
type EditValues = z.infer<typeof baseSchema>;
type FormValues = CreateValues | EditValues;

interface Props {
  isOpen: boolean;
  modoCreacion: boolean;
  fase: FaseGlobal | null;
  onClose: () => void;
  onGuardar: (data: FormValues) => void;
  isSaving: boolean;
  siguienteOrdenSugerido?: number;
}

export const ModalGestorFechas = ({ 
  isOpen, 
  modoCreacion, 
  fase, 
  onClose, 
  onGuardar, 
  isSaving,
  siguienteOrdenSugerido = 1 
}: Props) => {
  
  const { 
    register, 
    handleSubmit, 
    reset, 
    setValue, 
    watch, 
    formState: { errors } 
  } = useForm<CreateValues>({
    resolver: zodResolver(modoCreacion ? createSchema : baseSchema) as any,
    defaultValues: { 
      nombre: '', 
      orden: 1, 
      activar_ahora: false, 
      codigo: 'EVALUACION' 
    }
  });

  const watchActivar = watch('activar_ahora');

  useEffect(() => {
    if (isOpen) {
      if (modoCreacion) {
        reset({ 
          nombre: '', 
          codigo: 'EVALUACION', 
          orden: siguienteOrdenSugerido, 
          fecha_inicio: '', 
          fecha_fin: '', 
          activar_ahora: false 
        });
      } else if (fase && fase.cronograma) {
        const formatForInput = (dateStr: string) => dateStr.replace(' ', 'T').substring(0, 16);
        
        reset({
          fecha_inicio: formatForInput(fase.cronograma.fecha_inicio),
          fecha_fin: formatForInput(fase.cronograma.fecha_fin),
          nombre: fase.nombre,
          orden: fase.orden,
          codigo: fase.codigo
        } as any);
      }
    }
  }, [isOpen, modoCreacion, fase, reset, siguienteOrdenSugerido]);

  return (
    <Modal1 
      isOpen={isOpen} 
      onClose={onClose} 
      title={modoCreacion ? 'Nueva Fase Global' : `Reprogramar: ${fase?.nombre}`}
      type="confirmation"
      icon={modoCreacion ? CalendarClock : undefined}
      confirmText={modoCreacion ? 'Crear Fase' : 'Guardar Cambios'}
      cancelText="Cancelar"
      onConfirm={handleSubmit(onGuardar as any)}
      loading={isSaving}
    >
      <form className="space-y-5 text-left w-full mt-2" onSubmit={(e) => e.preventDefault()}>
        
        {modoCreacion && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="col-span-2 space-y-1.5">
              <label className="text-sm font-bold text-gray-700">Nombre de la Fase</label>
              <input 
                {...register('nombre')} 
                className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-principal-500 outline-none transition-all ${errors.nombre ? 'border-red-300 bg-red-50' : 'border-gray-300'}`} 
                placeholder="Ej: Evaluación Distrital 2025" 
                autoFocus
              />
              {errors.nombre && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12} /> {errors.nombre.message}</p>}
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700">Tipo de Fase</label>
              <select 
                {...register('codigo')} 
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white outline-none focus:border-principal-500"
              >
                <option value="CONFIGURACION">Configuración</option>
                <option value="EVALUACION">Evaluación</option>
                <option value="FINAL">Final</option>
              </select>
              <p className="text-[10px] text-gray-400">Define las reglas internas del sistema.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700 flex justify-between">
                Orden
                <span className="text-xs font-normal text-principal-600 bg-principal-50 px-2 rounded-full">Sugerido: {siguienteOrdenSugerido}</span>
              </label>
              <input 
                type="number" 
                {...register('orden')} 
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-principal-500" 
              />
              {errors.orden && <p className="text-red-500 text-xs">{errors.orden.message}</p>}
            </div>
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/60 shadow-sm">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <CalendarClock size={14} /> 
            Configuración Temporal
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-600">Fecha de Inicio</label>
              <input 
                type="datetime-local" 
                {...register('fecha_inicio')} 
                className={`w-full bg-white border rounded-lg px-3 py-2 text-sm outline-none focus:border-principal-500 ${errors.fecha_inicio ? 'border-red-300' : 'border-gray-300'}`} 
              />
              {errors.fecha_inicio && <p className="text-red-500 text-xs">{errors.fecha_inicio.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-600">Fecha de Fin</label>
              <input 
                type="datetime-local" 
                {...register('fecha_fin')} 
                className={`w-full bg-white border rounded-lg px-3 py-2 text-sm outline-none focus:border-principal-500 ${errors.fecha_fin ? 'border-red-300' : 'border-gray-300'}`} 
              />
              {errors.fecha_fin && <p className="text-red-500 text-xs">{errors.fecha_fin.message}</p>}
            </div>
          </div>
        </div>

        {modoCreacion && (
          <div 
            className={`
              flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer select-none
              ${watchActivar ? 'bg-principal-50 border-principal-200' : 'bg-white border-gray-200 hover:bg-gray-50'}
            `}
            onClick={() => setValue('activar_ahora', !watchActivar)}
          >
            <div className="mt-0.5">
              <input 
                type="checkbox" 
                {...register('activar_ahora')} 
                className="w-4 h-4 text-principal-600 rounded pointer-events-none focus:ring-principal-500" 
                checked={!!watchActivar} 
                readOnly 
              />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-800 cursor-pointer block">
                Activar fase inmediatamente
              </label>
              <p className="text-xs text-gray-500 mt-0.5">
                Al marcar esto, cualquier otra fase activa se cerrará automáticamente.
              </p>
            </div>
          </div>
        )}
      </form>
    </Modal1>
  );
};