import { type ReactNode, useEffect } from 'react';
import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  LogOut,
  Shapes,
  Signal,
  Link2,
  Briefcase,
  UserCheck,
  UserPlus,
  Users,
  Trophy,
  FileQuestion,
  ClipboardCheck,
  SlidersHorizontal,
  Medal,
  Settings2,
  CalendarRange,
  History
} from 'lucide-react';
import { useAuth } from '@/auth/login/hooks/useAuth';
import { IconoUsuario } from '@/components/ui/IconoUsuario';

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
        `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200 group ${
          isActive
            ? 'bg-blanco text-principal-600 shadow-sm translate-x-1'
            : 'text-principal-100 hover:bg-principal-600 hover:text-blanco hover:translate-x-1'
        }`
      }
    >
      <div className="flex-shrink-0 w-5 h-5">{icon}</div>
      <span className="truncate">{label}</span>
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
  const { user, logout } = useAuth();
  
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
          fixed top-0 left-0 w-64 lg:w-72 h-screen bg-principal-700 text-blanco flex flex-col p-4 shadow-2xl
          transform transition-transform duration-300 ease-in-out z-30 border-r border-principal-600
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isDesktopVisible ? 'lg:translate-x-0' : 'lg:-translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between pt-6 pb-8 flex-shrink-0">
          <div className="flex flex-col items-center flex-grow group cursor-default">
            <div className="relative">
              <img
                src="/img/Logo oficial.jpg"
                alt="Logo Oh! SanSi"
                className="h-20 w-20 rounded-full object-cover border-4 border-principal-500 shadow-lg group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 rounded-full shadow-inner pointer-events-none border border-white/10"></div>
            </div>
            <span className="text-xl font-bold tracking-tight text-blanco mt-3 truncate w-full text-center drop-shadow-sm">
              Oh! SanSi
            </span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden absolute top-4 right-4 p-2 text-principal-200 hover:text-blanco transition-colors"
            aria-label="Cerrar menú"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /> <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav className="flex-grow flex flex-col gap-1 overflow-y-auto pr-1 custom-scrollbar pb-4">
          
          <div className="mb-2">
            <NavLink
              to="/dashboard"
              icon={<LayoutDashboard />}
              label="Dashboard"
              onClick={() => setOpen(false)}
            />
          </div>

          {/* ----- Gestión de la Olimpiada ----- */}
          <p className="px-3 mt-4 mb-2 text-[10px] font-bold text-principal-300 uppercase tracking-widest opacity-80">
            Gestión de la Olimpiada
          </p>
          <NavLink to="/areas" icon={<Shapes />} label="Áreas" onClick={() => setOpen(false)} />
          <NavLink to="/niveles" icon={<Signal />} label="Niveles" onClick={() => setOpen(false)} />
          <NavLink to="/asignarNiveles" icon={<Link2 />} label="Asignar Niveles a Áreas" onClick={() => setOpen(false)} />

          {/* ----- Gestión de Usuarios ----- */}
          <p className="px-3 mt-4 mb-2 text-[10px] font-bold text-principal-300 uppercase tracking-widest opacity-80">
            Gestión de Usuarios
          </p>
          <NavLink to="/responsables" icon={<Briefcase />} label="Responsables de Área" onClick={() => setOpen(false)} />
          <NavLink to="/evaluadores" icon={<UserCheck />} label="Evaluadores" onClick={() => setOpen(false)} />

          {/* ----- Gestión de Competidores ----- */}
          <p className="px-3 mt-4 mb-2 text-[10px] font-bold text-principal-300 uppercase tracking-widest opacity-80">
            Gestión de Competidores
          </p>
          <NavLink to="/competidores" icon={<UserPlus />} label="Registrar Competidores" onClick={() => setOpen(false)} />
          <NavLink to="/listaCompetidores" icon={<Users />} label="Lista de Competidores" onClick={() => setOpen(false)} />

          {/* ----- Evaluación y Clasificación ----- */}
          <p className="px-3 mt-4 mb-2 text-[10px] font-bold text-principal-300 uppercase tracking-widest opacity-80">
            Evaluación y Clasificación
          </p>
          <NavLink to="/competencias" icon={<Trophy />} label="Registrar competencia" onClick={() => setOpen(false)} />
          <NavLink to="/examenes" icon={<FileQuestion />} label="Exámenes" onClick={() => setOpen(false)} />
          <NavLink to="/evaluaciones" icon={<ClipboardCheck />} label="Registrar Evaluación" onClick={() => setOpen(false)} />
          <NavLink to="/parametrosCalificaciones" icon={<SlidersHorizontal />} label="Parámetros de Clasificación" onClick={() => setOpen(false)} />
          <NavLink to="/medallero" icon={<Medal />} label="Parametrizar Medallero" onClick={() => setOpen(false)} />

          {/* ----- Configuraciones ----- */}
          <p className="px-3 mt-4 mb-2 text-[10px] font-bold text-principal-300 uppercase tracking-widest opacity-80">
            Configuraciones
          </p>
          <NavLink to="/configuracionFasesGlobales" icon={<Settings2 />} label="Configuración de Actividades de Fases" onClick={() => setOpen(false)} />
          <NavLink to="/cronograma" icon={<CalendarRange />} label="Configuración de Cronograma" onClick={() => setOpen(false)} />

          {/* ----- Reportes ----- */}
          <p className="px-3 mt-4 mb-2 text-[10px] font-bold text-principal-300 uppercase tracking-widest opacity-80">
            Reportes
          </p>
          <NavLink to="/reportesCambiosCalificaciones" icon={<History />} label="Reporte de cambio de calificaciones" onClick={() => setOpen(false)} />
        </nav>
        
        <footer className="flex-shrink-0 border-t border-principal-600 pt-4 mt-2 bg-principal-700">
          <div className="flex items-center gap-3 px-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-principal-800 border border-principal-500 flex items-center justify-center flex-shrink-0 shadow-sm text-principal-200">
              <IconoUsuario />
            </div>
            <div className="overflow-hidden">
              <p className="font-bold text-blanco text-sm truncate w-full leading-tight">
                {user?.nombre || 'Usuario'}
              </p>
              <p className="text-xs text-principal-300 capitalize truncate w-full mt-0.5">
                {user?.role || 'Rol'}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-semibold text-xs uppercase tracking-wide text-principal-100 hover:bg-acento-600 hover:text-white transition-all duration-200 bg-principal-800/50"
          >
            <LogOut size={16} />
            <span>Cerrar Sesión</span>
          </button>
        </footer>
      </aside>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(255, 255, 255, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(255, 255, 255, 0.4); }
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(255, 255, 255, 0.2) transparent; }
      `}</style>
    </>
  );
}