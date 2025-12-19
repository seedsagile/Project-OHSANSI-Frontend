import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { FormularioProps } from '../interface/interface';
import { crearParametroAPI } from '../service/service';
import { Modal } from '../../../components/ui/Modal'; // <-- IMPORTANTE

const limpiarEspacios = (val: string) => val.trim().replace(/\s+/g, '');

const esquemaNotas = z.object({
  notaMinima: z
    .string()
    .refine((val) => limpiarEspacios(val) !== '', {
      message: 'El campo Nota mínima de clasificacion es obligatorio.',
    })
    .refine((val) => /^(\d+(\.\d+)?)$/.test(limpiarEspacios(val)), {
      message: 'Formato invalido',
    })
    .refine((val) => parseFloat(val.replace(',', '.')) <= 100, {
      message: 'La nota mínima no puede ser mayor a 100',
    }),

  cantidadMaxCompetidores: z.string().optional(), // <-- PERMITIMOS VACÍO PORQUE VALIDARÁ EL MODAL
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
  onLimpiarGestionSeleccionada,
}) => {
  const [loading, setLoading] = useState(false);

  // --- ESTADOS PARA EL MODAL ---
  const [showModal, setShowModal] = useState(false);
  const [formValuesTemp, setFormValuesTemp] = useState<FormValues | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    //watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(esquemaNotas),
    mode: 'onChange',
  });

  //const cantidadMaxWatch = watch('cantidadMaxCompetidores');
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

  useEffect(() => {
    if (nivelesSeleccionados.length === 0) {
      reset({
        notaMinima: '',
        cantidadMaxCompetidores: '',
      });
    }
  }, [nivelesSeleccionados, reset]);

  /** ⬇⬇⬇ Manejamos el submit con la condición del modal ⬇⬇⬇ */
  const handleValidate = (data: FormValues) => {
    if (!data.cantidadMaxCompetidores || data.cantidadMaxCompetidores.trim() === '') {
      setFormValuesTemp(data); // Guardamos los valores temporales
      setShowModal(true); // Mostramos modal
      return;
    }
    onSubmit(data, false); // guardar normal
  };

  /** Esta función ahora acepta un parámetro: forceNull */
  const onSubmit = async (data: FormValues, forceNull: boolean) => {
    if (formularioBloqueado) return;

    try {
      setLoading(true);

      const area_niveles = nivelesSeleccionados.flatMap((nivel) =>
        (nivel.areaNiveles ?? []).map((id_area_nivel) => ({
          id_area_nivel,
          nota_min_aprobacion: parseFloat(data.notaMinima.replace(',', '.')),
          cantidad_maxima: forceNull ? null : parseInt(data.cantidadMaxCompetidores!, 10),
        }))
      );

      const payload = { area_niveles };

      await crearParametroAPI(payload);

      nivelesSeleccionados.forEach((n) => onMarcarEnviado(n.id, idArea));

      reset({ notaMinima: '', cantidadMaxCompetidores: '' });
      if (onLimpiarSeleccion) onLimpiarSeleccion();
      if (onSuccess) onSuccess(forceNull ? 'soloNota' : 'notaYCantidad');

      onCerrar();
    } catch (error: any) {
      console.error('Error al enviar parámetro:', error);
      alert(error.response?.data?.message || 'Error al guardar el parámetro');
    } finally {
      setLoading(false);
    }
  };

  /** Confirmar en el modal → enviar null */
  const confirmarGuardado = () => {
    if (formValuesTemp) {
      onSubmit(formValuesTemp, true);
      if (onSuccess) onSuccess('soloNota');
    }
    setShowModal(false);
  };

  /** Cancelar en el modal */
  const cancelarGuardado = () => {
    setShowModal(false);
  };

  const handleLimpiar = () => {
    reset({ notaMinima: '', cantidadMaxCompetidores: '' });
    // 🚀 Limpia el checkbox seleccionado en TablaGestiones
    onLimpiarSeleccion?.();

    // 🚀 Limpia la gestión seleccionada (desmarca checkbox)
    if (onLimpiarGestionSeleccionada) {
      onLimpiarGestionSeleccionada();
    }
  };

  return (
    <>
      {/* -------------------- MODAL -------------------- */}
      <Modal
        isOpen={showModal}
        onClose={cancelarGuardado}
        onConfirm={confirmarGuardado}
        title="¿Guardar sin completar este campo?"
        type="confirmation"
        confirmText="Sí"
        cancelText="No"
      >
        ¿Está seguro de que desea guardar sin completar el campo
        <strong> Cantidad máxima de clasificados</strong>?
      </Modal>

      {/* -------------------- FORMULARIO ORIGINAL -------------------- */}
      <form
        onSubmit={handleSubmit(handleValidate)}
        className="space-y-4 border-2 border-blue-500 p-4 rounded-2xl w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto bg-white shadow-md"
      >
        <h1 className="flex justify-center text-xl sm:text-2xl font-bold text-center">
          Ingresar parámetro de clasificación
        </h1>

        {formularioBloqueado && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-center text-red-600 font-medium text-sm sm:text-base">
              Selecciona un nivel para habilitar el formulario.
            </p>
          </div>
        )}

        <div>
          <label className="block font-semibold text-negro mb-1 text-sm sm:text-base">
            Nota mínima de clasificacion:
          </label>
          <input
            type="text"
            {...register('notaMinima')}
            maxLength={4}
            onInput={(e) => {
              e.currentTarget.value = e.currentTarget.value
                .replace(/[^0-9.]/g, '')
                .replace(/(\..*?)\..*/g, '$1');
            }}
            className="w-full border border-neutro-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-principal-500 text-sm sm:text-base"
            disabled={formularioBloqueado}
          />

          {errors.notaMinima && (
            <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.notaMinima.message}</p>
          )}
        </div>

        <div>
          <label className="block font-semibold text-negro mb-1 text-sm sm:text-base">
            Cantidad máxima de clasificados:
          </label>
          <input
            type="text"
            {...register('cantidadMaxCompetidores')}
            maxLength={4}
            onInput={(e) => {
              e.currentTarget.value = e.currentTarget.value
                .replace(/[^0-9]/g, '')
                .replace(/(\..*?)\..*/g, '$1');
            }}
            className="w-full border border-neutro-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-principal-500 text-sm sm:text-base"
            disabled={formularioBloqueado}
          />
          {errors.cantidadMaxCompetidores && (
            <p className="text-red-500 text-xs sm:text-sm mt-1">
              {errors.cantidadMaxCompetidores.message}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center sm:justify-around">
          <button
            type="button"
            onClick={handleLimpiar}
            disabled={formularioBloqueado || loading}
            className={`flex items-center justify-center py-2 px-6 sm:px-8 rounded-md text-white font-semibold transition text-sm sm:text-base ${
              formularioBloqueado || loading
                ? 'bg-blue-400 cursor-not-allowed caret-acento-500'
                : 'bg-gray-400 hover:bg-gray-300'
            }`}
          >
            Limpiar
          </button>

          <button
            type="submit"
            disabled={formularioBloqueado || loading}
            className={`flex items-center justify-center py-2 px-6 sm:px-8 rounded-md text-white font-semibold transition text-sm sm:text-base ${
              formularioBloqueado || loading
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-principal-500 hover:bg-principal-600'
            }`}
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </>
  );
};
