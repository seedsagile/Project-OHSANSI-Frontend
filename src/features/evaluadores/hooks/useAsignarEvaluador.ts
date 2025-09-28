// src/evaluadores/hooks/useAsignarEvaluador.ts

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';

import { evaluadorService } from '../services/ApiEvaluador';
import { schemaEvaluador } from '../validations/evaluatorValidation';
import type { FormularioDataEvaluador, PayloadEvaluador } from '../tipos/IndexEvaluador';

export function useAsignarEvaluador({ mostrarModal }: { mostrarModal: (tipo: 'success' | 'error', titulo: string, mensaje: string) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormularioDataEvaluador>({
    resolver: zodResolver(schemaEvaluador),
    mode: 'onBlur',
  });

  const { mutate, isPending } = useMutation({
    mutationFn: evaluadorService.crearEvaluador,
    onSuccess: (data) => {
      console.log('=== ÉXITO EN EL HOOK ===');
      console.log('Respuesta completa recibida:', data);
      // Criterio 20 y 24: Mensaje de confirmación y limpiar campos
      mostrarModal('success', '¡Registro Exitoso!', 'El evaluador ha sido registrado correctamente y asociado al área correspondiente.');
      reset();
    },
    onError: (error: Error) => {
      console.log('=== ERROR EN EL HOOK ===');
      console.log('Error completo:', error);
      console.log('Mensaje de error:', error.message);
      
      const errorMessage = error.message || "Ocurrió un error inesperado.";
      
      // Criterio 8: Error por email duplicado
      if (errorMessage.includes("email") && errorMessage.includes("ya")) {
        mostrarModal('error', 'Email ya Registrado', 'El correo electrónico ya está registrado en el sistema.');
      }
      // Criterio 14: Error por CI duplicado  
      else if (errorMessage.includes("ci") && errorMessage.includes("ya")) {
        mostrarModal('error', 'CI ya Registrado', 'El carnet de identidad ya está registrado en el sistema.');
      }
      // Criterio 13: Error por formato inválido de CI
      else if (errorMessage.includes("CI") && errorMessage.includes("formato")) {
        mostrarModal('error', 'Formato de CI Inválido', 'El CI contiene caracteres especiales. Solo se permiten números.');
      }
      // Criterio 19: Error por formato inválido de código
      else if (errorMessage.includes("Código") && errorMessage.includes("formato")) {
        mostrarModal('error', 'Formato de Código Inválido', 'El Código de acceso contiene caracteres especiales. Solo se permiten letras y números.');
      }
      // Criterio 21: Errores de validación general
      else if (errorMessage.includes("Errores de validación")) {
        mostrarModal('error', 'Datos Inválidos', errorMessage);
      }
      // Error general del servidor
      else {
        mostrarModal('error', 'Error del Servidor', errorMessage);
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
    // Criterio 21: Registro con datos válidos
    mutate(payload);
  };

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isSubmitting: isPending,
  };
}