// src/evaluadores/hooks/useAsignarEvaluador.ts

import { useForm } from 'react-hook-form';
import { useState } from 'react';
import type { FormularioDataEvaluador } from '../tipos/IndexEvaluador';

export function useAsignarEvaluador({ mostrarModal }: { mostrarModal: (tipo: 'success' | 'error', titulo: string, mensaje: string) => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormularioDataEvaluador>({
    mode: 'onBlur',
  });

  const onSubmit = async (data: FormularioDataEvaluador) => {
    setIsSubmitting(true);
    
    // Simulamos una llamada a la API con un delay
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulamos éxito
      console.log('Datos del evaluador:', data);
      mostrarModal('success', '¡Registro Exitoso!', 'El nuevo evaluador ha sido registrado correctamente.');
      reset();
    } catch (error) {
      // Simulamos error
      console.error('Error al registrar evaluador:', error);
      mostrarModal('error', 'Error del Servidor', 'Ocurrió un error inesperado al registrar el evaluador.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isSubmitting,
  };
}