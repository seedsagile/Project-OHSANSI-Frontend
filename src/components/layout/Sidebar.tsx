// src/components/layout/Sidebar.tsx

import { type ReactNode, useEffect, useMemo } from 'react';
import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  LayoutGrid,
  Network,
  Link2,
  UserCheck,
  UserSquare,
  UserPlus,
  Medal,
  ListChecks,
  SlidersHorizontal,
  LogOut,
  Settings,
  FileText
} from 'lucide-react';

// --- Hooks y Contextos ---
import { useAuth } from '@/auth/login/hooks/useAuth';
import { useSystem } from '@/context/SystemContext';

// --- Constantes y Configuración ---
import { MODULES, type ModuleCode } from '@/config/modules';

// --- Componentes UI ---
import { IconoUsuario } from '@/components/ui/IconoUsuario';

// ----------------------------------------------------------------------
// Tipos para la configuración del menú
// ----------------------------------------------------------------------
interface MenuItem {
  to: string;
  icon: ReactNode;
  label: string;
  permission?: ModuleCode | null; // null o undefined = público/siempre visible
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

// ----------------------------------------------------------------------
// Sub-componente: Enlace del Sidebar (NavLink)
// ----------------------------------------------------------------------
const SidebarLink = ({
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
            ? 'bg-blanco text-principal-600 shadow-sm'
            : 'text-principal-100 hover:bg-principal-600 hover:text-blanco hover:shadow-inner'
        }`
      }
    >
      <div className="flex-shrink-0 w-5 h-5">{icon}</div>
      <span className="truncate">{label}</span>
    </RouterNavLink>
  );
};

// ----------------------------------------------------------------------
// Sub-componente: Skeleton Loading (Estado de carga)
// ----------------------------------------------------------------------
const SidebarSkeleton = () => (
  <div className="flex flex-col gap-4 mt-4 animate-pulse px-3">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="space-y-2">
        <div className="h-3 w-20 bg-white/20 rounded ml-2" />
        <div className="h-10 w-full bg-white/10 rounded-lg" />
        <div className="h-10 w-full bg-white/10 rounded-lg" />
      </div>
    ))}
  </div>
);

// ----------------------------------------------------------------------
// Componente Principal: Sidebar
// ----------------------------------------------------------------------
interface SidebarProps {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
  isDesktopVisible: boolean;
}

export function Sidebar({ isOpen, setOpen, isDesktopVisible }: SidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  // Consumimos el contexto del sistema para verificar permisos
  const { can, isLoading } = useSystem();

  // Cerrar sidebar en móvil al navegar
  useEffect(() => {
    setOpen(false);
  }, [location.pathname, setOpen]);

  /**
   * CONFIGURACIÓN DEL MENÚ
   */
  const menuGroups: MenuGroup[] = useMemo(() => [
    {
      title: 'Principal',
      items: [
        { 
          to: '/dashboard', 
          icon: <LayoutDashboard />, 
          label: 'Dashboard', 
          permission: null // Siempre visible
        },
      ],
    },
    {
      title: 'Gestión de la Olimpiada',
      items: [
        { 
          to: '/areas', 
          icon: <LayoutGrid />, 
          label: 'Áreas', 
          permission: MODULES.GESTION_AREAS 
        },
        { 
          to: '/niveles', 
          icon: <Network />, 
          label: 'Niveles', 
          permission: MODULES.GESTION_NIVELES 
        },
        { 
          to: '/asignarNiveles', 
          icon: <Link2 />, 
          label: 'Asignar Niveles', 
          permission: MODULES.ASIGNACION_NIVELES 
        },
      ],
    },
    {
      title: 'Gestión de Usuarios',
      items: [
        { 
          to: '/responsables', 
          icon: <UserCheck />, 
          label: 'Responsables de Área', 
          permission: MODULES.GESTION_RESPONSABLES 
        },
        { 
          to: '/evaluadores', 
          icon: <UserSquare />, 
          label: 'Evaluadores', 
          permission: MODULES.GESTION_EVALUADORES 
        },
      ],
    },
    {
      title: 'Gestión de Competidores',
      items: [
        { 
          to: '/competidores', 
          icon: <UserPlus />, 
          label: 'Registrar Competidores', 
          permission: MODULES.IMPORTAR_COMPETIDORES 
        },
        { 
          to: '/listaCompetidores', 
          icon: <ListChecks />, 
          label: 'Lista de Competidores', 
          permission: MODULES.LISTA_COMPETIDORES 
        },
      ],
    },
    {
      title: 'Evaluación y Clasificación',
      items: [
        { 
          to: '/evaluaciones', 
          icon: <FileText />, 
          label: 'Registrar Evaluación', 
          permission: MODULES.EVALUACION_COMPETIDORES
        },
        { 
          to: '/parametrosCalificaciones', 
          icon: <SlidersHorizontal />, 
          label: 'Parámetros de Calificación', 
          permission: MODULES.PARAMETROS_CLASIFICACION 
        },
        { 
          to: '/medallero', 
          icon: <Medal />, 
          label: 'Parametrizar Medallero', 
          permission: MODULES.PARAMETRIZAR_MEDALLERO 
        },
      ],
    },
    {
      title: 'Configuraciones',
      items: [
        { 
          to: '/configuracionFasesGlobales', 
          icon: <Settings />, 
          label: 'Configuración de Croonograma de Fases', 
          permission: MODULES.CONFIG_FASES
        },
        {
          to: '/configuracionSubFases',
          icon: <Settings />,
          label: 'Configuración Sub-Fases',
          permission: MODULES.ADMINISTRACION_SUBFASES
        }
      ],
      },
    {
      title: 'Reportes',
      items: [
        { 
          to: '/reportesCambiosCalificaciones', 
          icon: <FileText />, 
          label: 'Reporte de Cambios de Calificaciones', 
          permission: MODULES.AUDITORIA_CAMBIOS
        },
      ],
    },

  ], []);

  return (
    <>
      {/* Overlay para Móvil */}
      <div
        className={`fixed inset-0 bg-black/50 z-20 transition-opacity lg:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Aside Principal */}
      <aside
        className={`
          fixed top-0 left-0 w-64 lg:w-72 h-screen bg-principal-700 text-blanco flex flex-col p-4 shadow-2xl
          transform transition-transform duration-300 ease-out z-30
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isDesktopVisible ? 'lg:translate-x-0' : 'lg:-translate-x-full'}
        `}
      >
        {/* Header del Sidebar (Logo) */}
        <div className="flex items-center justify-between pt-6 pb-6 lg:pb-10 flex-shrink-0">
          <div className="flex flex-col items-center flex-grow">
            <div className="relative">
               <img
                src="/img/Logo oficial.jpg"
                alt="Logo Oh! SanSi"
                className="h-24 w-24 rounded-full object-cover border-4 border-principal-500 shadow-md"
              />
              <div className="absolute inset-0 rounded-full border border-white/10 pointer-events-none"></div>
            </div>
            <span className="text-xl lg:text-2xl font-bold tracking-tight text-blanco mt-3 text-center drop-shadow-sm">
              Oh! SanSi
            </span>
          </div>
          
          {/* Botón Cerrar (Móvil) */}
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden absolute top-4 right-4 p-2 text-principal-200 hover:text-blanco hover:bg-white/10 rounded-full transition-colors"
            aria-label="Cerrar menú"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Navegación Scrollable */}
        <nav className="flex-grow flex flex-col gap-1 overflow-y-auto pr-1 custom-scrollbar">
          
          {isLoading ? (
            <SidebarSkeleton />
          ) : (
            menuGroups.map((group, index) => {
              // 1. Filtramos los items que el usuario puede ver
              // CORRECCIÓN AQUÍ: Usamos !item.permission para cubrir null y undefined
              const visibleItems = group.items.filter((item) => {
                if (!item.permission) return true; // Si es null/undefined, es público
                return can(item.permission);       // Si tiene string, validamos
              });

              // 2. Si no hay items visibles en este grupo, no renderizamos el título ni el grupo
              if (visibleItems.length === 0) return null;

              return (
                <div key={index} className="mb-4">
                  <p className="px-3 text-xs font-bold text-principal-300 uppercase tracking-widest mb-2 mt-2">
                    {group.title}
                  </p>
                  <div className="space-y-1">
                    {visibleItems.map((item) => (
                      <SidebarLink
                        key={item.to}
                        to={item.to}
                        icon={item.icon}
                        label={item.label}
                        onClick={() => setOpen(false)}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </nav>

        {/* Footer (Perfil y Logout) */}
        <footer className="flex-shrink-0 border-t border-principal-600 pt-4 mt-4">
          <div className="flex items-center gap-3 px-3 p-2 rounded-lg hover:bg-principal-600/50 transition-colors cursor-default">
            <div className="h-10 w-10 rounded-full bg-principal-600 flex items-center justify-center flex-shrink-0 shadow-inner text-principal-100">
              <IconoUsuario />
            </div>
            <div className="overflow-hidden">
              <p className="font-semibold text-blanco text-sm truncate w-full leading-tight">
                {user?.nombre || 'Usuario'} {user?.apellido}
              </p>
              <p className="text-xs text-principal-200 capitalize truncate w-full mt-0.5">
                {user?.role || 'Rol'}
              </p>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 mt-2 rounded-lg font-medium text-principal-100 hover:bg-acento-500 hover:text-white hover:shadow-md transition-all duration-200 group"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span>Cerrar Sesión</span>
          </button>
        </footer>
      </aside>

      {/* Estilos para scrollbar personalizado en webkit */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(255, 255, 255, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(255, 255, 255, 0.4); }
      `}</style>
    </>
  );
}