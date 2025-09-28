// src/evaluadores/hooks/useAsignarEvaluador.ts

import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';

import { evaluadorService } from '../services/ApiEvaluador';
import type { FormularioDataEvaluador, PayloadEvaluador } from '../tipos/IndexEvaluador';

export function useAsignarEvaluador({ mostrarModal }: { mostrarModal: (tipo: 'success' | 'error', titulo: string, mensaje: string) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormularioDataEvaluador>({
    mode: 'onBlur',
  });

  const { mutate, isPending } = useMutation({
    mutationFn: evaluadorService.crearEvaluador,
    onSuccess: (data) => {
      console.log('=== ÉXITO EN EL HOOK ===');
      console.log('Respuesta completa recibida:', data);
      mostrarModal('success', '¡Registro Exitoso!', 'El nuevo evaluador ha sido registrado correctamente.');
      reset();
    },
    onError: (error: Error) => {
      console.log('=== ERROR EN EL HOOK ===');
      console.log('Error completo:', error);
      console.log('Mensaje de error:', error.message);
      
      const errorMessage = error.message || "Ocurrió un error inesperado.";
      
      if (errorMessage.includes("Ya existe un evaluador")) {
        mostrarModal('error', 'Evaluador ya Existente', errorMessage);
      } else if (errorMessage.includes("Errores de validación")) {
        mostrarModal('error', 'Datos Inválidos', errorMessage);
      } else if (errorMessage.includes("Error interno del servidor")) {
        mostrarModal('error', 'Error del Servidor', errorMessage);
      } else {
        mostrarModal('error', 'Error', errorMessage);
      }
    },
  });

  const onSubmit = (data: FormularioDataEvaluador) => {
    console.log('=== DATOS DEL FORMULARIO ===');
    console.log('Datos capturados del formulario:', data);
    
    const payload: PayloadEvaluador = {
      nombre: data.nombre,
      apellido: data.apellido,
      ci: data.ci,
      email: data.email,
      password: data.password,
      password_confirmation: data.password_confirmation,
      codigo_evaluador: data.codigo_evaluador,
    };
    
    console.log('Payload creado para enviar:', payload);
    mutate(payload);
  };

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isSubmitting: isPending,
  };
}