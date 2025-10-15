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
  // Renombramos el estado para mayor claridad, ya no es de confirmación
  const [feedbackModal, setFeedbackModal] =
    useState<FeedbackModalState>(initialFeedbackState);
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
    }, 1500); // Se cierra a los 1.5 segundos
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
      // Los errores se siguen mostrando, pero no como confirmación
      setFeedbackModal({ isOpen: true, title: 'Error al Crear', message: error.message, type: 'error' });
    },
  });

  useEffect(() => {
    return () => {
      clearTimeout(modalTimerRef.current);
    };
  }, []);

  // --- LÓGICA DE GUARDADO ACTUALIZADA ---
  const handleGuardarNivel = (data: CrearNivelData) => {
    const nombreNormalizadoParaComparar = normalizarParaComparar(data.nombre);

    const duplicado = niveles.find(
      (nivel) => normalizarParaComparar(nivel.nombre) === nombreNormalizadoParaComparar
    );

    if (duplicado) {
      setFeedbackModal({
        isOpen: true,
        title: 'Nombre Duplicado',
        message: 'Ya existe un nivel con un nombre similar.',
        type: 'error',
      });
      return;
    }

    setNombreNivelCreando(data.nombre);

    // Se llama a la mutación directamente, sin el modal de confirmación
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
    // Exportamos el nuevo estado y su función de cierre
    feedbackModal,
    abrirModalCrear,
    cerrarModalCrear,
    cerrarFeedbackModal,
    handleGuardarNivel,
  };
}