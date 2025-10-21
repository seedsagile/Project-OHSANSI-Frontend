import { areasService } from '@/features/areas/services/areasService';
import { Area } from '@/features/areas/types';
import { useEffect, useState } from 'react';

export const FormularioAsignarResponsable = () => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);

  // Estado para la contraseña generada
  const [generatedPassword, setGeneratedPassword] = useState<string>('');
  const [passwordGenerated, setPasswordGenerated] = useState<boolean>(false);

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const data = await areasService.obtenerAreas();
        setAreas(data);
      } catch (error) {
        console.error('Error cargando áreas:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAreas();
  }, []);

  // Genera una contraseña de 8 caracteres (letras y números), asegurando al menos
  // una minúscula, una mayúscula y un número.
  const generatePassword = (length = 8) => {
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const all = lower + upper + numbers;

    const randChar = (set: string) => set.charAt(Math.floor(Math.random() * set.length));

    // Garantizar 1 minúscula, 1 mayúscula y 1 número
    let pwd = '';
    pwd += randChar(lower);
    pwd += randChar(upper);
    pwd += randChar(numbers);

    for (let i = 3; i < length; i++) {
      pwd += randChar(all);
    }

    // Mezclar para no dejar los caracteres garantizados al inicio
    pwd = pwd
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
    return pwd;
  };

  const handleGenerarClick = () => {
    if (passwordGenerated) return; // protección extra
    const pwd = generatePassword(8);
    setGeneratedPassword(pwd);
    setPasswordGenerated(true);
  };

  // Ejemplo de uso al guardar: usar generatedPassword en el payload
  const handleGuardar = () => {
    const payload = {
      // nombre: ...,
      // apellido: ...,
      // correo: ...,
      // carnet: ...,
      password: generatedPassword, // aquí está la contraseña generada
      // areasAsignadas: [...],
    };

    console.log('Payload a enviar:', payload);
    // usar tu servicio para enviar payload al backend
  };

  return (
    <div className="bg-neutro-100 min-h-screen flex items-center justify-center p-4 font-display">
      <main className="bg-blanco w-full max-w-4xl rounded-xl shadow-sombra-3 p-8">
        <header className="flex justify-center items-center mb-10">
          <h1 className="text-4xl font-extrabold text-negro tracking-tighter text-center">
            Registrar Responsable de Area
          </h1>
        </header>

        <form action="" className="space-y-8" onSubmit={(e) => e.preventDefault()}>
          <div className="flex gap-8">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-negro">
                Nombre del responsable de area
              </label>
              <input
                type="text"
                placeholder="Ej: Pepito"
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
                className="w-[400px] border rounded-md p-2 border-neutro-400 focus:outline-none focus:ring-2 focus:ring-principal-400"
              />
            </div>
          </div>

          <div className="flex gap-8">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-negro">Correo Electrónico</label>
                <input
                  type="text"
                  placeholder="ejemplo@ejemplo.com"
                  className="w-[400px] border rounded-md p-2 border-neutro-400 focus:outline-none focus:ring-2 focus:ring-principal-400"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-negro">Carnet de identidad</label>
                <input
                  type="text"
                  placeholder="Ej: 1234567 o 1234567-18"
                  className="w-[400px] border rounded-md p-2 border-neutro-400 focus:outline-none focus:ring-2 focus:ring-principal-400"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-negro">Contraseña</label>

                <div className="flex gap-2 items-center">
                  <button
                    type="button"
                    onClick={handleGenerarClick}
                    disabled={passwordGenerated}
                    className={`w-[400px] border rounded-md p-2  border-neutro-400 transition-colors ${
                      passwordGenerated
                        ? 'bg-neutro-300 text-black cursor-not-allowed'
                        : 'bg-[#0076FF] text-white hover:bg-principal-600'
                    }`}
                  >
                    {passwordGenerated ? 'Contraseña generada' : 'Generar contraseña'}
                  </button>

                  {/* Mostrar la contraseña generada (readOnly). Si no quieres mostrarla, elimina este input */}
                  {/* <input
                    type="text"
                    readOnly
                    value={generatedPassword}
                    placeholder={passwordGenerated ? "" : "No generada aún"}
                    className="border rounded-md p-2 border-neutro-400 w-[240px] text-sm bg-neutro-50"
                  /> */}
                </div>
              </div>
            </div>

            {/* Campo Área */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-negro">Area</label>
              <div className="relative flex flex-col gap-2">
                <button
                  type="button"
                  className="w-[400px] border rounded-md p-2 border-neutro-400 bg-[#0076FF] text-white transition-colors"
                >
                  Asignar Area
                </button>
                <div className="w-[400px] border rounded-md p-2 border-neutro-400 bg-neutro-50 max-h-[137px] overflow-y-auto text-sm">
                  {loading ? (
                    <p className="text-neutro-500 italic">Cargando areas...</p>
                  ) : areas.length > 0 ? (
                    <ul className="space-y-1">
                      {areas.map((area, index) => (
                        <li
                          key={area.id_area}
                          className={`flex justify-between items-center rounded-md px-2 py-1 transition-colors cursor-pointer ${
                            index % 2 === 0 ? 'bg-[#E5E7EB]' : 'bg-[#F3F4F6]'
                          } hover:bg-neutro-200`}
                        >
                          <span>{area.nombre}</span>
                          <input type="checkbox" className="ml-2" />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-neutro-500 italic">No hay areas registradas</p>
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
        </form>
      </main>
    </div>
  );
};
