import React, { useState } from "react";
import { crearParametroAPI } from "../service/service";
import type { ParametroClasificacion } from "../interface/interface";
import { z, ZodError } from "zod";
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

export const FormularioParametro = () => {
  const [formData, setFormData] = useState({
    nota_minima_clasificacion: "",
    cantidad_maxima_de_clasificados: "",
  });

  const [errores, setErrores] = useState<{
    nota_minima_clasificacion?: string;
    cantidad_maxima_de_clasificados?: string;
  }>({});

  const [mensaje, setMensaje] = useState<string | null>(null);

  // Zod schema con longitud máxima
  const schema = z.object({
    nota_minima_clasificacion: z
      .string()
      .refine((val) => NOTA_MIN_REGEX_NUMERIC.test(val), {
        message: MENSAJE_NOTA_MIN_CARACTERES_ESPECIALES,
      })
      .refine((val) => val.replace(".", "").length >= NOTA_MIN_MIN_LENGTH, {
        message: MENSAJE_NOTA_MIN_CORTA,
      })
      .refine(
        (val) => val.replace(".", "").length <= NOTA_MIN_MAX_LENGTH, // máximo 3 caracteres
        {
          message: `El campo Nota Mínima permite un máximo de ${NOTA_MIN_MAX_LENGTH} caracteres numéricos`,
        }
      ),
    cantidad_maxima_de_clasificados: z
      .string()
      .refine((val) => CANT_COMPET_MAX_REGEX_NUMERIC.test(val), {
        message: MENSAJE_CANT_COMPET_CARACTERES_ESPECIALES,
      })
      .refine((val) => val.length >= CANT_COMPET_MAX_MIN_LENGTH, {
        message: MENSAJE_CANT_COMPET_CORTA,
      })
      .refine(
        (val) => val.length <= CANT_COMPET_MAX_MAX_LENGTH, // máximo 4 caracteres
        {
          message: `El campo Cantidad máxima de competidores permite un máximo de ${CANT_COMPET_MAX_MAX_LENGTH} caracteres`,
        }
      ),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const key =
      id === "nota-minima"
        ? "nota_minima_clasificacion"
        : "cantidad_maxima_de_clasificados";

    // Permitir solo números y punto decimal en nota mínima, solo números en cantidad
    const regex =
      key === "nota_minima_clasificacion" ? /^[0-9]*\.?[0-9]*$/ : /^[0-9]*$/;
    if (!regex.test(value)) return;

    // Limitar la longitud máxima en el input para evitar escribir más caracteres
    const maxLength =
      key === "nota_minima_clasificacion"
        ? NOTA_MIN_MAX_LENGTH
        : CANT_COMPET_MAX_MAX_LENGTH;
    if (value.replace(".", "").length > maxLength) return;

    setFormData((prev) => ({ ...prev, [key]: value }));

    // Validación en tiempo real
    try {
      schema.pick({ [key]: true }).parse({ [key]: value });
      setErrores((prev) => ({ ...prev, [key]: "" }));
    } catch (err) {
      if (err instanceof ZodError) {
        const fieldError = err.errors.find((e) => e.path[0] === key);
        setErrores((prev) => ({ ...prev, [key]: fieldError?.message }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      schema.parse(formData);

      const payload: ParametroClasificacion = {
        nota_minima_clasificacion: Number(formData.nota_minima_clasificacion),
        cantidad_maxima_de_clasificados: Number(
          formData.cantidad_maxima_de_clasificados
        ),
      };

      await crearParametroAPI(payload);

      setMensaje(
        `✅ Registro exitoso - Nota: ${formData.nota_minima_clasificacion}, Cantidad máxima: ${formData.cantidad_maxima_de_clasificados}`
      );

      setFormData({
        nota_minima_clasificacion: "",
        cantidad_maxima_de_clasificados: "",
      });
      setErrores({});
      setTimeout(() => setMensaje(null), 3000);
    } catch (err) {
      if (err instanceof ZodError) {
        const nuevosErrores: any = {};
        err.errors.forEach((e) => {
          nuevosErrores[e.path[0]] = e.message;
        });
        setErrores(nuevosErrores);
      } else {
        console.error(err);
        setMensaje("❌ Error al guardar los datos");
        setTimeout(() => setMensaje(null), 3000);
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      nota_minima_clasificacion: "",
      cantidad_maxima_de_clasificados: "",
    });
    setErrores({});
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

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="nota-minima"
              className="text-lg font-semibold text-negro"
            >
              Nota mínima
            </label>
            <input
              id="nota-minima"
              value={formData.nota_minima_clasificacion}
              onChange={handleChange}
              placeholder="51"
              className="w-full border border-neutro-300 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-principal-400 transition-all"
            />
            {errores.nota_minima_clasificacion && (
              <span className="text-rojo-500 text-sm">
                {errores.nota_minima_clasificacion}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="max-competidores"
              className="text-lg font-semibold text-negro"
            >
              Cantidad máxima de competidores
            </label>
            <input
              id="max-competidores"
              value={formData.cantidad_maxima_de_clasificados}
              onChange={handleChange}
              placeholder="100"
              className="w-full border border-neutro-300 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-principal-400 transition-all"
            />
            {errores.cantidad_maxima_de_clasificados && (
              <span className="text-rojo-500 text-sm">
                {errores.cantidad_maxima_de_clasificados}
              </span>
            )}
          </div>

          <footer className="flex justify-end items-center gap-6 mt-14">
            <button
              type="button"
              className="flex items-center gap-2 font-medium py-2.5 px-6 rounded-lg bg-neutro-200 text-neutro-700 hover:bg-neutro-300 hover:shadow transition-all"
              onClick={handleCancel}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 w-48 font-semibold py-2.5 px-6 rounded-lg bg-principal-500 text-blanco hover:bg-principal-600 hover:shadow transition-all disabled:bg-principal-300 disabled:cursor-not-allowed"
            >
              Guardar
            </button>
          </footer>
        </form>
      </main>
    </div>
  );
};
