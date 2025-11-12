// TablaGestiones.tsx
import React, { useEffect, useState } from 'react';
import { obtenerParametrosPorOlimpiadaAPI } from '../service/service';
import type { Nivel } from '../interface/interface';

interface Parametro {
  id: number;
  gestion: string;
  area: string;
  nivel: string;
  notaMinima: number;
  notaMaxima: number;
  cantidadMaxima: number;
}

interface TablaGestionesProps {
  onSelectGestion: (id: number | null) => void;
  gestionSeleccionada: number | null;
  formularioHabilitado: boolean;
  onCopiarValores: (valores: {
    notaMinima: number;
    notaMaxima: number;
    cantidadMaxima: number;
  }) => void;
  nivelesSeleccionados: Nivel[]; // niveles seleccionados desde Parametro.tsx
  areaSeleccionadaNombre: string | null; // nombre del área seleccionada para filtrar
}

export const TablaGestiones: React.FC<TablaGestionesProps> = ({
  onSelectGestion,
  gestionSeleccionada,
  formularioHabilitado,
  onCopiarValores,
  nivelesSeleccionados,
  areaSeleccionadaNombre,
}) => {
  const [parametros, setParametros] = useState<Parametro[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParametros = async () => {
      try {
        const data = await obtenerParametrosPorOlimpiadaAPI();
        setParametros(data);
      } catch (error) {
        console.error('Error al obtener parámetros:', error);
        setParametros([]);
      } finally {
        setLoading(false);
      }
    };
    fetchParametros();
  }, []);

  if (loading) {
    return <p className="text-center text-neutro-600">Cargando datos...</p>;
  }

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold text-negro mb-4 text-center">
        Parámetros de clasificación de gestiones pasadas
      </h2>

      <div className="overflow-hidden rounded-lg border border-neutro-300">
        <div className="max-h-80 overflow-y-auto">
          <table className="w-full border-collapse table-auto">
            <thead className="bg-principal-500 text-blanco sticky top-0 z-10">
              <tr>
                <th className="py-2 px-4 text-left w-[12%]">Gestión</th>
                {/* <th className="py-2 px-4 text-left w-[20%]">Área</th>
                <th className="py-2 px-4 text-left w-[18%]">Nivel</th> */}
                <th className="py-2 px-4 text-center w-[12%]">Nota mínima</th>
                <th className="py-2 px-4 text-center w-[20%]">Cantidad máxima de clasificados</th>
                <th className="py-2 px-4 text-center w-[8%]">Seleccionar</th>
              </tr>
            </thead>

            <tbody className="text-neutro-800 bg-white">
              {/* Si no hay niveles seleccionados */}
              {nivelesSeleccionados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-neutro-600">
                    No se seleccionó ningún nivel. Selecciona al menos un nivel para ver sus
                    parámetros de clasificación.
                  </td>
                </tr>
              ) : (
                // Por cada nivel seleccionado, mostrar encabezado y sus datos (o fila de "no tiene datos")
                nivelesSeleccionados.map((nivel) => {
                  // Filtrar parámetros por área seleccionada y por nombre de nivel
                  // Nota: nivel.nombre debe coincidir con p.nivel (según tu API)
                  const filasParaNivel = parametros.filter((p) => {
                    const mismoNivel = p.nivel?.trim() === nivel.nombre?.trim();
                    const mismaArea = areaSeleccionadaNombre
                      ? p.area?.trim() === areaSeleccionadaNombre.trim()
                      : true; // si no hay área seleccionada, no filtrar por área
                    return mismoNivel && mismaArea;
                  });

                  return (
                    <React.Fragment key={nivel.id}>
                      {/* fila separadora con el nombre del nivel */}
                      <tr className="bg-principal-100 border-t border-principal-300">
                        <td
                          colSpan={6}
                          className="py-2 px-4 font-semibold text-principal-800 text-center"
                        >
                          Nivel: {nivel.nombre}
                        </td>
                      </tr>

                      {/* filas con datos si existen */}
                      {filasParaNivel.length > 0 ? (
                        filasParaNivel.map((p) => (
                          <tr
                            key={p.id}
                            className="border-t border-neutro-200 hover:bg-neutro-100 transition"
                          >
                            <td className="py-2 px-4">{p.gestion}</td>
                            {/* <td className="py-2 px-4">{p.area}</td>
                            <td className="py-2 px-4">{p.nivel}</td> */}
                            <td className="py-2 px-4 text-center">{p.notaMinima}</td>
                            <td className="py-2 px-4 text-center">{p.cantidadMaxima}</td>
                            <td className="py-2 px-4 text-center">
                              <input
                                type="checkbox"
                                className="w-5 h-5 accent-principal-500"
                                checked={gestionSeleccionada === p.id}
                                onChange={() => {
                                  if (gestionSeleccionada === p.id) {
                                    onSelectGestion(null);
                                  } else {
                                    onSelectGestion(p.id);
                                    onCopiarValores({
                                      notaMinima: p.notaMinima,
                                      notaMaxima: p.notaMaxima,
                                      cantidadMaxima: p.cantidadMaxima,
                                    });
                                  }
                                }}
                                disabled={!formularioHabilitado}
                              />
                            </td>
                          </tr>
                        ))
                      ) : (
                        // Si no hay datos para ese nivel (en esa área)
                        <tr>
                          <td colSpan={6} className="text-center py-4 text-neutro-600 italic">
                            No tiene datos para este nivel.
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
