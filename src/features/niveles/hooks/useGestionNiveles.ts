import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { nivelesService } from '../services/nivelesService';
import type { Nivel, CrearNivelData } from '../types';
import { normalizarParaComparar } from '../utils/esquemas';

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

export function useGestionNiveles() {
  const queryClient = useQueryClient();
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [confirmationModal, setConfirmationModal] =
    useState<ConfirmationModalState>(initialConfirmationState);
  const [nombreNivelCreando, setNombreNivelCreando] = useState<string>('');
  const modalTimerRef = useRef<number | undefined>(undefined);

  const { data: niveles = [], isLoading } = useQuery({
    queryKey: ['niveles'],
    queryFn: nivelesService.obtenerNiveles,
  });

  const showAutoClosingModal = (
    title: string,
    message: string,
    type: 'success' | 'error' | 'info'
  ) => {
    setConfirmationModal({ isOpen: true, title, message, type });
    clearTimeout(modalTimerRef.current);
    modalTimerRef.current = window.setTimeout(() => {
      cerrarModalConfirmacion();
    }, 1000);
  };

  const { mutate, isPending: isCreating } = useMutation<Nivel, Error, CrearNivelData>({
    mutationFn: (data) => nivelesService.crearNivel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['niveles'] });
      cerrarModalCrear();
      // Usamos la nueva función centralizada
      showAutoClosingModal(
        '¡Registro Exitoso!',
        `El nivel "${nombreNivelCreando}" ha sido registrado correctamente.`,
        'success'
      );
    },
    onError: (error) => {
      showAutoClosingModal('Error al Crear', error.message, 'error');
    },
  });

  useEffect(() => {
    return () => {
      clearTimeout(modalTimerRef.current);
    };
  }, []);

  const handleGuardarNivel = (data: CrearNivelData) => {
    const nombreNormalizadoParaComparar = normalizarParaComparar(data.nombre);

    const duplicado = niveles.find(
      (nivel) => normalizarParaComparar(nivel.nombre) === nombreNormalizadoParaComparar
    );

    if (duplicado) {
      showAutoClosingModal(
        'Nombre Duplicado',
        'Ya existe un nivel con un nombre similar (ignorando acentos o plurales).',
        'error'
      );
      return;
    }

    setNombreNivelCreando(data.nombre);

    setConfirmationModal({
      isOpen: true,
      title: 'Confirmar Creación',
      message: `¿Está seguro de que desea crear el nivel "${data.nombre}"?`,
      type: 'confirmation',
      onConfirm: () => mutate({ nombre: data.nombre }),
    });
  };

  const abrirModalCrear = () => setModalCrearAbierto(true);
  const cerrarModalCrear = () => {
    setModalCrearAbierto(false);
    setNombreNivelCreando('');
  };
  const cerrarModalConfirmacion = () => {
    setConfirmationModal(initialConfirmationState);
    clearTimeout(modalTimerRef.current);
  };

  return {
    niveles,
    isLoading,
    isCreating,
    modalCrearAbierto,
    confirmationModal,
    abrirModalCrear,
    cerrarModalCrear,
    cerrarModalConfirmacion,
    handleGuardarNivel,
  };
}
