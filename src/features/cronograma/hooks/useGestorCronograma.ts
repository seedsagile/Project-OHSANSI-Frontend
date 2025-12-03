import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { cronogramaService } from '../services/cronogramaServices';
import type { 
  FaseGlobal, 
  CronogramaFase, 
  FaseCalendario, 
  CrearCronogramaPayload, 
  ActualizarCronogramaPayload 
} from '../types';

type FormularioFechas = {
  fecha_inicio: string;
  fecha_fin: string;
};

export function useGestorCronograma() {
  const queryClient = useQueryClient();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [faseSeleccionada, setFaseSeleccionada] = useState<FaseCalendario | null>(null);
  
  const [restricciones, setRestricciones] = useState<{ minStart: string, maxEnd?: string }>({
    minStart: '',
    maxEnd: undefined
  });

  const fasesQuery = useQuery<FaseGlobal[]>({
    queryKey: ['fasesGlobales'],
    queryFn: cronogramaService.obtenerFasesGlobales,
    staleTime: 1000 * 60 * 60,
  });

  const cronogramaQuery = useQuery<CronogramaFase[]>({
    queryKey: ['cronogramaFases'],
    queryFn: cronogramaService.obtenerCronogramaActual,
    staleTime: 0,
  });

  const isLoading = fasesQuery.isLoading || cronogramaQuery.isLoading;
  const isError = fasesQuery.isError || cronogramaQuery.isError;

  const fasesCalendario: FaseCalendario[] = useMemo(() => {
    const fases = fasesQuery.data || [];
    const cronogramas = cronogramaQuery.data || [];

    if (fases.length === 0) return [];

    return fases.map((faseGlobal) => {
      const configExistente = cronogramas.find(
        (c) => c.id_fase_global === faseGlobal.id_fase_global
      );

      return {
        id_fase_global: faseGlobal.id_fase_global,
        nombre: faseGlobal.nombre,
        codigo: faseGlobal.codigo,
        orden: faseGlobal.orden,
        id_cronograma_fase: configExistente?.id_cronograma_fase,
        fecha_inicio: configExistente?.fecha_inicio,
        fecha_fin: configExistente?.fecha_fin,
        estado: configExistente?.estado,
        esta_configurada: !!configExistente,
      };
    }).sort((a, b) => a.orden - b.orden);
  }, [fasesQuery.data, cronogramaQuery.data]);

  const calcularRestricciones = useCallback((faseActual: FaseCalendario, listaFases: FaseCalendario[]) => {
    const hoy = new Date();
    
    let minStartData = hoy;

    if (faseActual.orden > 1) {
      const faseAnterior = listaFases.find(f => f.orden === faseActual.orden - 1);
      
      if (faseAnterior && faseAnterior.esta_configurada && faseAnterior.fecha_fin) {
        const finAnterior = new Date(faseAnterior.fecha_fin.split('T')[0] + 'T00:00:00');
        finAnterior.setDate(finAnterior.getDate() + 1);

        if (finAnterior > minStartData) {
          minStartData = finAnterior;
        }
      }
    }

    let maxEndString: string | undefined = undefined;

    const faseSiguiente = listaFases.find(f => f.orden === faseActual.orden + 1);

    if (faseSiguiente && faseSiguiente.esta_configurada && faseSiguiente.fecha_inicio) {
      const inicioSiguiente = new Date(faseSiguiente.fecha_inicio.split('T')[0] + 'T00:00:00');
      inicioSiguiente.setDate(inicioSiguiente.getDate() - 1);
      
      maxEndString = inicioSiguiente.toISOString().split('T')[0];
    }

    return {
      minStart: minStartData.toISOString().split('T')[0],
      maxEnd: maxEndString
    };
  }, []);

  const abrirModalProgramar = useCallback((fase: FaseCalendario) => {
    setFaseSeleccionada(fase);
    
    const constraints = calcularRestricciones(fase, fasesCalendario);
    setRestricciones(constraints);

    setModalOpen(true);
  }, [fasesCalendario, calcularRestricciones]);

  const cerrarModal = useCallback(() => {
    setModalOpen(false);
    setTimeout(() => setFaseSeleccionada(null), 300);
  }, []);

  const mutation = useMutation({
    mutationFn: async (valores: FormularioFechas) => {
      if (!faseSeleccionada) throw new Error("No se seleccionó ninguna fase.");

      if (faseSeleccionada.esta_configurada && faseSeleccionada.id_cronograma_fase) {
        const payload: ActualizarCronogramaPayload = {
          fecha_inicio: valores.fecha_inicio,
          fecha_fin: valores.fecha_fin,
        };
        return cronogramaService.editarCronograma({
          id_cronograma_fase: faseSeleccionada.id_cronograma_fase,
          id_fase_global: faseSeleccionada.id_fase_global,
          ...payload
        });
      } else {
        const payload: CrearCronogramaPayload = {
          id_fase_global: faseSeleccionada.id_fase_global,
          fecha_inicio: valores.fecha_inicio,
          fecha_fin: valores.fecha_fin,
          descripcion: `Configuración inicial de ${faseSeleccionada.nombre}`
        };
        return cronogramaService.crearCronograma(payload);
      }
    },
    onSuccess: () => {
      const accion = faseSeleccionada?.esta_configurada ? 'actualizado' : 'programado';
      toast.success(`Cronograma ${accion} exitosamente.`);
      queryClient.invalidateQueries({ queryKey: ['cronogramaFases'] });
      cerrarModal();
    },
    onError: (error: any) => {
      const mensaje = error.response?.data?.message || 'Error al guardar.';
      toast.error(mensaje);
    }
  });

  const handleGuardarFechas = (valores: FormularioFechas) => {
    mutation.mutate(valores);
  };

  return {
    fasesCalendario,
    isLoading,
    isError,
    isSaving: mutation.isPending,
    modalOpen,
    faseSeleccionada,
    restricciones,
    abrirModalProgramar,
    cerrarModal,
    handleGuardarFechas,
  };
}