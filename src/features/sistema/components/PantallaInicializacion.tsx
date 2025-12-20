import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Rocket, Loader2, Power, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { sistemaService } from '../services/sistemaService';
import { useAuthStore } from '@/auth/login/stores/authStore';
import { ModalError } from '@/components/ui/ModalError';

export const PantallaInicializacion = () => {
  const anioActual = new Date().getFullYear();
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);
  const [errorData, setErrorData] = useState<unknown>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: () => 
      sistemaService.inicializarGestion({ 
        nombre: `Olimpiada ${anioActual}`, 
        anio: String(anioActual), 
        activar: true 
      }),
    onSuccess: async (data) => {
      toast.success(data.message || `¡Gestión ${anioActual} creada! Redirigiendo...`);
      await queryClient.invalidateQueries({ queryKey: ['sistemaEstado'] });
      navigate('/configuracionCronograma', { replace: true });
    },
    onError: (error: any) => {
      console.error("Error al inicializar:", error);
      if (error.response?.status === 422) {
        const validationErrors = error.response.data.errors;
        if (validationErrors) {
          const firstField = Object.keys(validationErrors)[0];
          toast.error(`Error: ${validationErrors[firstField][0]}`);
        }
      }
      
      setErrorData(error);
      setShowErrorModal(true);
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-100 rounded-full blur-[100px] opacity-40" />
        <div className="absolute top-[30%] -right-[10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[100px] opacity-40" />
      </div>

      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 relative z-10 text-center space-y-6">
        
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 bg-blue-50 rounded-full animate-pulse" />
          <div className="bg-blue-100 text-blue-600 w-20 h-20 rounded-full flex items-center justify-center relative z-10 shadow-sm">
            <Rocket size={40} className={`${isPending ? 'animate-bounce' : ''}`} strokeWidth={1.5} />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Bienvenido al Sistema</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Inicialice el ciclo {anioActual} para comenzar la configuración del cronograma.
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex items-center justify-between">
          <div className="text-left">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nueva Gestión</p>
            <p className="text-lg font-bold text-gray-800">Olimpiada {anioActual}</p>
          </div>
          <div className="bg-white px-3 py-1 rounded-md border border-gray-200 shadow-sm">
            <span className="text-sm font-mono text-gray-600 font-bold">{anioActual}</span>
          </div>
        </div>

        <div className="flex items-start gap-3 text-left bg-amber-50 p-3 rounded-lg border border-amber-100">
          <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={16} />
          <p className="text-xs text-amber-700">
            Al inicializar, se configurará la estructura base del sistema y se activará el cronograma inicial.
          </p>
        </div>

        <button
          onClick={() => mutate()}
          disabled={isPending}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`
            w-full py-3.5 px-6 rounded-xl font-bold text-white shadow-lg shadow-blue-500/20
            transition-all duration-300 transform flex items-center justify-center gap-2
            ${isPending 
              ? 'bg-gray-400 cursor-not-allowed scale-[0.98]' 
              : 'bg-blue-600 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98]'
            }
          `}
        >
          {isPending ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>Configurando...</span>
            </>
          ) : (
            <>
              <span>Inicializar Gestión {anioActual}</span>
              <Rocket 
                size={18} 
                className={`transition-transform duration-300 ${isHovered ? 'translate-x-1 -translate-y-1' : ''}`} 
              />
            </>
          )}
        </button>

        <button 
          onClick={() => { logout(); window.location.href = '/login'; }}
          className="text-gray-400 hover:text-gray-600 text-xs font-medium flex items-center justify-center gap-1 mx-auto mt-4 transition-colors"
        >
          <Power size={14} />
          Cerrar sesión
        </button>
      </div>
      
      <p className="absolute bottom-4 text-gray-400 text-xs text-center w-full">
        Sistema de Gestión de Olimpiadas &copy; {anioActual}
      </p>

      <ModalError 
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        error={errorData}
      />
    </div>
  );
};