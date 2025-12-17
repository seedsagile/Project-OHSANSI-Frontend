import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { cn } from '@/utils/cn';
import { SystemStatusBar } from './SystemStatusBar';

const HamburgerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

export function RootLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const mainContentPaddingClass = isSidebarVisible ? 'lg:pl-72' : 'lg:pl-0';

  return (
    <div className="relative min-h-screen flex bg-slate-50 overflow-hidden">
      {/* Sidebar - */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        setOpen={setSidebarOpen} 
        isDesktopVisible={isSidebarVisible} 
      />

      <main className={cn(
        "flex-1 flex flex-col h-screen transition-all duration-300 ease-in-out bg-blanco",
        mainContentPaddingClass
      )}>
        
        <header className="h-16 border-b border-slate-100 flex items-center px-4 shrink-0 bg-blanco/80 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-4 w-full">
            <button
              onClick={() => setIsSidebarVisible(!isSidebarVisible)}
              className="p-2 bg-principal-700 text-blanco rounded-md hover:bg-principal-600 hidden lg:block transition-all active:scale-95"
            >
              <HamburgerIcon />
            </button>

            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 bg-principal-700 text-blanco rounded-md hover:bg-principal-600 lg:hidden"
            >
              <HamburgerIcon />
            </button>

            <SystemStatusBar />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}