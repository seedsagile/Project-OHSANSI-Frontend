import { type ReactNode, useEffect } from 'react';
import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import { DashboardIcon, UsersIcon, ClipboardIcon, FileTextIcon, LogoutIcon } from '../icons';
import { useAuth } from '../../auth/login/hooks/useAuth';
import { IconoUsuario } from '../../features/inscritos/components/IconoUsuario';

const NavLink = ({ to, icon, label, onClick }: { to: string; icon: ReactNode; label: string, onClick: () => void }) => {
    return (
        <RouterNavLink
            to={to}
            onClick={onClick}
            className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                isActive
                    ? 'bg-blanco text-principal-600'
                    : 'text-principal-100 hover:bg-principal-600 hover:text-blanco'
                }`
            }
        >
            {icon}
            <span>{label}</span>
        </RouterNavLink>
    );
};

interface SidebarProps {
    isOpen: boolean;
    setOpen: (isOpen: boolean) => void;
}

export function Sidebar({ isOpen, setOpen }: SidebarProps) {
    const location = useLocation();
    // 2. Llama al hook para obtener el usuario y la función de logout
    const { user, logout } = useAuth();

    useEffect(() => {
        setOpen(false);
    }, [location.pathname, setOpen]);

    return (
        <>
            <div 
                className={`fixed inset-0 bg-black/50 z-20 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setOpen(false)}
            />
            <aside 
                className={`
                    fixed top-0 left-0 w-72 h-screen bg-principal-700 text-blanco flex flex-col p-4 shadow-lg
                    transform transition-transform duration-300 ease-in-out z-30
                    lg:translate-x-0
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                <div className="flex items-center justify-between pt-6 pb-10">
                    <div className="flex flex-col items-center flex-grow">
                        <img 
                            src="/img/Logo oficial.jpg" 
                            alt="Logo Oh! SanSi" 
                            className="h-32 w-32 rounded-full object-cover border-4 border-principal-500 shadow-md" 
                        />
                        <span className="text-2xl font-bold tracking-tighter text-blanco mt-4">
                            Oh! SanSi
                        </span>
                    </div>
                    <button
                        onClick={() => setOpen(false)}
                        className="lg:hidden absolute top-4 right-4 p-2 text-principal-200 hover:text-blanco"
                        aria-label="Cerrar menú"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <nav className="flex-grow flex flex-col gap-2 overflow-y-auto lg:overflow-y-visible">
                    {/* ... (Tus NavLinks no cambian) ... */}
                    <p className="px-3 text-xs font-semibold text-principal-300 uppercase tracking-wider">Principal</p>
                    <NavLink to="/dashboard" icon={<DashboardIcon />} label="Dashboard" onClick={() => setOpen(false)} />
                    <NavLink to="/competidores" icon={<UsersIcon />} label="Competidores" onClick={() => setOpen(false)} />
                    <p className="px-3 mt-4 text-xs font-semibold text-principal-300 uppercase tracking-wider">Gestión</p>
                    <NavLink to="/responsables" icon={<UsersIcon />} label="Responsables de Area" onClick={() => setOpen(false)} />
                    <NavLink to="/evaluadores" icon={<UsersIcon />} label="Evaluadores" onClick={() => setOpen(false)} />
                    <NavLink to="/areasNives" icon={<UsersIcon />} label="Areas y Niveles" onClick={() => setOpen(false)} />
                    <p className="px-3 mt-4 text-xs font-semibold text-principal-300 uppercase tracking-wider">Evaluación</p>
                    <NavLink to="/calificaciones" icon={<ClipboardIcon />} label="Calificaciones" onClick={() => setOpen(false)} />
                    <NavLink to="/parametrosCalificaciones" icon={<ClipboardIcon />} label="Parametros de Calificacion" onClick={() => setOpen(false)} />
                    <p className="px-3 mt-4 text-xs font-semibold text-principal-300 uppercase tracking-wider">Reportes</p>
                    <NavLink to="/reportes" icon={<FileTextIcon />} label="Generar Reportes" onClick={() => setOpen(false)} />
                </nav>

                <footer className="flex-shrink-0 border-t border-principal-600 pt-4 mt-4">
                    <div className="flex items-center gap-3 px-3">
                        <div className="h-10 w-10 rounded-full bg-principal-600 flex items-center justify-center flex-shrink-0">
                            <IconoUsuario />
                        </div>
                        <div>
                            <p className="font-semibold text-blanco truncate">{user?.name || 'Usuario'}</p>
                            <p className="text-sm text-principal-200 capitalize">{user?.role || 'Rol'}</p>
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
        </>
    );
}