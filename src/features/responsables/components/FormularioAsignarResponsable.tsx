import { useEffect, useState } from "react";
import { areasService } from "../../areas/services/areasService"; // ajusta la ruta según tu estructura
import type { Area } from "../../areas/types/index";
import { asignarResponsableAPI } from "../services/ApiResposableArea"; // tu service
import type { AreaInterface } from "../interface/AreaInterface";

export const FormularioAsignarResponsable = () => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);

  // Mensaje de éxito
  const [mensaje, setMensaje] = useState<string | null>(null);

  // Campos del formulario
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [ci, setCi] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [passwordGenerated, setPasswordGenerated] = useState(false);

  // Áreas seleccionadas (IDs)
  const [selectedAreas, setSelectedAreas] = useState<number[]>([]);

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
    const all = lower + upper + numbers;

    const randChar = (set: string) =>
      set.charAt(Math.floor(Math.random() * set.length));

    let pwd = "";
    pwd += randChar(lower);
    pwd += randChar(upper);
    pwd += randChar(numbers);

    for (let i = 3; i < length; i++) {
      pwd += randChar(all);
    }

    return pwd
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");
  };

  const handleGenerarClick = () => {
    if (passwordGenerated) return;
    const pwd = generatePassword(8);
    setGeneratedPassword(pwd);
    setPasswordGenerated(true);
  };

  const handleAreaToggle = (id: number) => {
    if (selectedAreas.includes(id)) {
      setSelectedAreas(selectedAreas.filter((areaId) => areaId !== id));
    } else {
      setSelectedAreas([...selectedAreas, id]);
    }
  };

  const limpiarFormulario = () => {
    setNombre("");
    setApellido("");
    setEmail("");
    setCi("");
    setGeneratedPassword("");
    setPasswordGenerated(false);
    setSelectedAreas([]);
  };

  const handleGuardar = async () => {
    const payload: AreaInterface = {
      nombre,
      apellido,
      email,
      ci,
      password: generatedPassword,
      areas: selectedAreas,
    };

    try {
      const response = await asignarResponsableAPI(payload);
      console.log("Responsable creado:", response);

      // Limpiar formulario después de guardar
      limpiarFormulario();

      // Mostrar mensaje de éxito
      setMensaje("¡Registro Exitoso!");
      setTimeout(() => setMensaje(null), 3000);
    } catch (error) {
      console.error("Error al guardar responsable:", error);
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

        {/* Mensaje de éxito */}
        {mensaje && (
          <div className="mb-6 text-center text-green-600 font-semibold">
            {mensaje}
          </div>
        )}

        <form
          action=""
          className="space-y-8"
          onSubmit={(e) => e.preventDefault()}
        >
          {/* Nombre y Apellido */}
          <div className="flex gap-8">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-negro">
                Nombre del responsable de area
              </label>
              <input
                type="text"
                placeholder="Ej: Pepito"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-[400px] border rounded-md p-2 border-neutro-400 focus:outline-none focus:ring-2 focus:ring-principal-400"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-negro">
                Apellido del responsable de area
              </label>
              <input
                type="text"
                placeholder="Ej: Perez"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                className="w-[400px] border rounded-md p-2 border-neutro-400 focus:outline-none focus:ring-2 focus:ring-principal-400"
              />
            </div>
          </div>

          {/* Correo, CI y Contraseña */}
          <div className="flex gap-8">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-negro">
                  Correo Electrónico
                </label>
                <input
                  type="text"
                  placeholder="ejemplo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-[400px] border rounded-md p-2 border-neutro-400 focus:outline-none focus:ring-2 focus:ring-principal-400"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-negro">
                  Carnet de identidad
                </label>
                <input
                  type="text"
                  placeholder="Ej: 1234567 o 1234567-18"
                  value={ci}
                  onChange={(e) => setCi(e.target.value)}
                  className="w-[400px] border rounded-md p-2 border-neutro-400 focus:outline-none focus:ring-2 focus:ring-principal-400"
                />
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
              </div>
            </div>

            {/* Selección de Áreas */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-negro">Area</label>
              <div className="w-[400px] border rounded-md p-2 border-neutro-400 bg-neutro-50 max-h-[137px] overflow-y-auto text-sm">
                {loading ? (
                  <p className="text-neutro-500 italic">Cargando areas...</p>
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
                    No hay areas registradas
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer con botones */}
          <footer className="flex justify-end items-center gap-4 mt-12">
            <button
              type="button"
              onClick={handleCancelar}
              className="flex items-center gap-2 font-semibold py-2.5 px-6 rounded-lg bg-neutro-200 text-neutro-700 hover:bg-neutro-300 transition-colors"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleGuardar}
              className="flex items-center justify-center gap-2 w-48 font-semibold py-2.5 px-6 rounded-lg bg-[#0076FF] text-blanco hover:bg-principal-600 transition-colors"
            >
              Guardar
            </button>
          </footer>
        </form>
      </main>
    </div>
  );
};
