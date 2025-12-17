import { useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Save, LoaderCircle, Calendar, Layers, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { competenciasService } from '../services/competenciasServices';
import type { CrearCompetenciaPayload } from '../types';

const schema = z.object({
  id_fase_global: z.string().min(1, 'Debe seleccionar una fase'),
  id_area_nivel: z.string().min(1, 'Debe seleccionar un nivel'),
  fecha_inicio: z.string().min(1, 'La fecha de inicio es requerida'),
  fecha_fin: z.string().min(1, 'La fecha de fin es requerida'),
  criterio_clasificacion: z.string().min(1, 'El criterio es requerido'),
}).refine((data) => {
  const inicio = new Date(data.fecha_inicio);
  const fin = new Date(data.fecha_fin);
  return fin >= inicio;
}, {
  message: "La fecha de fin no puede ser anterior al inicio",
  path: ["fecha_fin"],
});

type FormData = z.infer<typeof schema>;

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  areaId: number | null;
}

export function ModalCrearCompetencia({ isOpen, onClose, areaId }: ModalProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      criterio_clasificacion: 'suma_ponderada',
      id_fase_global: '',
      id_area_nivel: '',
      fecha_inicio: '',
      fecha_fin: ''
    }
  });

  const fasesQuery = useQuery({
    queryKey: ['fasesGlobales', 'clasificatoria'],
    queryFn: competenciasService.obtenerFasesGlobales,
    enabled: isOpen,
  });

  const nivelesQuery = useQuery({
    queryKey: ['nivelesPorArea', areaId],
    queryFn: () => areaId ? competenciasService.obtenerNivelesPorArea(areaId) : Promise.resolve([]),
    enabled: isOpen && !!areaId,
  });

  const fechaInicioWatch = watch('fecha_inicio');
  const fechaFinWatch = watch('fecha_fin');

  useEffect(() => {
    if (fechaInicioWatch && !fechaFinWatch) {
      setValue('fecha_fin', fechaInicioWatch);
    }
  }, [fechaInicioWatch, fechaFinWatch, setValue]);

  const crearMutation = useMutation({
    mutationFn: (data: FormData) => {
      const payload: CrearCompetenciaPayload = {
        id_fase_global: Number(data.id_fase_global),
        id_area_nivel: Number(data.id_area_nivel),
        fecha_inicio: data.fecha_inicio,
        fecha_fin: data.fecha_fin,
        criterio_clasificacion: data.criterio_clasificacion,
      };
      return competenciasService.crearCompetencia(payload);
    },
    onSuccess: () => {
      toast.success('Competencia creada exitosamente');
      queryClient.invalidateQueries({ queryKey: ['competencias'] });
      handleClose();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Error al crear la competencia';
      toast.error(msg);
    }
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    crearMutation.mutate(data);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  useEffect(() => {
    if (isOpen) reset();
  }, [isOpen, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <header className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Nueva Competencia</h2>
            <p className="text-xs text-gray-500 mt-1">Configura los detalles del evento</p>
          </div>
          <button 
            type="button"
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>
        </header>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {!areaId ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-amber-600 bg-amber-50 rounded-lg border border-amber-100">
              <AlertCircle size={32} className="mb-2" />
              <p className="font-medium">Selecciona un Área primero</p>
              <p className="text-sm opacity-80">Cierra este modal y elige un área en el filtro superior para continuar.</p>
            </div>
          ) : (
            <form id="form-competencia" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Layers size={16} className="text-principal-500" /> Fase Global
                </label>
                <select 
                  {...register('id_fase_global')}
                  className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-principal-500 focus:border-principal-500 outline-none transition-all"
                  disabled={fasesQuery.isLoading}
                >
                  <option value="">Seleccione una fase...</option>
                  {fasesQuery.data?.map(fase => (
                    <option key={fase.id_fase_global} value={fase.id_fase_global}>
                      {fase.nombre} ({fase.codigo})
                    </option>
                  ))}
                </select>
                {errors.id_fase_global && (
                  <p className="text-xs text-red-500">{errors.id_fase_global.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Nivel Académico</label>
                <select 
                  {...register('id_area_nivel')}
                  className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-principal-500 focus:border-principal-500 outline-none transition-all"
                  disabled={nivelesQuery.isLoading}
                >
                  <option value="">Seleccione un nivel...</option>
                  {nivelesQuery.data?.map(n => (
                    <option key={n.id_area_nivel} value={n.id_area_nivel}>
                      {n.nivel}
                    </option>
                  ))}
                </select>
                {errors.id_area_nivel && (
                  <p className="text-xs text-red-500">{errors.id_area_nivel.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Calendar size={16} className="text-principal-500"/> Inicio
                  </label>
                  <input 
                    type="date" 
                    {...register('fecha_inicio')}
                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-principal-500 outline-none"
                  />
                  {errors.fecha_inicio && (
                    <p className="text-xs text-red-500">{errors.fecha_inicio.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Calendar size={16} className="text-principal-500"/> Fin
                  </label>
                  <input 
                    type="date" 
                    {...register('fecha_fin')}
                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-principal-500 outline-none"
                  />
                  {errors.fecha_fin && (
                    <p className="text-xs text-red-500">{errors.fecha_fin.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Criterio de Clasificación</label>
                <select 
                  {...register('criterio_clasificacion')}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-600 focus:outline-none"
                >
                  <option value="suma_ponderada">Suma Ponderada (Por Defecto)</option>
                  <option value="promedio">Promedio Simple</option>
                </select>
              </div>

            </form>
          )}
        </div>

        <footer className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2.5 rounded-lg text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
            disabled={crearMutation.isPending}
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            form="form-competencia"
            disabled={crearMutation.isPending || !areaId}
            className="px-6 py-2.5 bg-principal-600 text-white rounded-lg font-bold hover:bg-principal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-sm"
          >
            {crearMutation.isPending ? (
              <>
                <LoaderCircle size={18} className="animate-spin" /> Guardando...
              </>
            ) : (
              <>
                <Save size={18} /> Crear Competencia
              </>
            )}
          </button>
        </footer>

      </div>
    </div>
  );
}