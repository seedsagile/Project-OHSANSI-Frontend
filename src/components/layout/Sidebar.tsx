import { useState, type ReactNode } from 'react';
import { DashboardIcon, UsersIcon, ClipboardIcon, FileTextIcon, SettingsIcon, LogoutIcon } from '../icons';

type NavLinkProps = {
    icon: ReactNode;
    label: string;
    href: string;
    isActive?: boolean;
};

const NavLink = ({ icon, label, href, isActive = false }: NavLinkProps) => {
    const activeClasses = isActive ? 'bg-principal-500 text-blanco' : 'text-neutro-400 hover:bg-neutro-700 hover:text-blanco';
    
    return (
        <a href={href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${activeClasses}`}>
        {icon}
        <span>{label}</span>
        </a>
    );
};

// --- Componente principal del Sidebar ---
export function Sidebar() {
    // En una aplicación real, el estado activo vendría de la ruta actual
    const [activeLink] = useState('/dashboard'); 

    return (
        <aside className="w-72 h-screen bg-neutro-800 text-blanco flex flex-col p-4">
        
        {/* 1. Sección del Logo */}
        <div className="flex items-center gap-3 px-3 py-2.5 mb-8">
            <img src="/public/img/Logo oficial.jpg" alt="Logo Oh! SanSi" className="h-10 w-10 rounded-full" />
            <span className="text-xl font-bold tracking-tighter">Olimpiada SanSi</span>
        </div>

        {/* 2. Navegación Principal */}
        <nav className="flex-grow flex flex-col gap-2">
            <p className="px-3 text-xs font-semibold text-neutro-500 uppercase tracking-wider">Principal</p>
            <NavLink icon={<DashboardIcon />} label="Dashboard" href="/dashboard" isActive={activeLink === '/dashboard'} />
            <NavLink icon={<UsersIcon />} label="Competidores" href="/competidores" isActive={activeLink === '/competidores'} />

            <p className="px-3 mt-4 text-xs font-semibold text-neutro-500 uppercase tracking-wider">Gestión</p>
            <NavLink icon={<UsersIcon />} label="Responsables" href="/responsables" isActive={activeLink === '/responsables'} />
            <NavLink icon={<UsersIcon />} label="Evaluadores" href="/evaluadores" isActive={activeLink === '/evaluadores'} />
            <NavLink icon={<SettingsIcon />} label="Parámetros" href="/parametros" isActive={activeLink === '/parametros'} />
            
            <p className="px-3 mt-4 text-xs font-semibold text-neutro-500 uppercase tracking-wider">Evaluación</p>
            <NavLink icon={<ClipboardIcon />} label="Calificaciones" href="/calificaciones" isActive={activeLink === '/calificaciones'} />
            
            <p className="px-3 mt-4 text-xs font-semibold text-neutro-500 uppercase tracking-wider">Reportes</p>
            <NavLink icon={<FileTextIcon />} label="Generar Reportes" href="/reportes" isActive={activeLink === '/reportes'} />
        </nav>

        {/* 3. Sección de Usuario */}
        <div className="border-t border-neutro-700 pt-4">
            <div className="flex items-center gap-3 px-3">
            <img 
                src="https://avatar.placeholder.iran.liara.run/public/12" // Avatar genérico
                alt="Avatar de usuario"
                className="h-10 w-10 rounded-full"
            />
            <div>
                <p className="font-semibold text-blanco">Willian Almendras</p>
                <p className="text-sm text-neutro-400">Administrador</p>
            </div>
            </div>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 mt-4 rounded-lg font-medium text-neutro-400 hover:bg-acento-500/20 hover:text-acento-400 transition-colors">
            <LogoutIcon />
            <span>Cerrar Sesión</span>
            </button>
        </div>
        </aside>
    );
}