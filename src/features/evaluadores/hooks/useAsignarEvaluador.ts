// src/evaluadores/hooks/useAsignarEvaluador.ts

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';

import { evaluadorService } from '../services/ApiEvaluador';
import { schemaEvaluador } from '../validations/evaluatorValidation';
import type {
  FormularioDataEvaluador,
  PayloadEvaluador,
  ErrorConData,
} from '../tipos/IndexEvaluador';

export function useAsignarEvaluador({
  mostrarModal,
}: {
  mostrarModal: (tipo: 'success' | 'error', titulo: string, mensaje: string) => void;
}) {
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

      // Mensaje con área y nivel
      const mensaje = `El evaluador "${data.evaluador.nombre} ${data.evaluador.apellido}" ha sido registrado correctamente en el área "${data.area}" - Nivel "${data.nivel}".`;

      mostrarModal('success', '¡Registro Exitoso!', mensaje);
      reset();
    },
    onError: (error: ErrorConData) => {
      console.log('=== ERROR EN EL HOOK ===');
      console.log('Error completo:', error);
      console.log('Mensaje de error:', error.message);

      const errorMessage = error.message || 'Ocurrió un error inesperado.';

      // Verificar si es un error de duplicación con datos de área y nivel
      if (error.errorData?.errors) {
        const {
          errors: validationErrors,
          area_ci,
          nivel_ci,
          area_email,
          nivel_email,
        } = error.errorData;

        // Si hay errores tanto de CI como de email
        if (
          validationErrors.ci &&
          validationErrors.email &&
          area_ci &&
          nivel_ci &&
          area_email &&
          nivel_email
        ) {
          // Verificar si el área y nivel son los mismos para ambos
          if (area_ci === area_email && nivel_ci === nivel_email) {
            const mensaje = `El evaluador ya se encuentra registrado en el área "${area_ci}" - Nivel "${nivel_ci}".`;
            mostrarModal('error', 'CI y Email Repetidos', mensaje);
          } else {
            // Diferentes áreas/niveles para CI y email (caso raro pero posible)
            const mensaje = `• El CI ya está registrado en el área "${area_ci}" - Nivel "${nivel_ci}".\n• El email ya está registrado en el área "${area_email}" - Nivel "${nivel_email}".`;
            mostrarModal('error', 'CI y Email Repetidos', mensaje);
          }
          return;
        }

        // Solo error de CI
        if (validationErrors.ci && area_ci && nivel_ci) {
          const mensaje = `El evaluador ya se encuentra registrado en el área "${area_ci}" - Nivel "${nivel_ci}".`;
          mostrarModal('error', 'CI Repetido', mensaje);
          return;
        }

        // Solo error de email
        if (validationErrors.email && area_email && nivel_email) {
          const mensaje = `El  evaluador ya se encuentra registrado en el área "${area_email}" - Nivel "${nivel_email}".`;
          mostrarModal('error', 'Email Repetido', mensaje);
          return;
        }
      }

      // Otros errores
      if (errorMessage.includes('formato')) {
        mostrarModal('error', 'Formato Inválido', errorMessage);
      } else if (errorMessage.includes('Errores de validación')) {
        mostrarModal('error', 'Datos Inválidos', errorMessage);
      } else {
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
    mutate(payload);
  };

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isSubmitting: isPending,
  };
}
