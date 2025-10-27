import { type ReactNode, useEffect } from 'react';
import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard as DashboardIcon,
  LayoutGrid,
  Network,
  Link2,
  UserCheck,
  UserSquare,
  UserPlus,
  ListChecks,
  SlidersHorizontal,
  LogOut as LogoutIcon,
  Cog as SettingsIcon 
} from 'lucide-react';
import { useAuth } from '../../auth/login/hooks/useAuth';
import { IconoUsuario } from '../ui/IconoUsuario';

const NavLink = ({
  to,
  icon,
  label,
  onClick,
}: {
  to: string;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) => {
  return (
    <RouterNavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors group ${
          isActive
            ? 'bg-blanco text-principal-600'
            : 'text-principal-100 hover:bg-principal-600 hover:text-blanco'
        }`
      }
    >
      <div className='flex-shrink-0 w-5 h-5'>{icon}</div>
      <span className='truncate'>{label}</span>
    </RouterNavLink>
  );
};
interface SidebarProps {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
  isDesktopVisible: boolean;
}

export function Sidebar({ isOpen, setOpen, isDesktopVisible }: SidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuth(); //

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, setOpen]);

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-20 transition-opacity lg:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setOpen(false)}
      />
      <aside
        className={`
          fixed top-0 left-0 w-64 lg:w-72 h-screen bg-principal-700 text-blanco flex flex-col p-4 shadow-lg
          transform transition-transform duration-300 ease-in-out z-30
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isDesktopVisible ? 'lg:translate-x-0' : 'lg:-translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between pt-6 pb-6 lg:pb-10 flex-shrink-0">
          <div className="flex flex-col items-center flex-grow">
            <img
              src="/img/Logo oficial.jpg"
              alt="Logo Oh! SanSi"
              className="h-24 w-24 rounded-full object-cover border-4 border-principal-500 shadow-md"
            />
            <span className="text-xl lg:text-2xl font-bold tracking-tighter text-blanco mt-3 truncate w-full text-center">
              Oh! SanSi
            </span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden absolute top-4 right-4 p-2 text-principal-200 hover:text-blanco"
            aria-label="Cerrar menú"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" >
              <line x1="18" y1="6" x2="6" y2="18" /> <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav className="flex-grow flex flex-col gap-1.5 overflow-y-auto pr-1 custom-scrollbar">
          <p className="px-3 text-xs font-semibold text-principal-300 uppercase tracking-wider mt-2 mb-1"> 
            Principal
          </p>
          <NavLink to="/dashboard" icon={<DashboardIcon />} label="Dashboard" onClick={() => setOpen(false)} />

          {/* ----- Gestión de la Olimpiada ----- */}
          <p className="px-3 text-xs font-semibold text-principal-300 uppercase tracking-wider mt-3 mb-1"> 
            Gestión de la Olimpiada
          </p>
          <NavLink to="/areas" icon={<LayoutGrid />} label="Áreas" onClick={() => setOpen(false)} /> 
          <NavLink to="/niveles" icon={<Network />} label="Niveles" onClick={() => setOpen(false)} /> 
          <NavLink to="/asignarNiveles" icon={<Link2 />} label="Asignar Niveles a Áreas" onClick={() => setOpen(false)} /> 

          {/* ----- Gestión de Usuarios ----- */}
          <p className="px-3 mt-3 mb-1 text-xs font-semibold text-principal-300 uppercase tracking-wider">
            Gestión de Usuarios
          </p>
          <NavLink to="/responsables" icon={<UserCheck />} label="Responsables de Área" onClick={() => setOpen(false)} />
          <NavLink to="/evaluadores" icon={<UserSquare />} label="Evaluadores" onClick={() => setOpen(false)} />

          {/* ----- Gestión de Competidores ----- */}
          <p className="px-3 mt-3 mb-1 text-xs font-semibold text-principal-300 uppercase tracking-wider">
            Gestión de Competidores
          </p>
          <NavLink to="/competidores" icon={<UserPlus />} label="Registrar Competidores" onClick={() => setOpen(false)} />
          <NavLink to="/listaCompetidores" icon={<ListChecks />} label="Lista de Competidores" onClick={() => setOpen(false)} />

          {/* ----- Evaluación y Clasificación ----- */}
          <p className="px-3 mt-3 mb-1 text-xs font-semibold text-principal-300 uppercase tracking-wider">
            Evaluación y Clasificación
          </p>
          <NavLink to="/parametrosCalificaciones" icon={<SlidersHorizontal />} label="Parámetros de Calificación" onClick={() => setOpen(false)} />
        
          {/* ----- Configuraciones ----- */}
          <p className="px-3 mt-3 mb-1 text-xs font-semibold text-principal-300 uppercase tracking-wider">
            Configuraciones
          </p>
          <NavLink to="/configuracion_gestestion_olimpiada" icon={<SettingsIcon /> } label="Configuración de la Olimpiada" onClick={() => setOpen(false)} />
        
        </nav>

        {/* Footer */}
        <footer className="flex-shrink-0 border-t border-principal-600 pt-4 mt-4">
          <div className="flex items-center gap-3 px-3">
            <div className="h-10 w-10 rounded-full bg-principal-600 flex items-center justify-center flex-shrink-0">
              <IconoUsuario />
            </div>
            <div className='overflow-hidden whitespace-nowrap'>
              <p className="font-semibold text-blanco truncate w-full">{user?.nombre || 'Usuario'}</p>
              <p className="text-sm text-principal-200 capitalize truncate w-full">{user?.role || 'Rol'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 mt-4 rounded-lg font-medium text-principal-100 hover:bg-acento-500/20 hover:text-acento-300 transition-colors"
          >
            <LogoutIcon />
            <span>Cerrar Sesión</span>
          </button>
        </footer>
      </aside>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(255, 255, 255, 0.3); border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(255, 255, 255, 0.5); }
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(255, 255, 255, 0.3) transparent; }
      `}</style>
    </>
  );
}