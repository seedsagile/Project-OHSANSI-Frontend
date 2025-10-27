import React, { useEffect, useState } from 'react';
import { obtenerParametrosPorOlimpiadaAPI } from '../service/service';

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
  onSelectGestion: (id: number | null) => void; // 👈 admite null
  gestionSeleccionada: number | null;
  formularioHabilitado: boolean;
  onCopiarValores: (valores: {
    notaMinima: number;
    notaMaxima: number;
    cantidadMaxima: number;
  }) => void;
}

export const TablaGestiones: React.FC<TablaGestionesProps> = ({
  onSelectGestion,
  gestionSeleccionada,
  formularioHabilitado,
  onCopiarValores,
}) => {
  const [parametros, setParametros] = useState<Parametro[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParametros = async () => {
      try {
        const data = await obtenerParametrosPorOlimpiadaAPI(2);
        setParametros(data);
      } catch (error) {
        console.error('Error al obtener parámetros:', error);
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
                <th className="py-2 px-4 text-left w-[10%]">Gestión</th>
                {/* <th className="py-2 px-4 text-left w-[20%]">Área</th>
                <th className="py-2 px-4 text-left w-[20%]">Nivel</th> */}
                <th className="py-2 px-4 text-center w-[10%]">Nota mínima</th>
                <th className="py-2 px-4 text-center w-[10%]">Nota máxima</th>
                <th className="py-2 px-4 text-center w-[15%]">Cant. máx. Estudiantes</th>
                <th className="py-2 px-4 text-center w-[8%]">Seleccionar</th>
              </tr>
            </thead>

            <tbody className="text-neutro-800 bg-white">
              {parametros.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-neutro-600">
                    No hay datos disponibles.
                  </td>
                </tr>
              ) : (
                parametros.map((p) => (
                  <tr
                    key={p.id}
                    className="border-t border-neutro-200 hover:bg-neutro-100 transition"
                  >
                    <td className="py-2 px-4">{p.gestion}</td>
                    {/* <td className="py-2 px-4">{p.area}</td>
                    <td className="py-2 px-4">{p.nivel}</td> */}
                    <td className="py-2 px-4 text-center">{p.notaMinima}</td>
                    <td className="py-2 px-4 text-center">{p.notaMaxima}</td>
                    <td className="py-2 px-4 text-center">{p.cantidadMaxima}</td>
                    <td className="py-2 px-4 text-center">
                      <input
                        type="checkbox"
                        className="w-5 h-5 accent-principal-500"
                        checked={gestionSeleccionada === p.id}
                        onChange={() => {
                          if (gestionSeleccionada === p.id) {
                            // ✅ desmarcar
                            onSelectGestion(null);
                          } else {
                            // ✅ seleccionar y copiar
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
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
