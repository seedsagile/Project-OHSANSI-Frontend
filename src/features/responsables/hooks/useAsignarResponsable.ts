import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import type { FormularioData, PayloadResponsable } from '../IndexResponsable';
import { asignarResponsableAPI } from '../services/ApiResposableArea';

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
    .min(2, 'El campo Nombre requiere un mínimo de 2 caracteres.')
    .max(40, 'El campo Nombre tiene un límite máximo de 40 caracteres.')
    .regex(/^[a-zA-Z\s\u00C0-\u017F]+$/, 'El campo Nombre solo permite letras, espacios y acentos.'),

  email: z.string()
    .min(1, 'El campo Email es obligatorio.')
    .email('El campo Email debe tener un formato válido (ej. usuario@dominio.com).'),

  ci: z.string()
    .min(4, 'El campo CI requiere un mínimo de 4 caracteres.')
    .max(15, 'El campo CI tiene un límite máximo de 15 caracteres.')
    .regex(/^[a-zA-Z0-9\s-]+$/, 'El campo CI solo permite letras, números, espacios y guiones.'),

  codigo_encargado: z.string()
    .min(4, 'El código de acceso debe tener al menos 4 caracteres.')
    .max(10, 'El campo Código de acceso tiene un límite máximo de 10 caracteres.'),
});

export function useAsignarResponsable() {
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
      toast.success('Responsable registrado con éxito.');
      reset();
    },
    onError: (error) => {
      toast.error(`Error del servidor: ${error.message}`);
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
        fecha_nac: '1990-01-01',
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