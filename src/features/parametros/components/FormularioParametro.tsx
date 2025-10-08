import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { crearParametroAPI } from "../service/service";
import {
  NOTA_MIN_MIN_LENGTH,
  NOTA_MIN_MAX_LENGTH,
  NOTA_MIN_REGEX_NUMERIC,
  MENSAJE_NOTA_MIN_CORTA,
  MENSAJE_NOTA_MIN_CARACTERES_ESPECIALES,
  CANT_COMPET_MAX_MIN_LENGTH,
  CANT_COMPET_MAX_MAX_LENGTH,
  CANT_COMPET_MAX_REGEX_NUMERIC,
  MENSAJE_CANT_COMPET_CORTA,
  MENSAJE_CANT_COMPET_CARACTERES_ESPECIALES,
} from "../util/validaciones";

// Schema Zod
const ParametroSchema = z.object({
  nota_minima_clasificacion: z
    .string()
    .refine((val) => NOTA_MIN_REGEX_NUMERIC.test(val), {
      message: MENSAJE_NOTA_MIN_CARACTERES_ESPECIALES,
    })
    .refine((val) => val.replace(".", "").length >= NOTA_MIN_MIN_LENGTH, {
      message: MENSAJE_NOTA_MIN_CORTA,
    })
    .refine((val) => val.replace(".", "").length <= NOTA_MIN_MAX_LENGTH, {
      message: `El campo Nota Mínima permite un máximo de ${NOTA_MIN_MAX_LENGTH} caracteres numéricos`,
    }),
  cantidad_maxima_de_clasificados: z
    .string()
    .refine((val) => CANT_COMPET_MAX_REGEX_NUMERIC.test(val), {
      message: MENSAJE_CANT_COMPET_CARACTERES_ESPECIALES,
    })
    .refine((val) => val.length >= CANT_COMPET_MAX_MIN_LENGTH, {
      message: MENSAJE_CANT_COMPET_CORTA,
    })
    .refine((val) => val.length <= CANT_COMPET_MAX_MAX_LENGTH, {
      message: `El campo Cantidad máxima de competidores permite un máximo de ${CANT_COMPET_MAX_MAX_LENGTH} caracteres`,
    }),
});

// Tipo inferido automáticamente
type ParametroForm = z.infer<typeof ParametroSchema>;

export const FormularioParametro = () => {
  const [mensaje, setMensaje] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    trigger,
  } = useForm<ParametroForm>({
    resolver: zodResolver(ParametroSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: ParametroForm) => {
    try {
      const payload = {
        nota_minima_clasificacion: Number(data.nota_minima_clasificacion),
        cantidad_maxima_de_clasificados: Number(
          data.cantidad_maxima_de_clasificados
        ),
      };

      await crearParametroAPI(payload);

      setMensaje(
        `✅ Registro exitoso - Nota: ${data.nota_minima_clasificacion}, Cantidad máxima: ${data.cantidad_maxima_de_clasificados}`
      );

      reset();
      setTimeout(() => setMensaje(null), 3000);
    } catch (err) {
      console.error(err);
      setMensaje("❌ Error al guardar los datos");
      setTimeout(() => setMensaje(null), 3000);
    }
  };

  const handleCancel = () => {
    reset();
  };

  return (
    <div className="bg-neutro-100 min-h-screen flex items-center justify-center p-6 font-display relative">
      <main className="bg-blanco w-full max-w-3xl rounded-2xl shadow-sombra-3 p-10 border border-neutro-200">
        <header className="flex justify-center items-center mb-12">
          <h1 className="text-4xl font-extrabold text-negro tracking-tight text-center">
            Ingrese parámetro de clasificación
          </h1>
        </header>

        {mensaje && (
          <div className="absolute top-6 right-6 bg-principal-500 text-blanco px-4 py-2 rounded-lg shadow-lg animate-fade-in">
            {mensaje}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Nota mínima */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="nota-minima"
              className="text-lg font-semibold text-negro"
            >
              Nota mínima
            </label>
            <input
              id="nota-minima"
              type="text"
              {...register("nota_minima_clasificacion")}
              onBlur={() => trigger("nota_minima_clasificacion")}
              placeholder="51 o 9.5"
              inputMode="decimal"
              maxLength={4}
              onKeyDown={(e) => {
                const allowedKeys = [
                  "Backspace",
                  "ArrowLeft",
                  "ArrowRight",
                  "Delete",
                  "Tab",
                ];
                if (
                  !/[0-9]/.test(e.key) &&
                  e.key !== "." &&
                  !allowedKeys.includes(e.key)
                ) {
                  e.preventDefault();
                }
                if (e.key === "." && e.currentTarget.value.includes(".")) {
                  e.preventDefault();
                }
                const valueWithoutDot = e.currentTarget.value.replace(".", "");
                if (/[0-9]/.test(e.key) && valueWithoutDot.length >= 3) {
                  e.preventDefault();
                }
              }}
              onPaste={(e) => e.preventDefault()}
              className="w-full border border-neutro-300 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-principal-400 transition-all"
            />
            {errors.nota_minima_clasificacion && (
              <span className="text-red-500 text-sm">
                {errors.nota_minima_clasificacion.message}
              </span>
            )}
          </div>

          {/* Cantidad máxima de competidores */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="max-competidores"
              className="text-lg font-semibold text-negro"
            >
              Cantidad máxima de competidores
            </label>
            <input
              id="max-competidores"
              type="text"
              {...register("cantidad_maxima_de_clasificados")}
              onBlur={() => trigger("cantidad_maxima_de_clasificados")}
              placeholder="100"
              inputMode="numeric"
              maxLength={4}
              onKeyDown={(e) => {
                const allowedKeys = [
                  "Backspace",
                  "ArrowLeft",
                  "ArrowRight",
                  "Delete",
                  "Tab",
                ];
                if (!/[0-9]/.test(e.key) && !allowedKeys.includes(e.key)) {
                  e.preventDefault();
                }
                if (/[0-9]/.test(e.key) && e.currentTarget.value.length >= 4) {
                  e.preventDefault();
                }
              }}
              onPaste={(e) => e.preventDefault()}
              className="w-full border border-neutro-300 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-principal-400 transition-all"
            />
            {errors.cantidad_maxima_de_clasificados && (
              <span className="text-red-500 text-sm">
                {errors.cantidad_maxima_de_clasificados.message}
              </span>
            )}
          </div>

          <footer className="flex justify-end items-center gap-6 mt-14">
            <button
              type="button"
              className="flex items-center gap-2 font-medium py-2.5 px-6 rounded-lg bg-neutro-200 text-neutro-700 hover:bg-neutro-300 hover:shadow transition-all"
              onClick={handleCancel}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              <span>Cancelar</span>
            </button>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 w-48 font-semibold py-2.5 px-6 rounded-lg bg-principal-500 text-blanco hover:bg-principal-600 hover:shadow transition-all disabled:bg-principal-300 disabled:cursor-not-allowed"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              <span>Guardar</span>
            </button>
          </footer>
        </form>
      </main>
    </div>
  );
};
