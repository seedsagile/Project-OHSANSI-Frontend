import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';

import { asignarResponsableAPI } from '../services/ApiResposableArea';
import type { FormularioData, PayloadResponsable } from '../types/IndexResponsable';
import { separarNombreCompleto, generarTelefonoRandom } from '../utils/responsableUtils';
import {
  NOMBRE_MIN_LENGTH,
  NOMBRE_MAX_LENGTH,
  CARACTERES_ACETADOS_NOMBRE_COMPLETO,
  CI_MIN_LENGTH,
  CI_MAX_LENGTH,
  CARACTERES_ACETADOS_CI,
  CODIGO_MIN_LENGTH,
  CODIGO_MAX_LENGTH,
  CARACTERES_ACETADOS_CODIGO,
  DEFECTO_FECHA_NAC,
} from '../utils/resposableVarGlobalesUtils';
import { useState } from 'react';

// Estado para los modales
type ModalState = {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm?: () => void;
  type: 'confirmation' | 'info' | 'success' | 'error';
};

const initialModalState: ModalState = {
  isOpen: false,
  title: '',
  message: '',
  type: 'info',
};

const schemaResponsable = z.object({
  nombreCompleto: z
    .string()
    .transform((val) => val.trim().replace(/\s+/g, ' '))
    .pipe(
      z
        .string()
        .min(1, 'El campo Nombre Completo es obligatorio.')
        .min(NOMBRE_MIN_LENGTH, `El nombre debe tener al menos ${NOMBRE_MIN_LENGTH} caracteres.`)
        .max(NOMBRE_MAX_LENGTH, `El nombre no puede tener más de ${NOMBRE_MAX_LENGTH} caracteres.`)
        .regex(
          CARACTERES_ACETADOS_NOMBRE_COMPLETO,
          'El campo Nombre solo permite letras, espacios y acentos.'
        )
    ),

  email: z
    .string()
    .transform((val) => val.trim().replace(/\s+/g, ' '))
    .pipe(
      z
        .string()
        .min(1, 'El campo Email es obligatorio.')
        .email('El campo Email debe tener un formato válido (ej. usuario@dominio.com).')
    ),
  ci: z
    .string()
    .transform((val) => val.trim().replace(/\s+/g, ' '))
    .pipe(
      z
        .string()
        .min(1, 'El campo CI es obligatorio.')
        .min(CI_MIN_LENGTH, `El CI debe tener al menos ${CI_MIN_LENGTH} caracteres.`)
        .max(CI_MAX_LENGTH, `El campo CI tiene un límite máximo de ${CI_MAX_LENGTH} caracteres.`)
        .regex(CARACTERES_ACETADOS_CI, 'El CI solo permite letras, números, espacios y guiones.')
    ),

  codigo_encargado: z
    .string()
    .transform((val) => val.trim().replace(/\s+/g, ' '))
    .pipe(
      z
        .string()
        .min(1, 'El campo Código de acceso es obligatorio.')
        .min(CODIGO_MIN_LENGTH, `El código debe tener al menos ${CODIGO_MIN_LENGTH} caracteres.`)
        .max(
          CODIGO_MAX_LENGTH,
          `El campo Código de acceso tiene un límite máximo de ${CODIGO_MAX_LENGTH} caracteres.`
        )
        .regex(CARACTERES_ACETADOS_CODIGO, 'El código solo permite letras y números.')
    ),
});

export function useAsignarResponsable() {
  const navigate = useNavigate();
  const [modalState, setModalState] = useState<ModalState>(initialModalState);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormularioData>({
    resolver: zodResolver(schemaResponsable),
    mode: 'onBlur',
  });

  const { mutate, isPending } = useMutation({
    mutationFn: asignarResponsableAPI,
    onSuccess: () => {
      setModalState({
        isOpen: true,
        type: 'success',
        title: '¡Registro Exitoso!',
        message: 'El nuevo responsable ha sido registrado correctamente.',
        onConfirm: () => {
          reset();
          navigate('/dashboard');
        },
      });
    },
    onError: (error: AxiosError<{ error: string }>) => {
      const errorMessage = error.response?.data?.error || 'Ocurrió un error inesperado.';
      setModalState({
        isOpen: true,
        type: 'error',
        title: '¡Ups! Algo Salió Mal',
        message: errorMessage,
      });
    },
  });

  const onSubmit = (data: FormularioData) => {
    setModalState({
      isOpen: true,
      type: 'confirmation',
      title: 'Confirmar Registro',
      message: `¿Está seguro de que desea registrar a ${data.nombreCompleto}?`,
      onConfirm: () => {
        const { nombre, apellido } = separarNombreCompleto(data.nombreCompleto);
        const payload: PayloadResponsable = {
          codigo_encargado: data.codigo_encargado,
          fecha_asignacion: format(new Date(), 'yyyy-MM-dd'),
          persona: {
            nombre,
            apellido,
            ci: data.ci,
            email: data.email,
            fecha_nac: DEFECTO_FECHA_NAC,
            genero: 'M',
            telefono: generarTelefonoRandom(),
          },
        };
        mutate(payload);
      },
    });
  };

  const handleCancel = () => {
    reset();
    navigate('/dashboard');
  };

  const closeModal = () => {
    if (modalState.type === 'success' && modalState.onConfirm) {
      modalState.onConfirm();
    }
    setModalState(initialModalState);
  };

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isSubmitting: isPending,
    handleCancel,
    setValue,
    modalState,
    closeModal,
  };
}
