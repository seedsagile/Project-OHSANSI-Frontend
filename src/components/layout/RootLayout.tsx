import { useState, ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { SystemStatusBar } from './SystemStatusBar';
import { cn } from '@/utils/cn';

const HamburgerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

interface RootLayoutProps {
  children?: ReactNode;
}

export function RootLayout({ children }: RootLayoutProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const mainContentPaddingClass = isSidebarVisible ? 'lg:pl-72' : 'lg:pl-0';

  return (
    <div className="relative min-h-screen flex bg-slate-50 overflow-hidden">
      <Sidebar 
        isOpen={isSidebarOpen} 
        setOpen={setSidebarOpen} 
        isDesktopVisible={isSidebarVisible} 
      />

      <main className={cn(
        "flex-1 flex flex-col h-screen transition-all duration-300 ease-in-out bg-blanco",
        mainContentPaddingClass
      )}>
        {/* HEADER */}
        <header className="h-14 border-b border-slate-100 flex items-center px-4 shrink-0 bg-blanco sticky top-0 z-40">
          <div className="flex items-center gap-3 w-full">
            <button
              onClick={() => setIsSidebarVisible(!isSidebarVisible)}
              className="p-2 bg-principal-700 text-blanco rounded-md hover:bg-principal-600 hidden lg:block"
              aria-label="Toggle Sidebar"
            >
              <HamburgerIcon />
            </button>
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 bg-principal-700 text-blanco rounded-md hover:bg-principal-600 lg:hidden"
              aria-label="Open Menu"
            >
              <HamburgerIcon />
            </button>

            <SystemStatusBar />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
}