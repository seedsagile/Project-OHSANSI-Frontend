import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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

// ==================== SCHEMA DE VALIDACIÓN ====================
const schemaEvaluador = z.object({
  nombre: z.string()
    .min(1, 'El campo Nombre del evaluador es obligatorio.')
    .transform((val) => val.trim())
    .refine((val) => val.length > 0, {
      message: 'El campo Nombre del evaluador es obligatorio.'
    })
    .pipe(
      z.string()
        .min(3, 'El campo Nombre del evaluador requiere un mínimo de 3 caracteres.')
        .max(20, 'El campo Nombre del evaluador tiene un límite máximo de 20 caracteres.')
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El campo Nombre del evaluador solo permite letras, espacios y acentos.')
    ),
  apellido: z.string()
    .min(1, 'El campo Apellido es obligatorio.')
    .transform((val) => val.trim())
    .refine((val) => val.length > 0, {
      message: 'El campo Apellido es obligatorio.'
    })
    .pipe(
      z.string()
        .min(3, 'El campo Apellido del evaluador requiere un mínimo de 3 caracteres.')
        .max(20, 'El campo Apellido del evaluador tiene un límite máximo de 20 caracteres.')
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El campo Apellido del evaluador solo permite letras, espacios y acentos.')
    ),
  email: z.string()
    .min(1, 'El campo Correo electrónico es obligatorio.')
    .transform((val) => val.trim())
    .refine((val) => val.length > 0, {
      message: 'El campo Correo Electrónico es obligatorio.'
    })
    .pipe(
      z.string()
        .min(6, 'El campo Correo electrónico requiere un mínimo de 6 caracteres.')
        .max(50, 'El campo Correo electrónico tiene un límite máximo de 50 caracteres.')
        .email('El correo electrónico no es válido.')
    ),
  ci: z.string()
    .min(1, 'El campo Carnet de identidad es obligatorio.')
    .transform((val) => val.trim().replace(/\s+/g, ''))
    .refine((val) => val.length > 0, {
      message: 'El campo Carnet de identidad es obligatorio.'
    })
    .pipe(
      z.string()
        .min(6, 'El campo Carnet de identidad requiere un mínimo de 6 caracteres.')
        .max(15, 'El campo Carnet de identidad tiene un límite máximo de 15 caracteres.')
        .regex(/^[a-zA-Z0-9]+$/, 'El campo Carnet de identidad solo acepta números y letras.')
    ),
});

type FormData = z.infer<typeof schemaEvaluador>;

// ==================== COMPONENTE FORMULARIO ====================
export const FormularioRegistrarEvaluador = () => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [generatedPassword, setGeneratedPassword] = useState<string>("");
  const [passwordGenerated, setPasswordGenerated] = useState<boolean>(false);

  const [showModalNiveles, setShowModalNiveles] = useState(false);
  const [areaSeleccionada, setAreaSeleccionada] = useState<Area | null>(null);
  const [nivelesDisponibles, setNivelesDisponibles] = useState<Nivel[]>([]);
  const [loadingNiveles, setLoadingNiveles] = useState(false);
  const [nivelesPreseleccionados, setNivelesPreseleccionados] = useState<number[]>([]);

  const [areasAsignadas, setAreasAsignadas] = useState<AreaConNiveles[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schemaEvaluador),
    mode: "onChange",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const areasData = await areasService.obtenerAreas();
        setAreas(areasData);
      } catch (error) {
        console.error("Error cargando áreas:", error);
        alert("Error al cargar las áreas");
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

  const handleSeleccionarArea = async (area: Area) => {
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
    
    setLoadingNiveles(true);
    try {
      const niveles = await nivelesService.obtenerNivelesPorArea(area.id_area);
      setNivelesDisponibles(niveles);
    } catch (error) {
      console.error("Error al cargar niveles:", error);
      alert("Error al cargar los niveles del área");
      setNivelesDisponibles([]);
    } finally {
      setLoadingNiveles(false);
    }
  };

  const handleCerrarModalNiveles = () => {
    setShowModalNiveles(false);
    setAreaSeleccionada(null);
    setNivelesPreseleccionados([]);
    setNivelesDisponibles([]);
  };

  const handleConfirmarNiveles = (niveles: Nivel[]) => {
    if (!areaSeleccionada) return;

    if (niveles.length === 0) {
      setAreasAsignadas((prev) =>
        prev.filter((a) => a.area.id_area !== areaSeleccionada.id_area)
      );
      handleCerrarModalNiveles();
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
    
    handleCerrarModalNiveles();
  };

  const onSubmit = async (data: FormData) => {
    // Validar contraseña generada
    if (!passwordGenerated || !generatedPassword) {
      alert("Por favor genere una contraseña antes de guardar");
      return;
    }

    // Validar áreas asignadas
    if (areasAsignadas.length === 0) {
      alert("Por favor asigne al menos un área con niveles antes de guardar");
      return;
    }

    // Preparar payload en el formato que espera el backend
    const payload: CreateEvaluadorPayload = {
      nombre: data.nombre,
      apellido: data.apellido,
      ci: data.ci,
      email: data.email,
      password: generatedPassword,
      areas_niveles: areasAsignadas.map((ac) => ({
        area: ac.area.id_area,
        niveles: ac.niveles.map((n) => n.id_nivel),
      })),
    };

    try {
      setGuardando(true);
      
      console.log("═══════════════════════════════════════════════════════");
      console.log("📤 ENVIANDO AL BACKEND:");
      console.log(JSON.stringify(payload, null, 2));
      console.log("═══════════════════════════════════════════════════════");

      const response = await evaluadoresService.crearEvaluador(payload);

      console.log("═══════════════════════════════════════════════════════");
      console.log("✅ RESPUESTA DEL BACKEND:");
      console.log(JSON.stringify(response, null, 2));
      console.log("═══════════════════════════════════════════════════════");

      alert(`✅ Evaluador registrado exitosamente!\n\nNombre: ${data.nombre} ${data.apellido}\nÁreas asignadas: ${areasAsignadas.length}`);

      // Limpiar formulario
      reset();
      setGeneratedPassword("");
      setPasswordGenerated(false);
      setAreasAsignadas([]);
    } catch (error: any) {
      console.error("❌ Error al guardar:", error);
      alert(error.message || "Error al registrar el evaluador. Por favor intente nuevamente.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
      <main className="bg-white w-full max-w-4xl rounded-xl shadow-lg p-8">
        <header className="flex justify-center items-center mb-10">
          <h1 className="text-4xl font-extrabold text-black tracking-tight text-center">
            Registrar Evaluador de Área/Nivel
          </h1>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* FILA 1: NOMBRE Y APELLIDO */}
          <div className="grid grid-cols-2 gap-8">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-black">
                Nombre del evaluador
              </label>
              <input
                type="text"
                placeholder="Ej: Pepito"
                {...register("nombre")}
                className={`border rounded-md p-2 focus:outline-none focus:ring-2 ${
                  errors.nombre 
                    ? "border-red-500 focus:ring-red-500" 
                    : "border-gray-300 focus:ring-blue-500"
                }`}
              />
              {errors.nombre && (
                <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-black">
                Apellido del evaluador
              </label>
              <input
                type="text"
                placeholder="Ej: Perez"
                {...register("apellido")}
                className={`border rounded-md p-2 focus:outline-none focus:ring-2 ${
                  errors.apellido 
                    ? "border-red-500 focus:ring-red-500" 
                    : "border-gray-300 focus:ring-blue-500"
                }`}
              />
              {errors.apellido && (
                <p className="text-red-500 text-xs mt-1">{errors.apellido.message}</p>
              )}
            </div>
          </div>

          {/* FILA 2: EMAIL, CI, PASSWORD Y ÁREAS */}
          <div className="grid grid-cols-2 gap-8">
            {/* COLUMNA IZQUIERDA */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-black">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  placeholder="ejemplo@ejemplo.com"
                  {...register("email")}
                  className={`border rounded-md p-2 focus:outline-none focus:ring-2 ${
                    errors.email 
                      ? "border-red-500 focus:ring-red-500" 
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-black">
                  Carnet de identidad
                </label>
                <input
                  type="text"
                  placeholder="Ej: 1234567"
                  {...register("ci")}
                  className={`border rounded-md p-2 focus:outline-none focus:ring-2 ${
                    errors.ci 
                      ? "border-red-500 focus:ring-red-500" 
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                />
                {errors.ci && (
                  <p className="text-red-500 text-xs mt-1">{errors.ci.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-black">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={handleGenerarClick}
                  disabled={passwordGenerated}
                  className={`border rounded-md p-2 transition-colors ${
                    passwordGenerated
                      ? "bg-gray-300 text-black cursor-not-allowed"
                      : "bg-[#0076FF] text-white hover:bg-blue-600"
                  }`}
                >
                  {passwordGenerated
                    ? "✓ Contraseña generada"
                    : "Generar contraseña"}
                </button>
                {passwordGenerated && generatedPassword && (
                  <div className="border rounded-md p-2 border-gray-300 bg-gray-50 flex items-center justify-between">
                    <span className="text-sm font-mono">{generatedPassword}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedPassword);
                        alert("Contraseña copiada al portapapeles");
                      }}
                      className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                    >
                      Copiar
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* COLUMNA DERECHA: ÁREAS */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-black">
                Áreas y Niveles
              </label>
              
              <button
                type="button"
                className="border rounded-md p-2 bg-[#0076FF] text-white transition-colors hover:bg-blue-600"
              >
                Seleccionar Áreas
              </button>

              <div className="border rounded-md p-2 border-gray-300 bg-gray-50 h-[220px] overflow-y-auto text-sm">
                {loading ? (
                  <p className="text-gray-500 italic">Cargando áreas...</p>
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
                          className={`flex justify-between items-center rounded-md px-2 py-2 transition-colors cursor-pointer hover:bg-gray-200 ${
                            index % 2 === 0 ? "bg-gray-100" : "bg-white"
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
                  <p className="text-gray-500 italic">
                    No hay áreas registradas
                  </p>
                )}
              </div>

              {/* ÁREAS ASIGNADAS */}
              {areasAsignadas.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-semibold text-black mb-2">
                    Áreas asignadas: ({areasAsignadas.length})
                  </p>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {areasAsignadas.map((ac) => (
                      <div
                        key={ac.area.id_area}
                        className="bg-blue-50 border border-blue-200 rounded-md p-2"
                      >
                        <p className="font-semibold text-sm">{ac.area.nombre}</p>
                        <p className="text-xs text-gray-600">
                          Niveles: {ac.niveles.map((n) => n.nombre).join(", ")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* BOTONES */}
          <footer className="flex justify-end items-center gap-4 mt-12 pt-6 border-t">
            <button
              type="button"
              onClick={() => {
                reset();
                setGeneratedPassword("");
                setPasswordGenerated(false);
                setAreasAsignadas([]);
              }}
              className="flex items-center gap-2 font-semibold py-2.5 px-6 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
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
              type="submit"
              disabled={guardando}
              className="flex items-center justify-center gap-2 min-w-[180px] font-semibold py-2.5 px-6 rounded-lg bg-[#0076FF] text-white hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {guardando ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
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
                  <span>Guardar</span>
                </>
              )}
            </button>
          </footer>
        </form>
      </main>

      {areaSeleccionada && (
        <ModalAsignarNivel
          isOpen={showModalNiveles}
          onClose={handleCerrarModalNiveles}
          area={areaSeleccionada}
          niveles={nivelesDisponibles}
          nivelesPreseleccionados={nivelesPreseleccionados}
          onConfirmar={handleConfirmarNiveles}
        />
      )}
    </div>
  );
};