import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useOlimpiadas } from '../hooks/useOlimpiadas';
import { SelectorOlimpiada } from './SelectorOlimpiada';
import { ModalNuevaOlimpiada } from './ModalNuevaOlimpiada';
import { olimpiadaService } from '../services/olimpiadaServices';
import { useAuth } from '@/auth/login/hooks/useAuth';

export default function GestionOlimpiadas() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();

  const { data: olimpiadas = [], isLoading, isError } = useOlimpiadas();

  // Verificar si el usuario es administrador
  const isAdmin = user?.role === 'administrador';

  // Mutación para activar olimpiada
  const mutationActivar = useMutation({
    mutationFn: olimpiadaService.activarOlimpiada,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['olimpiadas'] });
    },
    onError: (error: any) => {
      alert("Error al activar la olimpiada: " + (error.response?.data?.message || error.message));
    }
  });

  // Encontrar la olimpiada activa desde el API
  const olimpiadaActiva = olimpiadas.find(o => o.estado === true);

  // Handler para cuando se selecciona una olimpiada
  const handleSeleccionarOlimpiada = (id: string) => {
    // Solo permite cambiar si es administrador
    if (id && isAdmin) {
      mutationActivar.mutate(parseInt(id));
    }
  };

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
            olimpiadaActiva={olimpiadaActiva}
            onSelect={handleSeleccionarOlimpiada}
            isAdmin={isAdmin}
          />

          {isAdmin && (
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
        {/* TABLA GENERAL - SIEMPRE VISIBLE */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-400 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Nombre</th>
                <th className="px-6 py-4">Gestión</th>
                <th className="px-6 py-4 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {olimpiadas.map((olimp) => (
                <tr 
                  key={olimp.id} 
                  className={`transition-colors ${
                    olimp.estado ? 'bg-blue-50/60' : ''
                  } ${isAdmin ? 'hover:bg-blue-50/40 cursor-pointer' : ''}`}
                  onClick={() => isAdmin && handleSeleccionarOlimpiada(olimp.id.toString())}
                >
                  <td className="px-6 py-4 text-gray-400 font-mono text-sm">{olimp.id}</td>
                  <td className="px-6 py-4 font-bold text-gray-800">{olimp.nombre}</td>
                  <td className="px-6 py-4 text-gray-600">{olimp.gestion}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      olimp.estado ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {olimp.estado ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ModalNuevaOlimpiada 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}