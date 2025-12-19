import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle } from 'lucide-react';
import { Modal1 } from '@/components/ui/Modal1';
import type { FaseGlobal } from '../types';

const datesShape = z.object({
  fecha_inicio: z.string().min(1, 'La fecha y hora son requeridas'),
  fecha_fin: z.string().min(1, 'La fecha y hora son requeridas'),
});

const validarFechas = (data: { fecha_inicio: string, fecha_fin: string }) => {
  return new Date(data.fecha_fin) > new Date(data.fecha_inicio);
};

const errorFechas = { message: "La fecha fin debe ser posterior", path: ["fecha_fin"] };

const baseSchema = datesShape.refine(validarFechas, errorFechas);

const createSchema = datesShape.extend({
  nombre: z.string().min(3, 'Mínimo 3 caracteres'),
  codigo: z.enum(['CONFIGURACION', 'EVALUACION', 'FINAL']),
  orden: z.coerce.number().min(1),
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
}

export const ModalGestorFechas = ({ isOpen, modoCreacion, fase, onClose, onGuardar, isSaving }: Props) => {
  
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<CreateValues>({
    resolver: zodResolver(modoCreacion ? createSchema : baseSchema) as any,
    defaultValues: { nombre: '', orden: 1, activar_ahora: false, codigo: 'EVALUACION' }
  });

  const watchActivar = watch('activar_ahora');

  useEffect(() => {
    if (isOpen) {
      if (modoCreacion) {
        reset({ nombre: '', codigo: 'EVALUACION', orden: 1, fecha_inicio: '', fecha_fin: '', activar_ahora: false });
      } else if (fase && fase.cronograma) {
        const formatForInput = (dateStr: string) => dateStr.replace(' ', 'T').substring(0, 16);
        setValue('fecha_inicio', formatForInput(fase.cronograma.fecha_inicio));
        setValue('fecha_fin', formatForInput(fase.cronograma.fecha_fin));
      }
    }
  }, [isOpen, modoCreacion, fase, reset, setValue]);

  return (
    <Modal1 
      isOpen={isOpen} 
      onClose={onClose} 
      title={modoCreacion ? 'Nueva Fase Global' : `Reprogramar: ${fase?.nombre}`}
      type="confirmation"
      confirmText={modoCreacion ? 'Crear Fase' : 'Guardar Cambios'}
      cancelText="Cancelar"
      onConfirm={handleSubmit(onGuardar as any)}
      loading={isSaving}
    >
      <form className="space-y-4 text-left w-full mt-2">
        
        {modoCreacion && (
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1">
              <label className="text-sm font-bold text-gray-700">Nombre de la Fase</label>
              <input {...register('nombre')} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-principal-500 outline-none" placeholder="Ej: Evaluación 2026" />
              {errors.nombre && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12} /> {errors.nombre.message}</p>}
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">Tipo (Código)</label>
              <select {...register('codigo')} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white outline-none">
                <option value="CONFIGURACION">Configuración</option>
                <option value="EVALUACION">Evaluación</option>
                <option value="FINAL">Final</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">Orden</label>
              <input type="number" {...register('orden')} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none" />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-500 uppercase">Inicio</label>
              <input type="datetime-local" {...register('fecha_inicio')} className="w-full bg-white border border-gray-300 rounded-md px-2 py-1.5 text-sm" />
              {errors.fecha_inicio && <p className="text-red-500 text-xs">{errors.fecha_inicio.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-500 uppercase">Fin</label>
              <input type="datetime-local" {...register('fecha_fin')} className="w-full bg-white border border-gray-300 rounded-md px-2 py-1.5 text-sm" />
              {errors.fecha_fin && <p className="text-red-500 text-xs">{errors.fecha_fin.message}</p>}
            </div>
        </div>

        {modoCreacion && (
          <div className="flex items-center gap-3 p-3 rounded-lg border border-principal-100 bg-principal-50/50 cursor-pointer hover:bg-principal-50 transition-colors" onClick={() => setValue('activar_ahora', !watchActivar)}>
            <input type="checkbox" {...register('activar_ahora')} className="w-4 h-4 text-principal-600 rounded pointer-events-none" checked={!!watchActivar} readOnly />
            <label className="text-sm text-principal-700 font-semibold cursor-pointer select-none">Activar esta fase inmediatamente</label>
          </div>
        )}
      </form>
    </Modal1>
  );
};