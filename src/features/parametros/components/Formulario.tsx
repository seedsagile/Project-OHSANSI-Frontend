import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Nivel } from '../interface/interface';
import apiClient from '../../../api/ApiPhp';
import { Modal } from '../../../components/ui/Modal';

const limpiarEspacios = (val: string) => val.trim().replace(/\s+/g, '');

const esquemaNotas = z.object({
  notaMinima: z
    .string()
    .refine((val) => limpiarEspacios(val) !== '', {
      message: 'El campo Nota mínima es obligatorio.',
    })
    .refine((val) => /^(\d+(,\d+)?)$/.test(limpiarEspacios(val)), {
      message: 'Solo se permiten números y coma en Nota mínima.',
    }),
  notaMaxima: z
    .string()
    .refine((val) => limpiarEspacios(val) !== '', {
      message: 'El campo Nota máxima es obligatorio.',
    })
    .refine((val) => /^(\d+(,\d+)?)$/.test(limpiarEspacios(val)), {
      message: 'Solo se permiten números y coma en Nota máxima.',
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
}

export const Formulario: React.FC<FormularioProps> = ({
  nivel,
  idArea,
  onCerrar,
  onMarcarEnviado,
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

  const onSubmit = async (data: FormValues) => {
    if (formularioBloqueado) return;

    try {
      setLoading(true);

      // 1️⃣ Obtener el id_area_nivel correspondiente al área y nivel seleccionado
      const response = await apiClient.get(`/area-niveles/${idArea}`);
      const areaNiveles = response.data.data;

      const areaNivelSeleccionado = areaNiveles.find((an: any) => an.nivel.id_nivel === nivel!.id);

      if (!areaNivelSeleccionado) {
        alert('No se encontró el área-nivel seleccionado.');
        setLoading(false);
        return;
      }

      // 2️⃣ Crear payload con el formato que espera el backend
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

      // 3️⃣ Enviar POST al endpoint correcto
      await apiClient.post('/parametros', payload);

      reset();

      // 4️⃣ Mostrar modal de éxito y cerrar formulario
      setModalExito(true);
      setTimeout(() => {
        setModalExito(false);
        onMarcarEnviado(nivel!.id, idArea);
        onCerrar();
      }, 3000);
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
            Cantidad máxima de competidores
          </label>
          <input
            {...register('cantidadMaxCompetidores')}
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
            onClick={onCerrar}
            disabled={formularioBloqueado}
            className={`px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center ${
              formularioBloqueado ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            Cancelar
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
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>

      {modalExito && (
        <p className="text-green-600 text-center mt-4 font-semibold">¡Registro exitoso!</p>
      )}
    </div>
  );
};
