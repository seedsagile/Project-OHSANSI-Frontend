import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

const HamburgerIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

export function RootLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const mainContentPaddingClass = isSidebarVisible ? 'lg:pl-72' : 'lg:pl-0';

  const handleToggleDesktopSidebar = () => {
    setIsSidebarVisible(prev => !prev);
    if (isSidebarVisible) {
        setSidebarOpen(false);
    }
  };

  return (
    <div className="relative min-h-screen flex">
      {/* Componente Sidebar */}
      <Sidebar
          isOpen={isSidebarOpen}
          setOpen={setSidebarOpen}
          isDesktopVisible={isSidebarVisible}
      />

      <main className={`flex-1 overflow-y-auto ${mainContentPaddingClass} transition-all duration-300 ease-in-out bg-blanco`}>
        <button
          onClick={handleToggleDesktopSidebar}
          className="fixed top-4 left-4 z-40 p-2 bg-principal-700 text-blanco rounded-md hover:bg-principal-600 hidden lg:block"
          aria-label="Alternar barra lateral"
        >
          <HamburgerIcon />
        </button>

        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-40 p-2 bg-principal-700 text-blanco rounded-md hover:bg-principal-600 lg:hidden" // `lg:hidden` lo oculta en lg+
          aria-label="Abrir menú"
        >
          <HamburgerIcon />
        </button>

        <div className="pt-16 px-4 md:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}