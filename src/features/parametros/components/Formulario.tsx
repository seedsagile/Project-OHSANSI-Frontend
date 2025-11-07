import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Nivel, FormularioProps } from '../interface/interface';
import { crearParametroAPI } from '../service/service';

const limpiarEspacios = (val: string) => val.trim().replace(/\s+/g, '');

const esquemaNotas = z.object({
  notaMinima: z
    .string()
    .refine((val) => limpiarEspacios(val) !== '', {
      message: 'El campo Nota mínima es obligatorio.',
    })
    .refine((val) => /^(\d+(\.\d+)?)$/.test(limpiarEspacios(val)), {
      message: 'Solo se permiten números y punto en Nota mínima.',
    }),

  cantidadMaxCompetidores: z
    .string()
    .refine((val) => limpiarEspacios(val) !== '', {
      message: 'El campo Cantidad máxima de competidores es obligatorio.',
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

      const area_niveles = nivelesSeleccionados.map((nivel) => ({
        id_area_nivel: nivel.id,
        nota_min_clasif: parseFloat(data.notaMinima.replace(',', '.')),
        cantidad_max_apro: parseInt(data.cantidadMaxCompetidores, 10),
      }));

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

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 border-2 border-blue-500 p-4 rounded-2xl"
    >
      <h1 className="flex justify-center text-2xl font-bold">
        Ingresar parametro de clasificación
      </h1>
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

      <button
        type="submit"
        disabled={formularioBloqueado || loading}
        className={`w-full py-2 px-4 rounded-md text-white font-semibold transition ${
          formularioBloqueado || loading
            ? 'bg-neutro-400 cursor-not-allowed'
            : 'bg-principal-500 hover:bg-principal-600'
        }`}
      >
        {loading ? 'Guardando...' : 'Guardar parámetros'}
      </button>
    </form>
  );
};
