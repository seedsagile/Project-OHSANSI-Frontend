//src/features/evaluadores/components/FormularioRegistrarEvaluador.tsx
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ModalAsignarNivel } from './ModalAsignarNivel';
import { ModalConfirmacion } from './ModalConfirmacion';
import { evaluadoresService, areasService, nivelesService } from '../services/evaluadoresService';
import type { Area, Nivel, AreaConNiveles, CreateEvaluadorPayload } from '../types/IndexEvaluador';
import {
  schemaEvaluador,
  type EvaluadorFormData,
  backendErrorMessages,
} from '../validations/evaluatorValidation';

// ==================== COMPONENTE FORMULARIO ====================
export const FormularioRegistrarEvaluador = () => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [showModalNiveles, setShowModalNiveles] = useState(false);
  const [areaSeleccionada, setAreaSeleccionada] = useState<Area | null>(null);
  const [nivelesDisponibles, setNivelesDisponibles] = useState<Nivel[]>([]);
  const [loadingNiveles, setLoadingNiveles] = useState(false);
  const [nivelesPreseleccionados, setNivelesPreseleccionados] = useState<number[]>([]);

  const [areasAsignadas, setAreasAsignadas] = useState<AreaConNiveles[]>([]);

  // Estados del modal de confirmación
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error' | 'info' | 'confirmation'>(
    'success'
  );
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [autoCloseModal, setAutoCloseModal] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EvaluadorFormData>({
    resolver: zodResolver(schemaEvaluador),
    mode: 'onChange',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const areasData = await areasService.obtenerAreas();
        setAreas(areasData);
      } catch (error) {
        console.error('Error cargando áreas:', error);
        setAutoCloseModal(false);
        mostrarModal('error', 'Error', 'Error al cargar las áreas');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /**
   * Genera una contraseña aleatoria segura
   */
  const generatePassword = (length = 8) => {
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const all = lower + upper + numbers;

    const randChar = (set: string) => set.charAt(Math.floor(Math.random() * set.length));

    let pwd = '';
    pwd += randChar(lower);
    pwd += randChar(upper);
    pwd += randChar(numbers);

    for (let i = 3; i < length; i++) {
      pwd += randChar(all);
    }

    pwd = pwd
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
    return pwd;
  };

  const handleSeleccionarArea = async (area: Area) => {
    const areaExistente = areasAsignadas.find((a) => a.area.id_area === area.id_area);

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
      console.error('Error al cargar niveles:', error);
      setAutoCloseModal(false);
      mostrarModal('error', 'Error', 'Error al cargar los niveles del área');
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
      setAreasAsignadas((prev) => prev.filter((a) => a.area.id_area !== areaSeleccionada.id_area));
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

  const mostrarModal = (
    type: 'success' | 'error' | 'info' | 'confirmation',
    title: string,
    message: string
  ) => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setShowModal(true);
  };

  const onSubmit = async (data: EvaluadorFormData) => {
    // Validar áreas asignadas
    if (areasAsignadas.length === 0) {
      setAutoCloseModal(false);
      mostrarModal(
        'error',
        'Error de Validación',
        'Por favor asigne al menos un área con niveles antes de guardar'
      );
      return;
    }

    // Generar contraseña automáticamente
    const generatedPassword = generatePassword(8);

    // Preparar payload (los datos ya vienen normalizados por Zod)
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

      await evaluadoresService.crearEvaluador(payload);

      const mensaje = `El evaluador "${data.nombre} ${data.apellido}" ha sido registrado correctamente y se envió un correo electrónico con sus credenciales.`;

      setAutoCloseModal(true);
      mostrarModal('success', '¡Registro Exitoso!', mensaje);

      // Limpiar formulario
      reset();
      setAreasAsignadas([]);
    } catch (error: unknown) {
      console.error('═══════════════════════════════════════════════════════');
      console.error('❌ ERROR CAPTURADO EN EL FORMULARIO:');
      console.error('Error completo:', error);

      setAutoCloseModal(false);

      // Type guard para verificar si es un error con propiedades type y message
      if (error && typeof error === 'object' && 'type' in error && 'message' in error) {
        const apiError = error as { type: string; message: string };

        console.error('Mensaje de error:', apiError.message);
        console.error('Tipo:', apiError.type);
        console.error('═══════════════════════════════════════════════════════');

        // Manejar errores según el tipo
        if (apiError.type === 'CI_DUPLICADO') {
          mostrarModal(
            'error',
            backendErrorMessages.CI_DUPLICADO.title,
            backendErrorMessages.CI_DUPLICADO.message
          );
        } else if (apiError.type === 'EMAIL_DUPLICADO') {
          mostrarModal(
            'error',
            backendErrorMessages.EMAIL_DUPLICADO.title,
            backendErrorMessages.EMAIL_DUPLICADO.message
          );
        } else {
          // Error genérico con mensaje del backend
          mostrarModal('error', backendErrorMessages.ERROR_GENERICO.title, apiError.message);
        }
      } else if (error instanceof Error) {
        // Error estándar de JavaScript
        console.error('Error estándar:', error.message);
        console.error('═══════════════════════════════════════════════════════');

        mostrarModal('error', backendErrorMessages.ERROR_GENERICO.title, error.message);
      } else {
        // Error desconocido
        console.error('Error desconocido');
        console.error('═══════════════════════════════════════════════════════');

        mostrarModal(
          'error',
          backendErrorMessages.ERROR_GENERICO.title,
          backendErrorMessages.ERROR_GENERICO.message
        );
      }
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
      <main className="bg-white w-full max-w-4xl rounded-xl shadow-lg p-8">
        <header className="flex justify-center items-center mb-10">
          <h1 className="text-4xl font-extrabold text-black tracking-tight text-center">
            Registrar Evaluador de Area/Nivel
          </h1>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* FILA 1: NOMBRE Y APELLIDO */}
          <div className="grid grid-cols-2 gap-8">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-black">Nombre del evaluador</label>
              <input
                type="text"
                placeholder="Ej: Pepito"
                {...register('nombre')}
                className={`border rounded-md p-2 focus:outline-none focus:ring-2 ${
                  errors.nombre
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {errors.nombre && (
                <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-black">Apellido del evaluador</label>
              <input
                type="text"
                placeholder="Ej: Perez"
                {...register('apellido')}
                className={`border rounded-md p-2 focus:outline-none focus:ring-2 ${
                  errors.apellido
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {errors.apellido && (
                <p className="text-red-500 text-xs mt-1">{errors.apellido.message}</p>
              )}
            </div>
          </div>

          {/* FILA 2: EMAIL, CI Y ÁREAS */}
          <div className="grid grid-cols-2 gap-8">
            {/* COLUMNA IZQUIERDA */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-black">Correo Electrónico</label>
                <input
                  type="email"
                  placeholder="ejemplo@ejemplo.com"
                  {...register('email')}
                  className={`border rounded-md p-2 focus:outline-none focus:ring-2 ${
                    errors.email
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-black">Carnet de identidad</label>
                <input
                  type="text"
                  placeholder="Ej: 1234567"
                  {...register('ci')}
                  className={`border rounded-md p-2 focus:outline-none focus:ring-2 ${
                    errors.ci
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {errors.ci && <p className="text-red-500 text-xs mt-1">{errors.ci.message}</p>}
              </div>
            </div>

            {/* COLUMNA DERECHA: ÁREAS */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-black">Áreas y Niveles</label>

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
                            index % 2 === 0 ? 'bg-gray-100' : 'bg-white'
                          }`}
                        >
                          <span>{area.nombre}</span>
                          <input type="checkbox" checked={yaAsignada} readOnly className="ml-2" />
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic">No hay áreas registradas</p>
                )}
              </div>
            </div>
          </div>

          {/* BOTONES */}
          <footer className="flex justify-end items-center gap-4 mt-12">
            <button
              type="button"
              onClick={() => {
                reset();
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
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
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

      {/* MODAL ASIGNAR NIVEL */}
      {areaSeleccionada && (
        <ModalAsignarNivel
          isOpen={showModalNiveles}
          onClose={handleCerrarModalNiveles}
          area={areaSeleccionada}
          niveles={nivelesDisponibles}
          nivelesPreseleccionados={nivelesPreseleccionados}
          onConfirmar={handleConfirmarNiveles}
          loading={loadingNiveles}
        />
      )}

      {/* MODAL CONFIRMACIÓN */}
      <ModalConfirmacion
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={() => setShowModal(false)}
        type={modalType}
        title={modalTitle}
        autoClose={autoCloseModal}
      >
        {modalMessage}
      </ModalConfirmacion>
    </div>
  );
};
