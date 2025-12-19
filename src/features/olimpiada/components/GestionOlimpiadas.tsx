import { useState } from 'react';
import { Plus, Trophy, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { useOlimpiadas } from '../hooks/useOlimpiadas';
import { SelectorOlimpiada } from './SelectorOlimpiada';
import { ModalNuevaOlimpiada } from './ModalNuevaOlimpiada';

export default function GestionOlimpiadas() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [idSeleccionado, setIdSeleccionado] = useState("");

  // Traemos los datos de la API
  const { data: olimpiadas = [], isLoading, isError } = useOlimpiadas();

  const olimpiadaActiva = olimpiadas.find(o => o.id.toString() === idSeleccionado);

  if (isLoading) return <div className="p-10 text-center font-bold text-blue-600">Cargando Olimpiadas...</div>;
  if (isError) return <div className="p-10 text-center text-red-500">Error al conectar con el servidor</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      
      {/* --- ENCABEZADO --- */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            {olimpiadaActiva ? olimpiadaActiva.nombre : "Olimpiadas"}
          </h1>
          <p className="text-gray-500 mt-1 font-medium">
            {olimpiadaActiva ? `Gestión ${olimpiadaActiva.gestion}` : "Panel de administración oficial"}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <SelectorOlimpiada 
            olimpiadas={olimpiadas} 
            seleccionada={idSeleccionado}
            onSelect={setIdSeleccionado}
          />

          {!olimpiadaActiva && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 whitespace-nowrap"
            >
              <Plus size={20} /> Nueva Olimpiada
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {olimpiadaActiva ? (
          /* PANEL DE CONTROL */
          <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-200 text-center animate-in slide-in-from-bottom-4">
            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Trophy size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-8">{olimpiadaActiva.nombre}</h2>
            <button onClick={() => setIdSeleccionado("")} className="flex items-center gap-2 mx-auto text-gray-400 hover:text-blue-600 font-bold transition-colors">
              <ArrowLeft size={20} /> Volver a la lista general
            </button>
          </div>
        ) : (
          /* TABLA GENERAL (Sin buscador por tu petición) */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-400 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Nombre</th>
                  <th className="px-6 py-4">Gestión</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {olimpiadas.map((olimp) => (
                  <tr 
                    key={olimp.id} 
                    className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                    onClick={() => setIdSeleccionado(olimp.id.toString())}
                  >
                    <td className="px-6 py-4 text-gray-400 font-mono text-sm">{olimp.id}</td>
                    <td className="px-6 py-4 font-bold text-gray-800">{olimp.nombre}</td>
                    <td className="px-6 py-4 text-gray-600">{olimp.gestion}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        olimp.esActual ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {olimp.esActual ? 'Actual' : 'Pasada'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-1">
                        <button className="p-2 text-gray-400 hover:text-blue-600"><Edit size={18} /></button>
                        <button className="p-2 text-gray-400 hover:text-red-600"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ModalNuevaOlimpiada 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}