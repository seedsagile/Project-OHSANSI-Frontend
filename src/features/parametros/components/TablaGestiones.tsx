import React, { useEffect, useState } from 'react';
import { obtenerParametrosPorOlimpiadaAPI } from '../service/service';

interface Gestion {
  id: number;
  gestion: string;
  area: string;
  nivel: string;
  notaMinima: number;
  notaMaxima: number;
  cantidadMaxima: number;
}

interface TablaGestionesProps {
  onSelectGestion: (id: number) => void;
  gestionSeleccionada: number | null;
  areaSeleccionada: number | null;
  nivelSeleccionado: string | null;
}

export const TablaGestiones: React.FC<TablaGestionesProps> = ({
  onSelectGestion,
  gestionSeleccionada,
  areaSeleccionada,
  nivelSeleccionado,
}) => {
  const [gestiones, setGestiones] = useState<Gestion[]>([]);
  const [filteredGestiones, setFilteredGestiones] = useState<Gestion[]>([]);

  useEffect(() => {
    const fetchGestionesPasadas = async () => {
      try {
        const data = await obtenerParametrosPorOlimpiadaAPI(2); // id olimpiada
        setGestiones(data);
      } catch (error) {
        console.error('Error al obtener gestiones pasadas:', error);
      }
    };
    fetchGestionesPasadas();
  }, []);

  useEffect(() => {
    if (areaSeleccionada && nivelSeleccionado) {
      const filtered = gestiones.filter(
        (g) => g.area === areaSeleccionada.toString() && g.nivel === nivelSeleccionado
      );
      setFilteredGestiones(filtered);
    } else {
      setFilteredGestiones([]);
    }
  }, [gestiones, areaSeleccionada, nivelSeleccionado]);

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold text-negro mb-4 text-center">
        Parámetros de clasificación de Gestiones Pasadas
      </h2>

      <div className="overflow-hidden rounded-lg border border-neutro-300">
        <div className="max-h-80 overflow-y-auto">
          <table className="w-full border-collapse table-auto">
            <thead className="bg-principal-500 text-blanco sticky top-0 z-10">
              <tr>
                <th className="py-2 px-4 text-left w-[10%]">Gestión</th>
                <th className="py-2 px-4 text-left w-[20%]">Área</th>
                <th className="py-2 px-4 text-left w-[20%]">Nivel</th>
                <th className="py-2 px-4 text-left w-[10%]">Nota mínima</th>
                <th className="py-2 px-4 text-left w-[10%]">Nota máxima</th>
                <th className="py-2 px-2 text-left w-[12%]">Cant. máx. Estudiantes</th>
                <th className="py-2 px-4 text-center w-[8%]">Seleccionar</th>
              </tr>
            </thead>
            <tbody className="text-neutro-800 bg-white">
              {areaSeleccionada && nivelSeleccionado ? (
                filteredGestiones.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-neutro-600">
                      No hay datos para esta área y nivel.
                    </td>
                  </tr>
                ) : (
                  filteredGestiones.map((g) => (
                    <tr
                      key={g.id}
                      className="border-t border-neutro-200 hover:bg-neutro-100 transition"
                    >
                      <td className="py-2 px-4">{g.gestion}</td>
                      <td className="py-2 px-4">{g.area}</td>
                      <td className="py-2 px-4">{g.nivel}</td>
                      <td className="py-2 px-4 text-center">{g.notaMinima}</td>
                      <td className="py-2 px-4 text-center">{g.notaMaxima}</td>
                      <td className="py-2 px-2 text-center">{g.cantidadMaxima}</td>
                      <td className="py-2 px-4 text-center">
                        <input
                          type="checkbox"
                          className="w-5 h-5 accent-principal-500"
                          checked={gestionSeleccionada === g.id}
                          onChange={() => onSelectGestion(g.id)}
                        />
                      </td>
                    </tr>
                  ))
                )
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-neutro-600">
                    Seleccione un área y nivel para ver las gestiones.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
