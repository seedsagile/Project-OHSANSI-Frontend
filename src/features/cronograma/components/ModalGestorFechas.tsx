import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Save, Calendar, AlertCircle, LoaderCircle, ArrowRight } from 'lucide-react';
import type { FaseCalendario } from '../types';

const fechaSchema = z.object({
  fecha_inicio: z.string().min(1, 'La fecha de inicio es obligatoria'),
  fecha_fin: z.string().min(1, 'La fecha de fin es obligatoria'),
}).refine((data) => {
  return new Date(data.fecha_fin) >= new Date(data.fecha_inicio);
}, {
  message: "La fecha fin no puede ser menor al inicio",
  path: ["fecha_fin"],
});

type FechaFormValues = z.infer<typeof fechaSchema>;

interface ModalGestorFechasProps {
  isOpen: boolean;
  onClose: () => void;
  fase: FaseCalendario | null;
  onGuardar: (valores: FechaFormValues) => void;
  isSaving: boolean;
  restricciones: {
    minStart: string;
    maxEnd?: string;
  };
}

export const ModalGestorFechas = ({
  isOpen,
  onClose,
  fase,
  onGuardar,
  isSaving,
  restricciones
}: ModalGestorFechasProps) => {
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FechaFormValues>({
    resolver: zodResolver(fechaSchema),
  });

  const fechaInicioElegida = watch('fecha_inicio');

  useEffect(() => {
    if (isOpen && fase) {
      if (fase.esta_configurada && fase.fecha_inicio && fase.fecha_fin) {
        setValue('fecha_inicio', fase.fecha_inicio.split('T')[0]);
        setValue('fecha_fin', fase.fecha_fin.split('T')[0]);
      } else {
        reset({ fecha_inicio: '', fecha_fin: '' });
      }
    }
  }, [isOpen, fase, setValue, reset]);

  if (!isOpen || !fase) return null;

  return (
    <div className="fixed inset-0 bg-negro/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-neutro-200">
        
        <div className="bg-principal-50 border-b border-principal-100 px-6 py-4 flex justify-between items-start">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-principal-600 block mb-1">
              {fase.esta_configurada ? 'Reprogramar' : 'Programar'} Fase {fase.orden}
            </span>
            <h2 className="text-xl font-extrabold text-negro leading-none">
              {fase.nombre}
            </h2>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            disabled={isSaving}
            className="text-neutro-400 hover:text-acento-500 transition-colors"
            aria-label="Cerrar"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          
          {/* Información de Restricciones */}
          <div className="mb-6 bg-blue-50 border border-blue-100 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-800">
              <Calendar size={16} />
              <span>Restricciones de Fechas</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-blue-700">
              <div className="bg-white px-2 py-1 rounded border border-blue-200">
                Min: {restricciones.minStart}
              </div>
              <ArrowRight size={14} />
              <div className="bg-white px-2 py-1 rounded border border-blue-200">
                Max: {restricciones.maxEnd || 'Sin límite'}
              </div>
            </div>
            <p className="text-[10px] text-blue-600 leading-tight mt-1">
              * Basado en la fecha actual y fases adyacentes.
            </p>
          </div>

          <form onSubmit={handleSubmit(onGuardar)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              
              {/* Input Inicio */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-neutro-700">Inicio</label>
                <input
                  type="date"
                  min={restricciones.minStart}
                  max={restricciones.maxEnd} 
                  disabled={isSaving}
                  className="w-full px-3 py-2 border border-neutro-300 rounded-lg focus:ring-2 focus:ring-principal-500 outline-none"
                  {...register('fecha_inicio')}
                />
                {errors.fecha_inicio && (
                  <p className="text-xs text-acento-500 flex items-center gap-1 mt-1">
                    <AlertCircle size={12} />
                    {errors.fecha_inicio.message}
                  </p>
                )}
              </div>

              {/* Input Fin */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-neutro-700">Fin</label>
                <input
                  type="date"
                  min={fechaInicioElegida || restricciones.minStart}
                  max={restricciones.maxEnd} 
                  disabled={isSaving}
                  className="w-full px-3 py-2 border border-neutro-300 rounded-lg focus:ring-2 focus:ring-principal-500 outline-none"
                  {...register('fecha_fin')}
                />
                {errors.fecha_fin && (
                  <p className="text-xs text-acento-500 flex items-center gap-1 mt-1">
                    <AlertCircle size={12} />
                    {errors.fecha_fin.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-neutro-100 mt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-semibold text-neutro-600 bg-neutro-100 hover:bg-neutro-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 text-sm font-semibold text-white bg-principal-600 hover:bg-principal-700 rounded-lg shadow-md flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <LoaderCircle className="animate-spin w-4 h-4" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Guardar</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};