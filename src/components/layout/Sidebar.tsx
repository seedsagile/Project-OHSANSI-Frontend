import { type ReactNode } from 'react';
import { NavLink as RouterNavLink } from 'react-router-dom';
import { DashboardIcon, UsersIcon, ClipboardIcon, FileTextIcon, LogoutIcon } from '../icons';
const NavLink = ({ to, icon, label }: { to: string; icon: ReactNode; label: string }) => {
    return (
        <RouterNavLink
            to={to}
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

export function Sidebar() {
    return (
        <aside className="w-72 h-screen bg-principal-700 text-blanco flex flex-col p-4 shadow-lg">
            
            {/* 1. SECCIÓN DEL LOGO */}
            <div className="flex flex-col items-center justify-center pt-6 pb-10">
                <img 
                    src="/img/Logo oficial.jpg" 
                    alt="Logo Oh! SanSi" 
                    className="h-35 w-35 rounded-full object-cover border-4 border-principal-500 shadow-md" 
                />
                    {/* Título debajo del logo */}
                    <span className="text-2xl font-bold tracking-tighter text-blanco mt-4">
                    Oh! SanSi
                    </span>
            </div>

            {/* 2. Navegación Principal */}
            <nav className="flex-grow flex flex-col gap-2">
                <p className="px-3 text-xs font-semibold text-principal-300 uppercase tracking-wider">Principal</p>
                <NavLink to="/dashboard" icon={<DashboardIcon />} label="Dashboard" />
                <NavLink to="/competidores" icon={<UsersIcon />} label="Competidores" />

                <p className="px-3 mt-4 text-xs font-semibold text-principal-300 uppercase tracking-wider">Gestión</p>
                <NavLink to="/responsables" icon={<UsersIcon />} label="Responsables de Area" />
                <NavLink to="/evaluadores" icon={<UsersIcon />} label="Evaluadores" />
                <NavLink to="/areasNives" icon={<UsersIcon />} label="Areas y Niveles" />
                
                <p className="px-3 mt-4 text-xs font-semibold text-principal-300 uppercase tracking-wider">Evaluación</p>
                <NavLink to="/calificaciones" icon={<ClipboardIcon />} label="Calificaciones" />
                <NavLink to="/parametrosCalificaciones" icon={<ClipboardIcon />} label="Parametros de Calificacion" />
                
                <p className="px-3 mt-4 text-xs font-semibold text-principal-300 uppercase tracking-wider">Reportes</p>
                <NavLink to="/reportes" icon={<FileTextIcon />} label="Generar Reportes" />
            </nav>

            {/* 3. Sección de Usuario */}
            <div className="border-t border-principal-600 pt-4">
                <div className="flex items-center gap-3 px-3">
                    <img 
                        src="https://i.pravatar.cc/40?u=willian"
                        alt="Avatar de usuario"
                        className="h-10 w-10 rounded-full"
                    />
                    <div>
                        <p className="font-semibold text-blanco">Usuario</p>
                        <p className="text-sm text-principal-200">Rol</p>
                    </div>
                </div>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 mt-4 rounded-lg font-medium text-principal-100 hover:bg-acento-500/20 hover:text-acento-300 transition-colors">
                    <LogoutIcon />
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    );
}