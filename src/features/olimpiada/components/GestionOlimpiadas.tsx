import { useState } from 'react';
import { 
  Plus, 
  Trophy, 
  Edit, 
  Trash2, 
  X, 
  Save, 
  Search} from 'lucide-react';

export default function GestionOlimpiadas() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Datos basados en tu tabla de base de datos
  const olimpiadas = [
    { id_olimpiada: 1, nombre: "Olimpiada Científica 2025", gestion: "2025", estado: 1 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      
      {/* --- ENCABEZADO --- */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Olimpiadas</h1>
          <p className="text-gray-500 mt-1">Gestión de eventos según registros del sistema</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-100 active:scale-95"
        >
          <Plus size={20} />
          Nueva Olimpiada
        </button>
      </div>

      {/* --- BARRA DE BÚSQUEDA --- */}
      <div className="max-w-7xl mx-auto mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o gestión..." 
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* --- TABLA --- */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Nombre de Olimpiada</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Gestión</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {olimpiadas.map((olimp) => (
                <tr key={olimp.id_olimpiada} className="hover:bg-blue-50/40 transition-colors group">
                  <td className="px-6 py-4 text-gray-400 font-mono text-sm">
                    {olimp.id_olimpiada}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-blue-100 text-blue-600 rounded-lg">
                        <Trophy size={18} />
                      </div>
                      <span className="font-bold text-gray-800">{olimp.nombre}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-medium">
                    {olimp.gestion}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      olimp.estado === 1 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {olimp.estado === 1 ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Editar"><Edit size={18} /></button>
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Borrar"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL SIMPLIFICADO (SOLO NOMBRE Y GESTIÓN) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
            <header className="px-8 py-6 flex justify-between items-center border-b border-gray-50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600 text-white rounded-2xl">
                  <Trophy size={24} />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Nueva Olimpiada</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                <X size={24} />
              </button>
            </header>

            <div className="p-8 space-y-5">
              {/* Campo Nombre */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Nombre</label>
                <input 
                  type="text" 
                  placeholder="Ej. Olimpiada Científica" 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" 
                />
              </div>

              {/* Campo Gestión */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                   Gestión
                </label>
                <input 
                  type="number" 
                  placeholder="2025" 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:border-blue-500 outline-none transition-all" 
                />
              </div>
            </div>

            <footer className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-4">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-gray-500 font-bold hover:text-gray-700 transition-colors">Cancelar</button>
              <button className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 flex items-center gap-2 shadow-xl shadow-blue-100 transition-all active:scale-95">
                <Save size={20} /> Guardar
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}