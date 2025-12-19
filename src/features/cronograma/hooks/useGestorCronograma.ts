import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { cronogramaService } from '../services/cronogramaServices';
import type { FaseGlobal, CrearFasePayload, ActualizarCronogramaPayload } from '../types';

export function useGestorCronograma() {
  const queryClient = useQueryClient();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [modoCreacion, setModoCreacion] = useState(false);
  const [faseSeleccionada, setFaseSeleccionada] = useState<FaseGlobal | null>(null);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { data: fases = [], isLoading, isError: isQueryError } = useQuery<FaseGlobal[]>({
    queryKey: ['fasesGlobales'],
    queryFn: cronogramaService.obtenerFasesActuales,
    staleTime: 0, 
  });

  const abrirModalCrear = useCallback(() => { setFaseSeleccionada(null); setModoCreacion(true); setModalOpen(true); }, []);
  const abrirModalEditar = useCallback((fase: FaseGlobal) => { setFaseSeleccionada(fase); setModoCreacion(false); setModalOpen(true); }, []);
  const cerrarModal = useCallback(() => { setModalOpen(false); setModoCreacion(false); setTimeout(() => setFaseSeleccionada(null), 300); }, []);
  const cerrarModalError = () => setErrorModalOpen(false);
  const mostrarError = (msg: string) => {
    setErrorMessage(msg);
    setErrorModalOpen(true);
  };

  const crearMutation = useMutation({
    mutationFn: cronogramaService.configurarFase,
    onSuccess: () => { toast.success('Fase creada correctamente.'); queryClient.invalidateQueries({ queryKey: ['fasesGlobales'] }); cerrarModal(); },
    onError: (err: any) => mostrarError(err.response?.data?.message || 'Error crítico al crear la fase.')
  });

  const updateMutation = useMutation({
    mutationFn: (vals: { id: number; data: ActualizarCronogramaPayload }) => cronogramaService.actualizarFaseCronograma(vals.id, vals.data),
    onSuccess: () => { toast.success('Cronograma actualizado.'); queryClient.invalidateQueries({ queryKey: ['fasesGlobales'] }); cerrarModal(); },
    onError: (err: any) => mostrarError(err.response?.data?.message || 'Error al actualizar las fechas.')
  });

  const activarMutation = useMutation({
    mutationFn: (idFaseGlobal: number) => cronogramaService.actualizarFaseCronograma(idFaseGlobal, { estado: 1 }),
    onSuccess: () => { toast.success('¡Fase activada!'); queryClient.invalidateQueries({ queryKey: ['fasesGlobales'] }); },
    onError: (err: any) => mostrarError(err.response?.data?.message || 'No se pudo activar la fase.')
  });

  const handleGuardar = (valores: any) => {
    const formatToSQL = (isoDateTime: string) => isoDateTime.replace('T', ' ') + ':00';

    if (modoCreacion) {
      const payload: CrearFasePayload = {
        nombre: valores.nombre,
        codigo: valores.codigo,
        orden: Number(valores.orden),
        fecha_inicio: formatToSQL(valores.fecha_inicio),
        fecha_fin: formatToSQL(valores.fecha_fin),
        activar_ahora: valores.activar_ahora
      };
      crearMutation.mutate(payload);
    } else {
      if (!faseSeleccionada) return;
      const payload: ActualizarCronogramaPayload = {
        fecha_inicio: formatToSQL(valores.fecha_inicio),
        fecha_fin: formatToSQL(valores.fecha_fin)
      };
      updateMutation.mutate({ id: faseSeleccionada.id_fase_global, data: payload });
    }
  };

  return {
    fases, isLoading, isError: isQueryError,
    isSaving: crearMutation.isPending || updateMutation.isPending,
    modalOpen, modoCreacion, faseSeleccionada,
    errorModalOpen, errorMessage, cerrarModalError,
    abrirModalCrear, abrirModalEditar, cerrarModal,
    handleGuardar, handleActivar: activarMutation.mutate
  };
}