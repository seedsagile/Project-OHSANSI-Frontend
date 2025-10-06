import { useEffect, useState } from "react";
import { ModalAsignarNivel } from "./ModalAsignarNivel";
import { 
  evaluadoresService, 
  areasService, 
  nivelesService 
} from "../services/evaluadoresService";
import type { 
  Area, 
  Nivel, 
  AreaConNiveles,
  CreateEvaluadorPayload 
} from "../tipos/IndexEvaluador";

// ==================== COMPONENTE FORMULARIO ====================
export const FormularioRegistrarEvaluador = () => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [niveles, setNiveles] = useState<Nivel[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para los campos del formulario
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [ci, setCi] = useState("");
  const [guardando, setGuardando] = useState(false);

  // Estado para la contraseña generada
  const [generatedPassword, setGeneratedPassword] = useState<string>("");
  const [passwordGenerated, setPasswordGenerated] = useState<boolean>(false);

  // Estado para el modal de niveles
  const [showModalNiveles, setShowModalNiveles] = useState(false);
  const [areaSeleccionada, setAreaSeleccionada] = useState<Area | null>(null);
  const [nivelesPreseleccionados, setNivelesPreseleccionados] = useState<number[]>([]);

  // Estado para áreas y niveles asignados
  const [areasAsignadas, setAreasAsignadas] = useState<AreaConNiveles[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar áreas y niveles desde la API
        const [areasData, nivelesData] = await Promise.all([
          areasService.obtenerAreas(),
          nivelesService.obtenerNiveles(),
        ]);

        setAreas(areasData);
        setNiveles(nivelesData);
      } catch (error) {
        console.error("Error cargando datos:", error);
        alert("Error al cargar áreas y niveles");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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

    pwd = pwd
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");
    return pwd;
  };

  const handleGenerarClick = () => {
    if (passwordGenerated) return;
    const pwd = generatePassword(8);
    setGeneratedPassword(pwd);
    setPasswordGenerated(true);
  };

  const handleSeleccionarArea = (area: Area) => {
    const areaExistente = areasAsignadas.find(
      (a) => a.area.id_area === area.id_area
    );

    if (areaExistente) {
      const nivelesIds = areaExistente.niveles.map((n) => n.id_nivel);
      setNivelesPreseleccionados(nivelesIds);
    } else {
      setNivelesPreseleccionados([]);
    }

    setAreaSeleccionada(area);
    setShowModalNiveles(true);
  };

  const handleCerrarModalNiveles = () => {
    setShowModalNiveles(false);
    setAreaSeleccionada(null);
    setNivelesPreseleccionados([]);
  };

  const handleConfirmarNiveles = (niveles: Nivel[]) => {
    if (!areaSeleccionada) return;

    if (niveles.length === 0) {
      setAreasAsignadas((prev) =>
        prev.filter((a) => a.area.id_area !== areaSeleccionada.id_area)
      );
      return;
    }

    const indiceExistente = areasAsignadas.findIndex(
      (a) => a.area.id_area === areaSeleccionada.id_area
    );

    if (indiceExistente !== -1) {
      const nuevasAsignaciones = [...areasAsignadas];
      nuevasAsignaciones[indiceExistente] = {
        area: areaSeleccionada,
        niveles: niveles,
      };
      setAreasAsignadas(nuevasAsignaciones);
    } else {
      const nuevaAsignacion: AreaConNiveles = {
        area: areaSeleccionada,
        niveles: niveles,
      };
      setAreasAsignadas((prev) => [...prev, nuevaAsignacion]);
    }
  };

  const handleGuardar = async () => {
    // Validaciones
    if (!nombre.trim() || !apellido.trim() || !email.trim() || !ci.trim()) {
      alert("Por favor complete todos los campos");
      return;
    }

    if (!passwordGenerated || !generatedPassword) {
      alert("Por favor genere una contraseña");
      return;
    }

    if (areasAsignadas.length === 0) {
      alert("Por favor asigne al menos un área con niveles");
      return;
    }

    // Preparar payload
    const todasLasAreas = areasAsignadas.map((a) => a.area.id_area);
    const todosLosNiveles = areasAsignadas.flatMap((a) =>
      a.niveles.map((n) => n.id_nivel)
    );

    const payload: CreateEvaluadorPayload = {
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      ci: ci.trim(),
      email: email.trim(),
      password: generatedPassword,
      areas: todasLasAreas,
      niveles: todosLosNiveles,
    };

    try {
      setGuardando(true);
      console.log("Enviando payload:", payload);

      const response = await evaluadoresService.crearEvaluador(payload);

      console.log("Evaluador creado exitosamente:", response);
      alert("Evaluador registrado exitosamente");

      // Limpiar formulario
      setNombre("");
      setApellido("");
      setEmail("");
      setCi("");
      setGeneratedPassword("");
      setPasswordGenerated(false);
      setAreasAsignadas([]);
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al registrar el evaluador. Por favor intente nuevamente.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="bg-neutro-100 min-h-screen flex items-center justify-center p-4 font-display">
      <main className="bg-blanco w-full max-w-4xl rounded-xl shadow-sombra-3 p-8">
        <header className="flex justify-center items-center mb-10">
          <h1 className="text-4xl font-extrabold text-negro tracking-tighter text-center">
            Registrar Evaluador de Area/Nivel
          </h1>
        </header>

        <div className="space-y-8">
          <div className="flex gap-8">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-negro">
                Nombre del evaluador
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
                Apellido del evaluador
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

          <div className="flex gap-8">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-negro">
                  Correo Electrónico
                </label>
                <input
                  type="email"
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
                {passwordGenerated && generatedPassword && (
                  <div className="w-[400px] border rounded-md p-2 border-neutro-400 bg-neutro-50 flex items-center justify-between">
                    <span className="text-sm font-mono">{generatedPassword}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedPassword);
                        alert("Contraseña copiada al portapapeles");
                      }}
                      className="text-xs bg-principal-400 text-white px-3 py-1 rounded hover:bg-principal-600 transition-colors"
                    >
                      Copiar
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-negro">Area</label>
              <div className="relative flex flex-col gap-2">
                <button
                  type="button"
                  className="w-[400px] border rounded-md p-2 border-neutro-400 bg-[#0076FF] text-white transition-colors hover:bg-principal-600"
                >
                  Asignar Area
                </button>

                <div className="w-[400px] border rounded-md p-2 border-neutro-400 bg-neutro-50 h-[180px] overflow-y-auto text-sm">
                  {loading ? (
                    <p className="text-neutro-500 italic">Cargando areas...</p>
                  ) : areas.length > 0 ? (
                    <ul className="space-y-1">
                      {areas.map((area, index) => {
                        const yaAsignada = areasAsignadas.some(
                          (a) => a.area.id_area === area.id_area
                        );
                        return (
                          <li
                            key={area.id_area}
                            onClick={() => handleSeleccionarArea(area)}
                            className={`flex justify-between items-center rounded-md px-2 py-2 transition-colors cursor-pointer hover:bg-neutro-200 ${
                              index % 2 === 0 ? "bg-[#E5E7EB]" : "bg-[#F3F4F6]"
                            }`}
                          >
                            <span>{area.nombre}</span>
                            <input
                              type="checkbox"
                              checked={yaAsignada}
                              readOnly
                              className="ml-2"
                            />
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="text-neutro-500 italic">
                      No hay areas registradas
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <footer className="flex justify-end items-center gap-4 mt-12">
            <button
              type="button"
              className="flex items-center gap-2 font-semibold py-2.5 px-6 rounded-lg bg-neutro-200 text-neutro-700 hover:bg-neutro-300 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
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
              type="button"
              onClick={handleGuardar}
              disabled={guardando}
              className="flex items-center justify-center gap-2 w-48 font-semibold py-2.5 px-6 rounded-lg bg-[#0076FF] text-blanco hover:bg-principal-600 transition-colors disabled:bg-principal-300 disabled:cursor-not-allowed"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
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
              <span>{guardando ? "Guardando..." : "Guardar"}</span>
            </button>
          </footer>
        </div>
      </main>

      {areaSeleccionada && (
        <ModalAsignarNivel
          isOpen={showModalNiveles}
          onClose={handleCerrarModalNiveles}
          area={areaSeleccionada}
          niveles={niveles}
          nivelesPreseleccionados={nivelesPreseleccionados}
          onConfirmar={handleConfirmarNiveles}
        />
      )}
    </div>
  );
};