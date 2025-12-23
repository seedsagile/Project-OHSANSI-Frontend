import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSistemaStore } from '@/features/sistema/stores/useSistemaStore';

export const AccessDenied = () => {
  const { getAccessDenialReason } = useSistemaStore();
  const { roles, fase } = getAccessDenialReason();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full text-center border-t-4 border-acento-500">
        
        <div className="bg-red-50 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-10 h-10 text-acento-500" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Acceso Restringido
        </h1>
        <p className="text-gray-500 mb-6">
          No tienes los permisos necesarios para realizar esta acción o ingresar a esta ruta.
        </p>

        <div className="bg-gray-50 rounded-lg p-5 text-left mb-6 border border-gray-200 shadow-inner">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">
            Contexto de tu Sesión
          </h3>
          
          <div className="mb-4">
            <span className="block text-xs font-semibold text-gray-500 mb-1">
              Tus Roles Activos:
            </span>
            <div className="flex flex-wrap gap-2">
              {roles.length > 0 ? (
                roles.map((rol) => (
                  <span 
                    key={rol} 
                    className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-principal-100 text-principal-700 border border-principal-200"
                  >
                    {rol}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-400 italic">Sin roles asignados</span>
              )}
            </div>
          </div>

          <div>
            <span className="block text-xs font-semibold text-gray-500 mb-1">
              Fase Actual del Sistema:
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
              {fase}
            </span>
          </div>
        </div>
        
        <Link
          to="/dashboard"
          className="inline-flex justify-center items-center w-full rounded-lg border border-transparent shadow-sm px-4 py-3 bg-negro text-base font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
        >
          Volver al Dashboard
        </Link>
      </div>
    </div>
  );
};