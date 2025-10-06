import { useEffect, useState } from "react";
import { ModalAsignarNivel } from "./ModalAsignarNivel";
import type { Area, Nivel } from "./ModalAsignarNivel";

// ==================== TIPOS ADICIONALES ====================
interface AreaConNiveles {
  area: Area;
  niveles: Nivel[];
}

// ==================== COMPONENTE FORMULARIO ====================
export const FormularioRegistrarEvaluador = () => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [niveles, setNiveles] = useState<Nivel[]>([]);
  const [loading, setLoading] = useState(true);

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
        // TODO: Reemplazar con llamadas reales a tus servicios
        // import { areasService } from "../../areas/services/areasService";
        // const areasData = await areasService.obtenerAreas();
        // import { nivelesService } from "../../niveles/services/nivelesService";
        // const nivelesData = await nivelesService.obtenerNiveles();

        // Datos simulados para desarrollo
        const areasData: Area[] = [
          { id_area: 1, nombre: "ROBOTICA" },
          { id_area: 2, nombre: "PROGRAMACION" },
          { id_area: 3, nombre: "BIOLOGIA" },
          { id_area: 4, nombre: "Matematica" },
        ];

        const nivelesData: Nivel[] = [
          { id_nivel: 1, nombre: "PROGRAMACION" },
          { id_nivel: 2, nombre: "BIOLOGIA" },
          { id_nivel: 3, nombre: "Matematica" },
        ];

        setAreas(areasData);
        setNiveles(nivelesData);
      } catch (error) {
        console.error("Error cargando datos:", error);
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
    // Verificar si el área ya está asignada
    const areaExistente = areasAsignadas.find(a => a.area.id_area === area.id_area);
    
    if (areaExistente) {
      // Si ya existe, cargar los niveles preseleccionados para editar
      const nivelesIds = areaExistente.niveles.map(n => n.id_nivel);
      setNivelesPreseleccionados(nivelesIds);
    } else {
      // Si es nueva, no hay niveles preseleccionados
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

    // Si no hay niveles seleccionados, eliminar el área
    if (niveles.length === 0) {
      setAreasAsignadas((prev) => 
        prev.filter((a) => a.area.id_area !== areaSeleccionada.id_area)
      );
      return;
    }

    // Verificar si el área ya existe
    const indiceExistente = areasAsignadas.findIndex(
      a => a.area.id_area === areaSeleccionada.id_area
    );

    if (indiceExistente !== -1) {
      // Si existe, actualizar los niveles
      const nuevasAsignaciones = [...areasAsignadas];
      nuevasAsignaciones[indiceExistente] = {
        area: areaSeleccionada,
        niveles: niveles,
      };
      setAreasAsignadas(nuevasAsignaciones);
    } else {
      // Si no existe, agregar nueva asignación
      const nuevaAsignacion: AreaConNiveles = {
        area: areaSeleccionada,
        niveles: niveles,
      };
      setAreasAsignadas((prev) => [...prev, nuevaAsignacion]);
    }
  };

  const handleEliminarAsignacion = (areaId: number) => {
    setAreasAsignadas((prev) => prev.filter((a) => a.area.id_area !== areaId));
  };

  const handleGuardar = () => {
    const payload = {
      // nombre: ...,
      // apellido: ...,
      // correo: ...,
      // carnet: ...,
      password: generatedPassword,
      areasAsignadas: areasAsignadas,
    };

    console.log("Payload a enviar:", payload);
    // TODO: Llamar al servicio para guardar
    // import { evaluadoresService } from "../services/evaluadoresService";
    // await evaluadoresService.crearEvaluador(payload);
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
                  type="text"
                  placeholder="ejemplo@ejemplo.com"
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

            {/* Tabla de Áreas */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-negro">Area</label>
              <div className="relative flex flex-col gap-2">
                <button
                  type="button"
                  className="w-[400px] border rounded-md p-2 border-neutro-400 bg-[#0076FF] text-white transition-colors hover:bg-principal-600"
                >
                  Asignar Area
                </button>
                
                {/* Tabla de áreas disponibles */}
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
              <span>Guardar</span>
            </button>
          </footer>
        </div>
      </main>

      {/* Modal de Niveles */}
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