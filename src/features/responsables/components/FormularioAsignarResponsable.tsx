import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AxiosError } from "axios";
import { areasService } from "../../areas/services/areasService";
import { asignarResponsableAPI } from "../services/ApiResposableArea";

import type { Area } from "../../areas/types";
import type { AreaInterface } from "../interface/AreaInterface";
import { ResponsableAreaSchema } from "../utils/AreaValidaciones";
import { type ResponsableForm } from "../utils/AreaValidaciones";
import { Link } from "react-router-dom";

import { Modal, type ModalType } from "../../../components/ui/Modal";

export const FormularioAsignarResponsable = () => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);

  const [mensaje, setMensaje] = useState<string | null>(null);

  const [passwordGenerated, setPasswordGenerated] = useState(false);
  const [selectedAreas, setSelectedAreas] = useState<number[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType>("success"); // success | error
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    reset,
    formState: { errors },
  } = useForm<ResponsableForm>({
    resolver: zodResolver(ResponsableAreaSchema),
    mode: "onChange", // validaciones en tiempo real
    defaultValues: {
      areas: [],
    },
  });

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const data = await areasService.obtenerAreas();
        setAreas(data);
      } catch (error) {
        console.error("Error cargando áreas:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAreas();
  }, []);

  const generatePassword = (length = 8) => {
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const special = "@$!%*?&.";
    const all = lower + upper + numbers + special;

    const randChar = (set: string) =>
      set.charAt(Math.floor(Math.random() * set.length));

    let pwd = "";
    pwd += randChar(lower);
    pwd += randChar(upper);
    pwd += randChar(numbers);
    pwd += randChar(special);

    for (let i = 4; i < length; i++) {
      pwd += randChar(all);
    }

    return pwd
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");
  };

  const handleGenerarClick = () => {
    if (passwordGenerated) return;
    const pwd = generatePassword(10);
    // setGeneratedPassword(pwd);
    setPasswordGenerated(true);
    setValue("contrasena", pwd);
    trigger("contrasena");
  };

  // Toggle de áreas
  const handleAreaToggle = (id: number) => {
    const updated = selectedAreas.includes(id)
      ? selectedAreas.filter((a) => a !== id)
      : [...selectedAreas, id];
    setSelectedAreas(updated);
    setValue("areas", updated);
    trigger("areas");
  };

  // Limpiar formulario
  const limpiarFormulario = () => {
    reset();
    // setGeneratedPassword("");
    setPasswordGenerated(false);
    setSelectedAreas([]);
    setMensaje(null);
  };

  const onSubmit = async (data: ResponsableForm) => {
    const payload: AreaInterface = {
      nombre: data.nombre,
      apellido: data.apellido,
      email: data.correo,
      ci: data.carnet,
      password: data.contrasena,
      areas: data.areas,
    };

    try {
      const response = await asignarResponsableAPI(payload);
      console.log("Responsable creado:", response);

      limpiarFormulario();
      // Abrir modal de éxito
      setModalType("success");
      setModalTitle("Registro Exitoso");
      setModalMessage("El responsable de área fue registrado correctamente.");
      setModalOpen(true);
    } catch (error: unknown) {
      const err = error as AxiosError<{ message?: string }>;

      if (err.response?.status === 409) {
        const backendMessage =
          err.response.data?.message ||
          "¡Ups! Algo salió mal - Ya existe un responsable de área registrado con este correo electrónico.";

        setMensaje(backendMessage);
      } else {
        setMensaje(
          "¡Ups! Algo salió mal - Ya existe un responsable de área registrado con este correo electrónico."
        );
        console.error("Error al guardar responsable:", error);
      }
    }
  };

  const handleCancelar = () => {
    limpiarFormulario();
  };

  return (
    <div className="bg-neutro-100 min-h-screen flex items-center justify-center p-4 font-display">
      <main className="bg-blanco w-full max-w-4xl rounded-xl shadow-sombra-3 p-8">
        <header className="flex justify-center items-center mb-10">
          <h1 className="text-4xl font-extrabold text-negro tracking-tighter text-center">
            Registrar Responsable de Area
          </h1>
        </header>

        {/* Mensaje */}
        {mensaje && (
          <div
            className={`mb-6 text-center font-semibold ${
              mensaje.includes("¡Registro Exitoso!")
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {mensaje}
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-8"
          noValidate
        >
          <div className="flex gap-8">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-negro">
                Nombre del responsable de área
              </label>
              <input
                type="text"
                placeholder="Ej: Pepito"
                maxLength={20}
                {...register("nombre")}
                onBlur={() => trigger("nombre")}
                className="w-[400px] border rounded-md p-2 border-neutro-400 focus:outline-none focus:ring-2 focus:ring-principal-400"
              />
              {errors.nombre && (
                <span className="text-red-500 text-sm">
                  {errors.nombre.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-negro">
                Apellido del responsable de área
              </label>
              <input
                type="text"
                placeholder="Ej: Perez"
                maxLength={20}
                {...register("apellido")}
                onBlur={() => trigger("apellido")}
                className="w-[400px] border rounded-md p-2 border-neutro-400 focus:outline-none focus:ring-2 focus:ring-principal-400"
              />
              {errors.apellido && (
                <span className="text-red-500 text-sm">
                  {errors.apellido.message}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-8">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-negro">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  placeholder="ejemplo@ejemplo.com"
                  {...register("correo")}
                  onBlur={() => trigger("correo")}
                  className="w-[400px] border rounded-md p-2 border-neutro-400 focus:outline-none focus:ring-2 focus:ring-principal-400"
                />
                {errors.correo && (
                  <span className="text-red-500 text-sm">
                    {errors.correo.message}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-negro">
                  Carnet de identidad
                </label>
                <input
                  type="text"
                  placeholder="Ej: 1234567 o 1234567-18"
                  maxLength={15}
                  {...register("carnet")}
                  onBlur={() => trigger("carnet")}
                  className="w-[400px] border rounded-md p-2 border-neutro-400 focus:outline-none focus:ring-2 focus:ring-principal-400"
                />
                {errors.carnet && (
                  <span className="text-red-500 text-sm">
                    {errors.carnet.message}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-negro">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={handleGenerarClick}
                  disabled={passwordGenerated}
                  className={`w-[400px] border rounded-md p-2 border-neutro-400 transition-colors ${
                    passwordGenerated
                      ? "bg-neutro-300 text-black cursor-not-allowed"
                      : "bg-[#0076FF] text-white hover:bg-principal-600"
                  }`}
                >
                  {passwordGenerated
                    ? "Contraseña generada"
                    : "Generar contraseña"}
                </button>
                {errors.contrasena && (
                  <span className="text-red-500 text-sm">
                    {errors.contrasena.message}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-negro">Area</label>
              <div className="w-[400px] border rounded-md p-2 border-neutro-400 bg-[#0076FF] text-white transition-colors text-center">
                Asignar Area
              </div>
              <div className="w-[400px] border rounded-md p-2 border-neutro-400 bg-neutro-50 max-h-[137px] overflow-y-auto text-sm">
                {loading ? (
                  <p className="text-neutro-500 italic">Cargando áreas...</p>
                ) : areas.length > 0 ? (
                  <ul className="space-y-1">
                    {areas.map((area, index) => (
                      <li
                        key={area.id_area}
                        className={`flex justify-between items-center rounded-md px-2 py-1 transition-colors cursor-pointer ${
                          index % 2 === 0 ? "bg-[#E5E7EB]" : "bg-[#F3F4F6]"
                        } hover:bg-neutro-200`}
                        onClick={() => handleAreaToggle(area.id_area)}
                      >
                        <span>{area.nombre}</span>
                        <input
                          type="checkbox"
                          className="ml-2"
                          checked={selectedAreas.includes(area.id_area)}
                          readOnly
                        />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-neutro-500 italic">
                    No hay áreas registradas
                  </p>
                )}
              </div>
              {errors.areas && (
                <span className="text-red-500 text-sm">
                  {errors.areas.message}
                </span>
              )}
            </div>
          </div>

          <footer className="flex justify-end items-center gap-4 mt-12">
            <Link
              type="button"
              onClick={handleCancelar}
              className="flex items-center gap-2 font-semibold py-2.5 px-6 rounded-lg bg-neutro-200 text-neutro-700 hover:bg-neutro-300 transition-colors"
              to="/dashboard"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 w-48 font-semibold py-2.5 px-6 rounded-lg bg-[#0076FF] text-blanco hover:bg-principal-600 transition-colors"
            >
              Guardar
            </button>
          </footer>
        </form>
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          type={modalType}
          title={modalTitle}
        >
          {modalMessage}
        </Modal>
      </main>
    </div>
  );
};
