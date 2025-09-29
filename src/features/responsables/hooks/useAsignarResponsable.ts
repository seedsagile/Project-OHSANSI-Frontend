import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { AxiosError } from 'axios';

import { asignarResponsableAPI } from '../services/ApiResposableArea';
import type { FormularioData, PayloadResponsable } from '../types/IndexResponsable';

export const NOMBRE_MIN_LENGTH = 2;
export const NOMBRE_MAX_LENGTH = 40;
export const CI_MIN_LENGTH = 4;
export const CI_MAX_LENGTH = 15;
export const CODIGO_MIN_LENGTH = 4;
export const CODIGO_MAX_LENGTH = 10;
export const CARACTERES_ACETADOS_NOMBRE_COMPLETO = /^[a-zA-Z\s\u00C0-\u017F]+$/;
export const CARACTERES_ACETADOS_EMAIL = /^[a-zA-Z0-9.@]$/;
export const CARACTERES_ACETADOS_CI = /[a-zA-Z0-9-]$/;
export const CARACTERES_ACETADOS_CODIGO = /^[a-zA-Z0-9]+$/;

const DEFECTO_FECHA_NAC = '1990-01-01';

type ApiErrorResponse = {
  error: string;
};

function separarNombreCompleto(nombreCompleto: string): { nombre: string; apellido: string } {
  if (!nombreCompleto || typeof nombreCompleto !== 'string') {
    return { nombre: '', apellido: '' };
  }

  const palabras = nombreCompleto.trim().split(' ').filter(p => p);

  if (palabras.length <= 1) {
    return { nombre: palabras[0] || '', apellido: '' };
  }

  if (palabras.length === 2) {
    return { nombre: palabras[0], apellido: palabras[1] };
  }

  const apellido = palabras.slice(-2).join(' ');
  const nombre = palabras.slice(0, -2).join(' ');

  return { nombre, apellido };
}

function generarTelefonoRandom(): string {
  const primerDigito = Math.random() < 0.5 ? '6' : '7';
  let restoNumero = '';
  for (let i = 0; i < 7; i++) {
    restoNumero += Math.floor(Math.random() * 10);
  }
  return primerDigito + restoNumero;
}

const schemaResponsable = z.object({
  nombreCompleto: z.string()
    .refine(val => val.trim().replace(/\s+/g, ' ') === val, {
      message: 'El nombre no debe tener espacios innecesarios al inicio, al final o entre palabras.',
    })
    .transform(val => val.trim().replace(/\s+/g, ' '))
    .pipe(z.string()
      .min(1, 'El campo Nombre Completo es obligatorio.')
      .min(NOMBRE_MIN_LENGTH, `El nombre debe tener al menos ${NOMBRE_MIN_LENGTH} caracteres.`)
      .max(NOMBRE_MAX_LENGTH, `El nombre no puede tener más de ${NOMBRE_MAX_LENGTH} caracteres.`)
      .regex(CARACTERES_ACETADOS_NOMBRE_COMPLETO, 'El campo Nombre solo permite letras, espacios y acentos.')
    ),

  email: z.string()
    .min(1, 'El campo Email es obligatorio.')
    .email('El campo Email debe tener un formato válido (ej. usuario@dominio.com).'),
  ci: z.string()
    .min(1, 'El campo CI es obligatorio.')
    .min(CI_MIN_LENGTH, `El CI debe tener al menos ${CI_MIN_LENGTH} caracteres.`)
    .max(CI_MAX_LENGTH, `El campo CI tiene un límite máximo de ${CI_MAX_LENGTH} caracteres.`)
    .regex(CARACTERES_ACETADOS_CI, 'El CI solo permite letras, números, espacios y guiones.'),

  codigo_encargado: z.string()
    .min(1, 'El campo Código de acceso es obligatorio.')
    .min(CODIGO_MIN_LENGTH, `El código debe tener al menos ${CODIGO_MIN_LENGTH} caracteres.`)
    .max(CODIGO_MAX_LENGTH, `El campo Código de acceso tiene un límite máximo de ${CODIGO_MAX_LENGTH} caracteres.`)
    .regex(CARACTERES_ACETADOS_CODIGO, 'El código solo permite letras y números.'),
});

export function useAsignarResponsable({ mostrarModal }: { mostrarModal: (tipo: 'success' | 'error', titulo: string, mensaje: string) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormularioData>({
    resolver: zodResolver(schemaResponsable),
    mode: 'onBlur',
  });

  const { mutate, isPending } = useMutation({
    mutationFn: asignarResponsableAPI,
    onSuccess: () => {
      mostrarModal('success', '¡Registro Exitoso!', 'El nuevo responsable ha sido registrado correctamente.');
      reset();
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const errorMessage = error.response?.data?.error || "Ocurrió un error inesperado.";

      if (errorMessage.includes("Ya existe un responsable asignado para esta área")) {
        mostrarModal('error', 'Área ya Asignada', errorMessage);
      } else if (errorMessage.toLowerCase().includes("duplicate")) {
        mostrarModal('error', 'Registro Duplicado', 'El CI, correo o código de encargado ya existe en el sistema.');
      } else {
        mostrarModal('error', 'Error del Servidor', errorMessage);
      }
      console.error(error);
    },
  });
  const onSubmit = (data: FormularioData) => {
    const { nombre, apellido } = separarNombreCompleto(data.nombreCompleto);

    const payload: PayloadResponsable = {
      codigo_encargado: data.codigo_encargado,
      fecha_asignacion: format(new Date(), 'yyyy-MM-dd'),
      persona: {
        nombre: nombre,
        apellido: apellido,
        ci: data.ci,
        email: data.email,
        fecha_nac: DEFECTO_FECHA_NAC,
        genero: 'M',
        telefono: generarTelefonoRandom(),
      },
    };
    
    mutate(payload);
  };

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isSubmitting: isPending,
  };
}