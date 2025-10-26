import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { nivelesService } from '../services/nivelesService';
import type { Nivel, CrearNivelData } from '../types';
import { normalizarParaComparar } from '../utils/esquemas';

type FeedbackModalState = {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'info' | 'error' | 'success';
};

const initialFeedbackState: FeedbackModalState = {
  isOpen: false,
  title: '',
  message: '',
  type: 'info',
};

export function useGestionNiveles() {
  const queryClient = useQueryClient();
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState<FeedbackModalState>(initialFeedbackState);
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
    setFeedbackModal({ isOpen: true, title, message, type });
    clearTimeout(modalTimerRef.current);
    modalTimerRef.current = window.setTimeout(() => {
      cerrarFeedbackModal();
    }, 1500);
  };

  const { mutate, isPending: isCreating } = useMutation<Nivel, Error, CrearNivelData>({
    mutationFn: (data) => nivelesService.crearNivel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['niveles'] });
      cerrarModalCrear();
      showAutoClosingModal(
        '¡Registro Exitoso!',
        `El nivel "${nombreNivelCreando}" ha sido registrado correctamente.`,
        'success'
      );
    },
    onError: (error) => {
      setFeedbackModal({
        isOpen: true,
        title: 'Error al Crear',
        message: error.message,
        type: 'error',
      });
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
      setFeedbackModal({
        isOpen: true,
        title: 'Nombre Duplicado',
        message: `El nombre del Nivel "${data.nombre}" ya se encuentra registrado`,
        type: 'error',
      });
      return;
    }

    setNombreNivelCreando(data.nombre);

    mutate({ nombre: data.nombre });
  };

  const abrirModalCrear = () => setModalCrearAbierto(true);
  const cerrarModalCrear = () => {
    setModalCrearAbierto(false);
    setNombreNivelCreando('');
  };
  const cerrarFeedbackModal = () => {
    setFeedbackModal(initialFeedbackState);
    clearTimeout(modalTimerRef.current);
  };

  return {
    niveles,
    isLoading,
    isCreating,
    modalCrearAbierto,
    feedbackModal,
    abrirModalCrear,
    cerrarModalCrear,
    cerrarFeedbackModal,
    handleGuardarNivel,
  };
}