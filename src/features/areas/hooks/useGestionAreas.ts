import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { areasService } from '../services/areasService';
import type { Area, CrearAreaData } from '../types';

type ConfirmationModalState = {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm?: () => void;
  type: 'confirmation' | 'info' | 'error' | 'success';
};

const initialConfirmationState: ConfirmationModalState = {
  isOpen: false,
  title: '',
  message: '',
  type: 'info',
};

const normalizarYGenerarVariaciones = (nombre: string): string[] => {
  const normalizado = nombre.trim().toLowerCase().replace(/\s+/g, ' ');
  const variaciones = [normalizado];
  if (normalizado.endsWith('s')) {
    variaciones.push(normalizado.slice(0, -1));
  } else {
    variaciones.push(normalizado + 's');
  }
  if (normalizado.endsWith('es')) {
    variaciones.push(normalizado.slice(0, -2));
  } else if (!normalizado.endsWith('s')) {
    variaciones.push(normalizado + 'es');
  }
  return [...new Set(variaciones)];
};

const existeNombreSimilar = (nombreNuevo: string, areasExistentes: Area[]): boolean => {
  const variacionesNuevas = normalizarYGenerarVariaciones(nombreNuevo);
  return areasExistentes.some((area) => {
    const variacionesExistentes = normalizarYGenerarVariaciones(area.nombre);
    return variacionesNuevas.some((vn) => variacionesExistentes.includes(vn));
  });
};

export function useGestionAreas() {
  const queryClient = useQueryClient();
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [confirmationModal, setConfirmationModal] =
    useState<ConfirmationModalState>(initialConfirmationState);
  const [areaSeleccionada, setAreaSeleccionada] = useState<Area | undefined>(undefined);
  const [nombreAreaCreando, setNombreAreaCreando] = useState<string>('');

  const { data: areas = [], isLoading } = useQuery({
    queryKey: ['areas'],
    queryFn: areasService.obtenerAreas,
  });

  const { mutate, isPending: isCreating } = useMutation<Area, Error, CrearAreaData>({
    mutationFn: areasService.crearArea,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas'] });
      cerrarModalCrear();
      setConfirmationModal({
        isOpen: true,
        type: 'success',
        title: '¡Registro Exitoso!',
        message: `El área "${nombreAreaCreando}" fue creada exitosamente.`,
      });
    },
    onError: (error) => {
      setConfirmationModal({
        isOpen: true,
        type: 'error',
        title: 'Error al Crear',
        message: error.message,
      });
    },
  });

  const handleGuardarArea = (data: CrearAreaData) => {
    const esDuplicado = existeNombreSimilar(data.nombre, areas);

    if (esDuplicado) {
      setConfirmationModal({
        isOpen: true,
        title: 'Nombre Duplicado',
        message: `Ya existe un área con un nombre similar a "${data.nombre}". Por favor, ingrese un nombre diferente.`,
        type: 'info',
      });
      return;
    }

    setNombreAreaCreando(data.nombre);
    setConfirmationModal({
      isOpen: true,
      title: 'Confirmar Creación',
      message: `¿Está seguro de que desea crear el área "${data.nombre}"?`,
      type: 'confirmation',
      onConfirm: () => mutate(data),
    });
  };

  const abrirModalCrear = () => setModalCrearAbierto(true);
  const cerrarModalCrear = () => {
    setModalCrearAbierto(false);
    setNombreAreaCreando('');
  };
  const cerrarModalConfirmacion = () => setConfirmationModal(initialConfirmationState);

  return {
    areas,
    isLoading,
    isCreating,
    modalCrearAbierto,
    confirmationModal,
    areaSeleccionada,
    setAreaSeleccionada,
    abrirModalCrear,
    cerrarModalCrear,
    cerrarModalConfirmacion,
    handleGuardarArea,
  };
}
