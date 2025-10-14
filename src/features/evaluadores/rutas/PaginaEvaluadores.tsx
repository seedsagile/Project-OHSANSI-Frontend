import { useState } from 'react';
import { FormularioEvaluador } from '../componentes/FormularioEvaluador';
import type { Evaluador, CrearEvaluadorData } from '../tipos';

export function PaginaEvaluadores() {
  const [evaluadores, setEvaluadores] = useState<Evaluador[]>([]);
  const [mostrandoFormulario, setMostrandoFormulario] = useState(true); // Por defecto mostrar el formulario

  const handleGuardarEvaluador = (datosEvaluador: CrearEvaluadorData) => {
    const nuevoEvaluador: Evaluador = {
      id: evaluadores.length + 1,
      ...datosEvaluador,
    };

    setEvaluadores([...evaluadores, nuevoEvaluador]);

    // Mostrar mensaje de éxito (puedes reemplazar con toast más adelante)
    alert(`Evaluador "${nuevoEvaluador.name}" creado exitosamente`);

    // Opcional: limpiar el formulario o cambiar vista
    // setMostrandoFormulario(false);
  };

  const handleCancelar = () => {
    // Opcional: cambiar a una vista de lista o limpiar formulario
    console.log('Operación cancelada');
  };

  return (
    <div className="min-h-screen bg-white">
      {mostrandoFormulario ? (
        <div className="py-8">
          <FormularioEvaluador onGuardar={handleGuardarEvaluador} onCancelar={handleCancelar} />
        </div>
      ) : (
        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Lista de Evaluadores</h1>
              <button
                onClick={() => setMostrandoFormulario(true)}
                className="px-4 py-2 bg-gray-800 text-white hover:bg-gray-700 transition-colors"
              >
                Nuevo Evaluador
              </button>
            </div>

            {evaluadores.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No hay evaluadores registrados</div>
            ) : (
              <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nombre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        CI
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Código Acceso
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {evaluadores.map((evaluador) => (
                      <tr key={evaluador.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {evaluador.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {evaluador.emailStudent}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {evaluador.ci}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {evaluador.codigoAcceso}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
