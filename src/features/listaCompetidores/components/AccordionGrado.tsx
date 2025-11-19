import React, { useState, useRef, useEffect } from 'react';
import { getGradosAPI } from '../service/service';

interface Grado {
  id_grado_escolaridad: number;
  nombre: string;
}

interface AccordionGradoProps {
  selectedGrados: number[];
  onChangeSelected: React.Dispatch<React.SetStateAction<number[]>>;
}

export const AccordionGrado: React.FC<AccordionGradoProps> = ({
  selectedGrados,
  onChangeSelected,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [grados, setGrados] = useState<Grado[]>([]);
  const accordionRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [marcarTodo, setMarcarTodo] = useState(false);

  const toggleAccordion = () => setIsOpen(!isOpen);

  // ✅ Manejar selección individual
  const handleCheckboxChange = (id_grado_escolaridad: number) => {
    if (selectedGrados.includes(id_grado_escolaridad)) {
      onChangeSelected(selectedGrados.filter((id) => id !== id_grado_escolaridad));
    } else {
      onChangeSelected([...selectedGrados, id_grado_escolaridad]);
    }
  };

  // ✅ Marcar/Deseleccionar todo
  const handleMarcarTodo = () => {
    const nuevoEstado = !marcarTodo;
    setMarcarTodo(nuevoEstado);
    if (nuevoEstado) {
      const todosLosIds = grados.map((g) => g.id_grado_escolaridad);
      onChangeSelected(todosLosIds);
    } else {
      onChangeSelected([]);
    }
  };

  // ✅ Obtener grados desde API
  useEffect(() => {
    const fetchGrados = async () => {
      try {
        setLoading(true);
        const data = await getGradosAPI();
        setGrados(data);
      } catch (error) {
        console.error('Error al obtener los grados:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGrados();
  }, []);

  // ✅ Cerrar acordeón al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accordionRef.current && !accordionRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ✅ Sincronizar “Marcar todo”
  useEffect(() => {
    if (grados.length > 0 && selectedGrados.length === grados.length) {
      setMarcarTodo(true);
    } else {
      setMarcarTodo(false);
    }
  }, [selectedGrados, grados]);

  return (
    <div ref={accordionRef} className="relative w-60">
      {/* Botón principal */}
      <button
        type="button"
        onClick={toggleAccordion}
        className="flex items-center justify-between w-full px-6 py-2.5 rounded-lg bg-principal-500 text-blanco font-semibold hover:bg-principal-600 transition-colors"
      >
        <span>Grado</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`w-6 h-6 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* Contenido del acordeón */}
      {isOpen && (
        <div
          className="absolute left-0 top-full z-50 w-60 bg-blanco px-6 py-4 border-2 border-principal-500 rounded-b-xl shadow-lg overflow-y-auto"
          style={{ maxHeight: '200px' }}
        >
          {loading ? (
            <div className="text-center text-gray-500 py-2">Cargando grados...</div>
          ) : grados.length === 0 ? (
            <div className="text-center text-gray-500 py-2">No hay grados disponibles</div>
          ) : (
            <div className="space-y-2">
              {/* 🔹 Opción de Marcar todo */}
              <label
                className={`flex justify-between items-center w-full px-4 py-2 rounded-md border transition-all duration-150 cursor-pointer ${
                  marcarTodo
                    ? 'bg-principal-100 border-principal-400 text-principal-700 font-semibold'
                    : 'bg-blanco hover:bg-neutro-100 border-neutro-200'
                }`}
              >
                <span className="text-principal-500">Marcar todo</span>
                <input
                  type="checkbox"
                  checked={marcarTodo}
                  onChange={handleMarcarTodo}
                  className="accent-principal-500 w-4 h-4"
                />
              </label>

              {/* 🔹 Listado de grados */}
              {grados.map((grado) => {
                const isChecked = selectedGrados.includes(grado.id_grado_escolaridad);
                return (
                  <label
                    key={grado.id_grado_escolaridad}
                    className={`flex justify-between items-center w-full px-4 py-2 rounded-md border transition-all duration-150 cursor-pointer ${
                      isChecked
                        ? 'bg-principal-100 border-principal-400 text-principal-700 font-semibold'
                        : 'bg-blanco hover:bg-neutro-100 border-neutro-200'
                    }`}
                  >
                    <span className="text-negro">{grado.nombre}</span>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleCheckboxChange(grado.id_grado_escolaridad)}
                      className="accent-principal-500 w-4 h-4"
                    />
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
