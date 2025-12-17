import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  X, Save, LoaderCircle, Settings2, FileText, Percent, Hash, Calendar, AlertTriangle 
} from 'lucide-react';
import type { Examen, CrearExamenPayload } from '../types';

const schema = z.object({
  nombre: z.string().min(3, 'El nombre es muy corto (mínimo 3 letras)'),
  ponderacion: z.number({ message: "Debe ser un número" })
                .min(1, 'Mínimo 1%')
                .max(100, 'Máximo 100%'),
  maxima_nota: z.number({ message: "Debe ser un número" })
                .min(1, 'La nota máxima debe ser mayor a 0'),
  fecha_hora_inicio: z.string().optional(),
  es_filtro: z.boolean(),
  nota_minima: z.number().optional(),
}).refine((data) => !data.es_filtro || (data.es_filtro && data.nota_minima && data.nota_minima > 0), {
  message: "Si es examen filtro, la nota mínima es obligatoria y mayor a 0",
  path: ["nota_minima"]
});

type FormData = z.infer<typeof schema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CrearExamenPayload) => void;
  examenAEditar?: Examen | null;
  idCompetencia: number;
  isProcessing: boolean;
}

export function ModalCrearExamen({ isOpen, onClose, onSubmit, examenAEditar, idCompetencia, isProcessing }: Props) {
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      ponderacion: undefined,
      maxima_nota: undefined,
      es_filtro: false,
      nombre: '',
      fecha_hora_inicio: ''
    }
  });

  const esFiltro = watch('es_filtro');

  useEffect(() => {
    if (isOpen) {
      if (examenAEditar) {
        reset({
          nombre: examenAEditar.nombre,
          ponderacion: Number(examenAEditar.ponderacion),
          maxima_nota: Number(examenAEditar.maxima_nota),
          fecha_hora_inicio: examenAEditar.fecha_hora_inicio ? examenAEditar.fecha_hora_inicio.replace(' ', 'T').slice(0, 16) : '',
          es_filtro: examenAEditar.tipo_regla === 'nota_corte',
          nota_minima: examenAEditar.configuracion_reglas?.nota_minima || undefined
        });
      } else {
        reset({ 
          nombre: '', 
          ponderacion: undefined,
          maxima_nota: 100,
          es_filtro: false,
          fecha_hora_inicio: '',
          nota_minima: undefined
        });
      }
    }
  }, [isOpen, examenAEditar, reset]);

  const onFormSubmit = (data: FormData) => {
    if (!idCompetencia) {
        return;
    }

    const payload: CrearExamenPayload = {
      id_competencia: idCompetencia,
      nombre: data.nombre,
      ponderacion: data.ponderacion,
      maxima_nota: data.maxima_nota,
      fecha_hora_inicio: data.fecha_hora_inicio ? data.fecha_hora_inicio.replace('T', ' ') + ':00' : undefined,
      tipo_regla: data.es_filtro ? 'nota_corte' : null,
      configuracion_reglas: data.es_filtro ? { nota_minima: data.nota_minima! } : undefined
    };
    onSubmit(payload);
  };

  if (!isOpen) return null;

  // Clases de utilidad
  const labelClasses = "block text-sm font-medium text-gray-700 mb-1.5";
  const inputContainerClasses = "relative group";
  const inputClasses = `w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-principal-500/20 focus:border-principal-500 outline-none transition-all ${errors.nombre ? 'border-red-300 bg-red-50/30' : 'border-gray-300 bg-white'}`;
  const iconClasses = "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-principal-500 transition-colors";
  const errorTextClasses = "text-xs text-red-500 mt-1 font-medium flex items-center gap-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{examenAEditar ? 'Editar Examen' : 'Nuevo Examen'}</h2>
            <p className="text-xs text-gray-500 mt-0.5">Define los parámetros de la evaluación.</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
            aria-label="Cerrar"
            title="Cerrar"
            type="button"
          >
            <X size={20} />
          </button>
        </div>
        
        <form id="examen-form" onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
          
          <div>
            <label className={labelClasses}>Nombre del Examen</label>
            <div className={inputContainerClasses}>
              <FileText size={18} className={iconClasses} />
              <input 
                {...register('nombre')} 
                className={inputClasses} 
                placeholder="Ej: Primer Parcial Teórico"
                autoFocus={!examenAEditar}
              />
            </div>
            {errors.nombre && <p className={errorTextClasses}><AlertTriangle size={12}/>{errors.nombre.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className={labelClasses}>Ponderación (%)</label>
              <div className={inputContainerClasses}>
                <Percent size={18} className={iconClasses} />
                <input 
                  type="number" 
                  step="0.1"
                  {...register('ponderacion', { valueAsNumber: true })} 
                  className={inputClasses}
                  placeholder="0 - 100"
                />
              </div>
              {errors.ponderacion && <p className={errorTextClasses}>{errors.ponderacion.message}</p>}
            </div>
            <div>
              <label className={labelClasses}>Nota Máxima (Puntos)</label>
              <div className={inputContainerClasses}>
                <Hash size={18} className={iconClasses} />
                <input 
                  type="number" 
                  {...register('maxima_nota', { valueAsNumber: true })} 
                  className={inputClasses}
                  placeholder="Ej: 100"
                />
              </div>
              {errors.maxima_nota && <p className={errorTextClasses}>{errors.maxima_nota.message}</p>}
            </div>
          </div>

          {/* Fecha y Hora */}
          <div>
            <label className={labelClasses}>Fecha y Hora de Inicio (Opcional)</label>
            <div className={inputContainerClasses}>
              <Calendar size={18} className={iconClasses} />
              <input 
                type="datetime-local" 
                {...register('fecha_hora_inicio')} 
                className={`${inputClasses} pl-10 [color-scheme:light]`} 
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Si se deja vacío, se podrá iniciar manualmente más tarde.</p>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <label className="flex items-center justify-between cursor-pointer group p-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg transition-colors ${esFiltro ? 'bg-principal-100 text-principal-600' : 'bg-gray-100 text-gray-500 group-hover:text-gray-700'}`}>
                  <Settings2 size={18}/> 
                </div>
                <div>
                  <span className="block text-sm font-bold text-gray-700">Examen Eliminatorio (Filtro)</span>
                  <span className="block text-xs text-gray-500">Si se activa, requiere una nota mínima para aprobar.</span>
                </div>
              </div>
              
              <div className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${esFiltro ? 'bg-principal-600' : 'bg-gray-300'}`}>
                <input type="checkbox" {...register('es_filtro')} className="hidden" />
                <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-300 ${esFiltro ? 'translate-x-5' : ''}`}></div>
              </div>
            </label>

            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${esFiltro ? 'max-h-32 opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200/60 shadow-sm">
      
                <label className="flex items-center gap-1.5 text-sm font-bold text-amber-800 mb-1.5">
                  Nota Mínima de Aprobación <span className="text-amber-600 text-xs font-normal">(Requerido)</span>
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    {...register('nota_minima', { 
                      setValueAs: (v) => v === "" ? undefined : Number(v)
                    })} 
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none transition-all bg-white ${errors.nota_minima ? 'border-red-300' : 'border-amber-300'}`}
                    placeholder="Ej: 51"
                  />
                </div>
                {errors.nota_minima && <p className={errorTextClasses}>{errors.nota_minima.message}</p>}
              </div>
            </div>
          </div>

        </form>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={isProcessing}
              className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg font-semibold hover:bg-gray-100 hover:border-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-gray-200 active:scale-95"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              form="examen-form"
              disabled={isProcessing} 
              className="px-6 py-2 bg-principal-600 text-white rounded-lg font-bold hover:bg-principal-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-principal-500 focus:ring-offset-1 active:scale-95 flex items-center gap-2"
            >
              {isProcessing ? <LoaderCircle className="animate-spin w-5 h-5"/> : <Save size={18}/>}
              <span>{examenAEditar ? 'Actualizar' : 'Guardar Examen'}</span>
            </button>
        </div>

      </div>
    </div>
  );
}