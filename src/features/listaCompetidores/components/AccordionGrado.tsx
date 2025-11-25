import React, { useState, useRef, useEffect } from 'react';
import { getGradosPorAreaYNivelAPI } from '../service/service';
import type { Area } from '../interface/interface';

interface Grado {
  id_grado_escolaridad: number;
  nombre: string;
}

interface AccordionGradoProps {
  selectedAreas: Area[];
  selectedNiveles: { [areaId: number]: number[] };
  selectedGrados: number[];
  onChangeSelected: React.Dispatch<React.SetStateAction<number[]>>;
}

export const AccordionGrado: React.FC<AccordionGradoProps> = ({
  selectedAreas,
  selectedNiveles,
  selectedGrados,
  onChangeSelected,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [grados, setGrados] = useState<Grado[]>([]);
  const accordionRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [marcarTodo, setMarcarTodo] = useState(false);

  const toggleAccordion = () => setIsOpen(!isOpen);

  // Selección individual
  const handleCheckboxChange = (id_grado_escolaridad: number) => {
    if (selectedGrados.includes(id_grado_escolaridad)) {
      onChangeSelected(selectedGrados.filter((id) => id !== id_grado_escolaridad));
    } else {
      onChangeSelected([...selectedGrados, id_grado_escolaridad]);
    }
  };

  // Marcar todo
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

  // Obtener grados filtrados
  useEffect(() => {
    const fetchGrados = async () => {
      try {
        setLoading(true);

        let gradosAcumulados: Grado[] = [];

        for (const area of selectedAreas) {
          const nivelesDeArea = selectedNiveles[area.id_area] || [];

          for (const nivelId of nivelesDeArea) {
            const gradosRespuesta = await getGradosPorAreaYNivelAPI(area.id_area, nivelId);
            gradosAcumulados = [...gradosAcumulados, ...gradosRespuesta];
          }
        }

        const gradosUnicos = Array.from(
          new Map(gradosAcumulados.map((g) => [g.id_grado_escolaridad, g])).values()
        );

        setGrados(gradosUnicos);
      } catch (e) {
        console.error('Error al obtener grados filtrados:', e);
      } finally {
        setLoading(false);
      }
    };

    if (selectedAreas.length > 0) {
      fetchGrados();
    } else {
      setGrados([]);
    }
  }, [selectedAreas, selectedNiveles]);

  // Detectar clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accordionRef.current && !accordionRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sincronizar "Marcar todo"
  useEffect(() => {
    setMarcarTodo(grados.length > 0 && selectedGrados.length === grados.length);
  }, [selectedGrados, grados]);

  return (
    <div ref={accordionRef} className="relative w-60">
      {/* botón */}
      <button
        type="button"
        onClick={toggleAccordion}
        className="flex items-center justify-between w-full px-6 py-2.5 rounded-lg bg-principal-500 text-blanco font-semibold hover:bg-principal-600 transition-colors"
      >
        <span>Grado</span>
        <svg
          className={`w-6 h-6 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

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
              {/* Marcar todo */}
              <label
                className={`flex justify-between items-center w-full px-4 py-2 rounded-md border cursor-pointer ${
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

              {/* Lista */}
              {grados.map((grado) => {
                const isChecked = selectedGrados.includes(grado.id_grado_escolaridad);

                return (
                  <label
                    key={grado.id_grado_escolaridad}
                    className={`flex justify-between items-center w-full px-4 py-2 rounded-md border cursor-pointer ${
                      isChecked
                        ? 'bg-principal-100 border-principal-400 text-principal-700 font-semibold'
                        : 'bg-blanco hover:bg-neutro-100 border-neutro-200'
                    }`}
                  >
                    <span>{grado.nombre}</span>
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
