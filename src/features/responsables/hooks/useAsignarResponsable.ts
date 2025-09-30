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
import { NOMBRE_MIN_LENGTH, NOMBRE_MAX_LENGTH, CARACTERES_ACETADOS_NOMBRE_COMPLETO, CI_MIN_LENGTH, CI_MAX_LENGTH, CARACTERES_ACETADOS_CI, CODIGO_MIN_LENGTH, CODIGO_MAX_LENGTH, CARACTERES_ACETADOS_CODIGO, DEFECTO_FECHA_NAC } from '../utils/resposableVarGlobalesUtils';

type ApiErrorResponse = {
  error: string;
};

const schemaResponsable = z.object({
  nombreCompleto: z.string()
    .transform(val => val.trim().replace(/\s+/g, ' '))
    .pipe(z.string()
      .min(1, 'El campo Nombre Completo es obligatorio.')
      .min(NOMBRE_MIN_LENGTH, `El nombre debe tener al menos ${NOMBRE_MIN_LENGTH} caracteres.`)
      .max(NOMBRE_MAX_LENGTH, `El nombre no puede tener más de ${NOMBRE_MAX_LENGTH} caracteres.`)
      .regex(CARACTERES_ACETADOS_NOMBRE_COMPLETO, 'El campo Nombre solo permite letras, espacios y acentos.')
    ),

  email: z.string()
    .transform(val => val.trim().replace(/\s+/g, ' '))
    .pipe(z.string()
      .min(1, 'El campo Email es obligatorio.')
      .email('El campo Email debe tener un formato válido (ej. usuario@dominio.com).')
  ),
  ci: z.string()
    .transform(val => val.trim().replace(/\s+/g, ' '))
    .pipe(z.string()
      .min(1, 'El campo CI es obligatorio.')
      .min(CI_MIN_LENGTH, `El CI debe tener al menos ${CI_MIN_LENGTH} caracteres.`)
      .max(CI_MAX_LENGTH, `El campo CI tiene un límite máximo de ${CI_MAX_LENGTH} caracteres.`)
      .regex(CARACTERES_ACETADOS_CI, 'El CI solo permite letras, números, espacios y guiones.')
    ),

  codigo_encargado: z.string()
    .transform(val => val.trim().replace(/\s+/g, ' '))
    .pipe(z.string()
      .min(1, 'El campo Código de acceso es obligatorio.')
      .min(CODIGO_MIN_LENGTH, `El código debe tener al menos ${CODIGO_MIN_LENGTH} caracteres.`)
      .max(CODIGO_MAX_LENGTH, `El campo Código de acceso tiene un límite máximo de ${CODIGO_MAX_LENGTH} caracteres.`)
      .regex(CARACTERES_ACETADOS_CODIGO, 'El código solo permite letras y números.')
    ),
});

export function useAsignarResponsable({ mostrarModal }: { mostrarModal: (tipo: 'success' | 'error', titulo: string, mensaje: string) => void }) {
  const navigate = useNavigate();
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
      mostrarModal('success', '¡Registro Exitoso!', 'El nuevo responsable ha sido registrado correctamente.');
      reset();
      navigate('/dashboard');
    },

    onError: (error: AxiosError<ApiErrorResponse>) => {
      const errorMessage = error.response?.data?.error || "Ocurrió un error inesperado. Por favor, inténtalo de nuevo.";
      mostrarModal('error', '¡Ups! Algo Salió Mal', errorMessage);
      
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

  const handleCancel = () => {
    reset();
    navigate('/dashboard');
  };

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isSubmitting: isPending,
    handleCancel,
    setValue,
  };
}