import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

// Este componente define la estructura visual principal: 
// Sidebar a la izquierda y el contenido de la página a la derecha.
export function RootLayout() {
    return (
        <div className="flex h-screen bg-neutro-100">
        <Sidebar />
            <main className="flex-1 overflow-y-auto">
                {/* Outlet renderizará el componente de la ruta activa (ej: Dashboard, PaginaAsignarResponsable) */}
                <Outlet />
            </main>
        </div>
    );
}