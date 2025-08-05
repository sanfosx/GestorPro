
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Projects from './components/Projects';
import Clients from './components/Clients';
import Bots from './components/Bots';
import MobileHeader from './components/MobileHeader';
import Auth from './components/Auth';

export type View = 'dashboard' | 'projects' | 'clients' | 'bots';

const App: React.FC = () => {
  const [session, setSession] = useState<{ id_sheet: string } | null>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Comprobar la sesión en el almacenamiento local al cargar la aplicación
    const savedSession = localStorage.getItem('user_session');
    if (savedSession) {
      try {
        const parsedSession = JSON.parse(savedSession);
        if(parsedSession.id_sheet) {
          setSession(parsedSession);
        }
      } catch (e) {
        console.error("No se pudo parsear la sesión guardada", e);
        localStorage.removeItem('user_session');
      }
    }
  }, []);
  
  const handleLoginSuccess = useCallback((newSession: { id_sheet: string }) => {
    localStorage.setItem('user_session', JSON.stringify(newSession));
    setSession(newSession);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('user_session');
    setSession(null);
    setCurrentView('dashboard'); // Restablecer la vista al cerrar sesión
  }, []);

  const viewTitle = useMemo(() => {
    switch(currentView) {
      case 'dashboard': return 'Dashboard';
      case 'projects': return 'Proyectos';
      case 'clients': return 'Clientes';
      case 'bots': return 'Bots';
      default: return 'Dashboard';
    }
  }, [currentView]);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'projects':
        return <Projects />;
      case 'clients':
        return <Clients />;
      case 'bots':
        return <Bots />;
      default:
        return <Dashboard />;
    }
  };

  // Si no hay sesión, mostrar la pantalla de autenticación
  if (!session) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  // Si hay sesión, mostrar la aplicación principal
  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView}
        isOpen={isSidebarOpen}
        setIsOpen={setSidebarOpen} 
        onLogout={handleLogout}
      />
      {/* Overlay for mobile to close sidebar */}
      {isSidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" aria-hidden="true"></div>}

      <div className="flex-1 flex flex-col w-full">
        <MobileHeader setSidebarOpen={setSidebarOpen} title={viewTitle} />
        <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 overflow-y-auto">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default App;
