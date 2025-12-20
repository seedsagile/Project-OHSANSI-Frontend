import { useState } from 'react';
import { Trophy, X, Calendar, Save, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { olimpiadaService } from '../services/olimpiadaServices';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ModalNuevaOlimpiada = ({ isOpen, onClose }: Props) => {
  const queryClient = useQueryClient();
  
  // 1. Estados para capturar los datos
  const [nombre, setNombre] = useState('');
  const [gestion, setGestion] = useState(new Date().getFullYear().toString());

  // 2. Mutación para el POST
  const mutation = useMutation({
    mutationFn: olimpiadaService.crearOlimpiada,
    onSuccess: () => {
      // Refresca la tabla automáticamente
      queryClient.invalidateQueries({ queryKey: ['olimpiadas'] });
      setNombre(''); // Limpiar formulario
      onClose();     // Cerrar modal
    },
    onError: (error: any) => {
      alert("Error al crear la olimpiada: " + (error.response?.data?.message || error.message));
    }
  });

  if (!isOpen) return null;

  const handleGuardar = () => {
    if (!nombre.trim()) return alert("El nombre es obligatorio");
    mutation.mutate({ nombre, gestion });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        <header className="px-8 py-6 flex justify-between items-center border-b border-gray-50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200">
              <Trophy size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Nueva Olimpiada</h2>
              <p className="text-xs text-gray-400">Registrar nuevo evento</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            disabled={mutation.isPending}
            className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </header>

        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">Nombre de la Olimpiada</label>
            <input 
              type="text" 
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Olimpiada Científica" 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
               <Calendar size={16} className="text-blue-500" /> Gestión
            </label>
            <input 
              type="number" 
              value={gestion}
              onChange={(e) => setGestion(e.target.value)}
              placeholder="2025" 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" 
            />
          </div>
        </div>

        <footer className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button 
            onClick={onClose} 
            disabled={mutation.isPending}
            className="px-6 py-3 text-gray-500 font-bold hover:text-gray-700"
          >
            Cancelar
          </button>
          <button 
            onClick={handleGuardar}
            disabled={mutation.isPending}
            className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 flex items-center gap-2 shadow-xl shadow-blue-200 transition-all active:scale-95 disabled:opacity-50"
          >
            {mutation.isPending ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Save size={20} />
            )}
            {mutation.isPending ? 'Guardando...' : 'Guardar'}
          </button>
        </footer>
      </div>
    </div>
  );
};