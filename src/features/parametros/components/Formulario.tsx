import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { FormularioProps } from '../interface/interface';
import { crearParametroAPI } from '../service/service';

const limpiarEspacios = (val: string) => val.trim().replace(/\s+/g, '');

const esquemaNotas = z.object({
  notaMinima: z
    .string()
    .refine((val) => limpiarEspacios(val) !== '', {
      message: 'El campo Nota mínima de clasificacion es obligatorio.',
    })
    .refine((val) => /^(\d+(\.\d+)?)$/.test(limpiarEspacios(val)), {
      message: 'Solo se permiten números y punto en Nota mínima.',
    }),

  cantidadMaxCompetidores: z
    .string()
    .refine((val) => limpiarEspacios(val) !== '', {
      message: 'El campo Cantidad máxima de clasificados es obligatorio.',
    })
    .refine((val) => /^[0-9]+$/.test(limpiarEspacios(val)), {
      message: 'Solo se permiten números enteros en Cantidad máxima de competidores.',
    }),
});

type FormValues = z.infer<typeof esquemaNotas>;

export const Formulario: React.FC<FormularioProps> = ({
  nivelesSeleccionados,
  idArea,
  onCerrar,
  onMarcarEnviado,
  valoresCopiados,
  valoresCopiadosManualmente,
  onLimpiarSeleccion,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(esquemaNotas),
    mode: 'onChange',
  });

  const formularioBloqueado = nivelesSeleccionados.length === 0;

  useEffect(() => {
    if (valoresCopiadosManualmente && valoresCopiados && !formularioBloqueado) {
      reset({
        notaMinima: valoresCopiados.notaMinima?.toString() || '',
        cantidadMaxCompetidores: valoresCopiados.cantidadMaxima?.toString() || '',
      });
    } else if (!valoresCopiadosManualmente && !formularioBloqueado) {
      reset({
        notaMinima: '',
        cantidadMaxCompetidores: '',
      });
    }
  }, [valoresCopiados, valoresCopiadosManualmente, formularioBloqueado, reset]);

  const onSubmit = async (data: FormValues) => {
    if (formularioBloqueado) return;

    try {
      setLoading(true);

      const area_niveles = nivelesSeleccionados.flatMap((nivel) =>
        (nivel.areaNiveles ?? []).map((id_area_nivel) => ({
          id_area_nivel,
          nota_min_clasif: parseFloat(data.notaMinima.replace(',', '.')),
          cantidad_max_apro: parseInt(data.cantidadMaxCompetidores, 10),
        }))
      );

      const payload = { area_niveles };

      await crearParametroAPI(payload);

      // Marcar todos los niveles enviados
      nivelesSeleccionados.forEach((n) => onMarcarEnviado(n.nombre, idArea));

      reset({ notaMinima: '', cantidadMaxCompetidores: '' });
      if (onLimpiarSeleccion) onLimpiarSeleccion();
      if (onSuccess) onSuccess();
      onCerrar();
    } catch (error: any) {
      console.error('Error al enviar parámetro:', error);
      alert(error.response?.data?.message || 'Error al guardar el parámetro');
    } finally {
      setLoading(false);
    }
  };

  // 👉 Nueva función para limpiar los campos
  const handleLimpiar = () => {
    reset({ notaMinima: '', cantidadMaxCompetidores: '' });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 border-2 border-blue-500 p-4 rounded-2xl"
    >
      <h1 className="flex justify-center text-2xl font-bold">
        Ingresar parametro de clasificación
      </h1>

      {formularioBloqueado && (
        <p className="text-center text-red-500 font-medium">
          Selecciona un nivel para habilitar el formulario.
        </p>
      )}

      <div>
        <label className="block font-semibold text-negro mb-1">Nota mínima de clasificados</label>
        <input
          type="text"
          {...register('notaMinima')}
          className="w-full border border-neutro-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-principal-500"
          disabled={formularioBloqueado}
        />
        {errors.notaMinima && (
          <p className="text-red-500 text-sm mt-1">{errors.notaMinima.message}</p>
        )}
      </div>

      <div>
        <label className="block font-semibold text-negro mb-1">
          Cantidad máxima de clasificados:
        </label>
        <input
          type="text"
          {...register('cantidadMaxCompetidores')}
          className="w-full border border-neutro-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-principal-500"
          disabled={formularioBloqueado}
        />
        {errors.cantidadMaxCompetidores && (
          <p className="text-red-500 text-sm mt-1">{errors.cantidadMaxCompetidores.message}</p>
        )}
      </div>

      <div className="flex gap-3 justify-center">
        {/* Botón de limpiar */}

        <button
          type="button"
          onClick={handleLimpiar}
          disabled={formularioBloqueado || loading}
          className={`flex py-2 px-8 rounded-md text-white font-semibold transition ${
            formularioBloqueado || loading
              ? 'bg-neutro-400 cursor-not-allowed'
              : 'bg-gray-400 hover:bg-gray-300'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            className="lucide lucide-x-icon lucide-x"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
          Limpiar
        </button>
        <button
          type="submit"
          disabled={formularioBloqueado || loading}
          className={`flex py-2 px-8 rounded-md text-white font-semibold transition ${
            formularioBloqueado || loading
              ? 'bg-neutro-400 cursor-not-allowed'
              : 'bg-principal-500 hover:bg-principal-600'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            className="lucide lucide-save-icon lucide-save"
          >
            <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
            <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" />
            <path d="M7 3v4a1 1 0 0 0 1 1h7" />
          </svg>
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
};
