import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Nivel } from "../interface/interface";
import { crearParametroAPI } from "../service/service";
import { Modal } from "../../../components/ui/Modal";

// ----- Zod Schema -----
const limpiarEspacios = (val: string) => val.trim().replace(/\s+/g, "");

const esquemaNotas = z.object({
  notaMinima: z
    .string()
    .refine((val) => limpiarEspacios(val) !== "", {
      message: "El campo Nota mínima es obligatorio.",
    })
    .refine((val) => /^(\d+([.,]\d+)?)$/.test(limpiarEspacios(val)), {
      message: "Solo se permiten números y coma en Nota mínima.",
    }),
  notaMaxima: z
    .string()
    .refine((val) => limpiarEspacios(val) !== "", {
      message: "El campo Nota máxima es obligatorio.",
    })
    .refine((val) => /^(\d+([.,]\d+)?)$/.test(limpiarEspacios(val)), {
      message: "Solo se permiten números y coma en Nota máxima.",
    }),
  cantidadMaxCompetidores: z
    .string()
    .refine((val) => limpiarEspacios(val) !== "", {
      message: "El campo Cantidad máxima de competidores es obligatorio.",
    })
    .refine((val) => /^[0-9]+$/.test(limpiarEspacios(val)), {
      message:
        "Solo se permiten números enteros en Cantidad máxima de competidores.",
    }),
});

// ----- Tipo inferido -----
type FormValues = z.infer<typeof esquemaNotas>;

// ----- Componente -----
interface FormularioProps {
  nivel: Nivel;
  idArea: number;
  onCerrar: () => void;
  onMarcarEnviado: (idNivel: number) => void;
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
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(esquemaNotas),
    mode: "onChange", // Validación en tiempo real
  });

  const onSubmit = async (data: FormValues) => {
    const payload = {
      Nota_minima_clasificacion: parseFloat(data.notaMinima.replace(",", ".")),
      Nota_maxima_clasificacion: parseFloat(data.notaMaxima.replace(",", ".")),
      cantidad_maxima_de_clasificados: parseInt(
        data.cantidadMaxCompetidores,
        10
      ),
      id_area: idArea,
      niveles: [nivel.id],
    };

    try {
      setLoading(true);
      await crearParametroAPI(payload);
      setModalExito(true);

      setTimeout(() => {
        setModalExito(false);
        onMarcarEnviado(nivel.id);
        onCerrar();
      }, 3000);
    } catch (error) {
      console.error("Error al enviar parámetro:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-opacity-50 z-50 flex justify-center items-center p-4">
        <div className="bg-white w-full max-w-lg rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Agregar parámetro de calificación para: {nivel.nombre}
          </h2>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            {/* Nota mínima */}
            <div>
              <label className="block mb-1 font-medium text-black">
                Nota mínima
              </label>
              <input
                {...register("notaMinima")}
                onKeyDown={(e) => {
                  if (
                    !/[0-9.,]/.test(e.key) &&
                    e.key !== "Backspace" &&
                    e.key !== "ArrowLeft" &&
                    e.key !== "ArrowRight" &&
                    e.key !== "Tab"
                  ) {
                    e.preventDefault();
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.notaMinima ? "border-red-500" : ""
                }`}
              />
              {errors.notaMinima && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.notaMinima.message}
                </p>
              )}
            </div>

            {/* Nota máxima */}
            <div>
              <label className="block mb-1 font-medium text-black">
                Nota máxima
              </label>
              <input
                {...register("notaMaxima")}
                onKeyDown={(e) => {
                  if (
                    !/[0-9.,]/.test(e.key) &&
                    e.key !== "Backspace" &&
                    e.key !== "ArrowLeft" &&
                    e.key !== "ArrowRight" &&
                    e.key !== "Tab"
                  ) {
                    e.preventDefault();
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.notaMaxima ? "border-red-500" : ""
                }`}
              />
              {errors.notaMaxima && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.notaMaxima.message}
                </p>
              )}
            </div>

            {/* Cantidad máxima de competidores */}
            <div>
              <label className="block mb-1 font-medium text-black">
                Cantidad máxima de competidores
              </label>
              <input
                {...register("cantidadMaxCompetidores")}
                onKeyDown={(e) => {
                  if (
                    !/[0-9]/.test(e.key) &&
                    e.key !== "Backspace" &&
                    e.key !== "ArrowLeft" &&
                    e.key !== "ArrowRight" &&
                    e.key !== "Tab"
                  ) {
                    e.preventDefault();
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.cantidadMaxCompetidores ? "border-red-500" : ""
                }`}
              />
              {errors.cantidadMaxCompetidores && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.cantidadMaxCompetidores.message}
                </p>
              )}
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={onCerrar}
                className="px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center"
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
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg ${
                  loading
                    ? "bg-indigo-300"
                    : "bg-principal-500 hover:bg-principal-700"
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
                  className="lucide lucide-save-icon lucide-save "
                >
                  <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
                  <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" />
                  <path d="M7 3v4a1 1 0 0 0 1 1h7" />
                </svg>
                {loading ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal de éxito */}
      <Modal
        isOpen={modalExito}
        onClose={() => setModalExito(false)}
        title="¡Registro Exitoso!"
        type="success"
      >
        La Cantidad máxima de competidores, la Nota Mínima y la Nota Máxima han
        sido registradas correctamente
      </Modal>
    </>
  );
};
