import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Nivel } from '../interface/interface';
import apiClient from '../../../api/ApiPhp';

const limpiarEspacios = (val: string) => val.trim().replace(/\s+/g, '');

const esquemaNotas = z.object({
  notaMinima: z
    .string()
    .refine((val) => limpiarEspacios(val) !== '', {
      message: 'El campo Nota mínima es obligatorio.',
    })
    .refine((val) => /^(\d+(.\d+)?)$/.test(limpiarEspacios(val)), {
      message: 'Solo se permiten números y punto en Nota mínima.',
    }),
  notaMaxima: z
    .string()
    .refine((val) => limpiarEspacios(val) !== '', {
      message: 'El campo Nota máxima es obligatorio.',
    })
    .refine((val) => /^(\d+(.\d+)?)$/.test(limpiarEspacios(val)), {
      message: 'Solo se permiten números y punto en Nota máxima.',
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

interface FormularioProps {
  nivel: Nivel | null;
  idArea: number;
  onCerrar: () => void;
  onMarcarEnviado: (idNivel: number, idArea: number) => void;
  valoresCopiados?: {
    notaMinima: number | '';
    notaMaxima: number | '';
    cantidadMaxima: number | '';
  };
  valoresCopiadosManualmente?: boolean;
  onLimpiarSeleccion?: () => void;
  onSuccess?: () => void;
}

export const Formulario: React.FC<FormularioProps> = ({
  nivel,
  idArea,
  onCerrar,
  onMarcarEnviado,
  valoresCopiados,
  valoresCopiadosManualmente,
  onLimpiarSeleccion,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [modalExito, setModalExito] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(esquemaNotas),
    mode: 'onChange',
  });

  const formularioBloqueado = !nivel;

  // Copiar valores solo cuando se selecciona un nivel nuevo
  useEffect(() => {
    if (valoresCopiadosManualmente && valoresCopiados && !formularioBloqueado) {
      reset({
        notaMinima: valoresCopiados.notaMinima?.toString() || '',
        notaMaxima: valoresCopiados.notaMaxima?.toString() || '',
        cantidadMaxCompetidores: valoresCopiados.cantidadMaxima?.toString() || '',
      });
    } else if (!valoresCopiadosManualmente && !formularioBloqueado) {
      reset({
        notaMinima: '',
        notaMaxima: '',
        cantidadMaxCompetidores: '',
      });
    }
  }, [valoresCopiados, valoresCopiadosManualmente, formularioBloqueado, reset]);

  const onSubmit = async (data: FormValues) => {
    if (formularioBloqueado) return;

    try {
      setLoading(true);

      const response = await apiClient.get(`/area-niveles/${idArea}`);
      const areaNiveles = response.data.data;

      const areaNivelSeleccionado = areaNiveles.find((an: any) => an.nivel.id_nivel === nivel!.id);

      if (!areaNivelSeleccionado) {
        alert('No se encontró el área-nivel seleccionado.');
        setLoading(false);
        return;
      }

      const payload = {
        area_niveles: [
          {
            id_area_nivel: areaNivelSeleccionado.id_area_nivel,
            nota_max_clasif: parseFloat(data.notaMaxima.replace(',', '.')),
            nota_min_clasif: parseFloat(data.notaMinima.replace(',', '.')),
            cantidad_max_apro: parseInt(data.cantidadMaxCompetidores, 10),
          },
        ],
      };

      await apiClient.post('/parametros', payload);

      // Limpiar el formulario después de guardar
      reset({
        notaMinima: '',
        notaMaxima: '',
        cantidadMaxCompetidores: '',
      });

      // Limpiar checkbox en tabla si existe callback
      if (onLimpiarSeleccion) onLimpiarSeleccion();

      setModalExito(true);
      if (onSuccess) onSuccess();
      onMarcarEnviado(nivel!.id, idArea);
      onCerrar();
    } catch (error: any) {
      console.error('Error al enviar parámetro:', error);
      alert(error.response?.data?.message || 'Error al guardar el parámetro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full">
      {!nivel && (
        <p className="text-center text-neutro-600 mb-4">
          🔒 Selecciona un nivel para habilitar el formulario.
        </p>
      )}

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="block mb-1 font-medium text-black">Nota mínima</label>
          <input
            {...register('notaMinima')}
            onInput={(e) => {
              // Solo permitir dígitos y una coma opcional
              e.currentTarget.value = e.currentTarget.value
                .replace(/[^0-9.]/g, '') // quita todo excepto números y coma
                .replace(/(..*),/g, '$1'); // permite solo una coma
            }}
            disabled={formularioBloqueado}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              errors.notaMinima ? 'border-red-500' : ''
            } ${formularioBloqueado ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          />
          {errors.notaMinima && (
            <p className="text-red-500 text-sm mt-1">{errors.notaMinima.message}</p>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium text-black">Nota máxima</label>
          <input
            {...register('notaMaxima')}
            onInput={(e) => {
              e.currentTarget.value = e.currentTarget.value
                .replace(/[^0-9.]/g, '')
                .replace(/(..*),/g, '$1');
            }}
            disabled={formularioBloqueado}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              errors.notaMaxima ? 'border-red-500' : ''
            } ${formularioBloqueado ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          />
          {errors.notaMaxima && (
            <p className="text-red-500 text-sm mt-1">{errors.notaMaxima.message}</p>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium text-black">
            Cantidad máxima de clasificados
          </label>
          <input
            {...register('cantidadMaxCompetidores')}
            onInput={(e) => {
              e.currentTarget.value = e.currentTarget.value
                .replace(/[^0-9]/g, '')
                .replace(/(,.*),/g, '$1');
            }}
            disabled={formularioBloqueado}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              errors.cantidadMaxCompetidores ? 'border-red-500' : ''
            } ${formularioBloqueado ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          />
          {errors.cantidadMaxCompetidores && (
            <p className="text-red-500 text-sm mt-1">{errors.cantidadMaxCompetidores.message}</p>
          )}
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={() => {
              reset({
                notaMinima: '',
                notaMaxima: '',
                cantidadMaxCompetidores: '',
              });
              if (onLimpiarSeleccion) onLimpiarSeleccion(); // si quieres limpiar el checkbox también
              // onCerrar();
            }}
            disabled={formularioBloqueado}
            className={`px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center ${
              formularioBloqueado ? 'opacity-60 cursor-not-allowed' : ''
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
            disabled={loading || formularioBloqueado}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg ${
              loading || formularioBloqueado
                ? 'bg-indigo-300 cursor-not-allowed'
                : 'bg-principal-500 hover:bg-principal-700'
            } text-white`}
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

      {/* {modalExito && (
        <p className="text-green-600 text-center mt-4 font-semibold">¡Registro exitoso!</p>
      )} */}
    </div>
  );
};
