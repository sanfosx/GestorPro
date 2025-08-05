
import React from 'react';
import type { View } from '../App';
import Icon from './Icon';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onLogout: () => void;
}

const NavItem: React.FC<{
  viewName: View;
  iconName: string;
  label: string;
  currentView: View;
  setCurrentView: (view: View) => void;
  closeSidebar: () => void;
}> = ({ viewName, iconName, label, currentView, setCurrentView, closeSidebar }) => {
  const isActive = currentView === viewName;
  return (
    <li>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          setCurrentView(viewName);
          closeSidebar();
        }}
        className={`flex items-center p-3 my-1 rounded-lg text-gray-200 hover:bg-slate-700 transition-colors duration-200 ${
          isActive ? 'bg-indigo-600 text-white shadow-lg' : ''
        }`}
      >
        <Icon name={iconName} className="w-6 h-6 mr-3" />
        <span className="font-medium">{label}</span>
      </a>
    </li>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, isOpen, setIsOpen, onLogout }) => {
  const handleClose = () => setIsOpen(false);

  return (
    <aside className={`bg-slate-800 text-white p-5 shadow-2xl flex flex-col fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:flex-shrink-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="text-center mb-10">
        <h1 className="text-2xl font-bold text-white flex items-center justify-center">
          <span className="text-indigo-400 mr-2">
            <i className="fas fa-tasks"></i>
          </span>
          <span>GestorPro</span>
        </h1>
        <p className="text-xs text-slate-400">Panel de Administración</p>
      </div>
      <nav className="flex-grow">
        <ul>
          <NavItem viewName="dashboard" iconName="dashboard" label="Dashboard" currentView={currentView} setCurrentView={setCurrentView} closeSidebar={handleClose} />
          <NavItem viewName="projects" iconName="projects" label="Proyectos" currentView={currentView} setCurrentView={setCurrentView} closeSidebar={handleClose} />
          <NavItem viewName="clients" iconName="clients" label="Clientes" currentView={currentView} setCurrentView={setCurrentView} closeSidebar={handleClose} />
          <NavItem viewName="bots" iconName="bots" label="Bots" currentView={currentView} setCurrentView={setCurrentView} closeSidebar={handleClose} />
        </ul>
      </nav>
      <div className="mt-auto">
        <button
          onClick={onLogout}
          className="flex w-full items-center justify-center p-3 my-1 rounded-lg text-gray-200 bg-slate-700/50 hover:bg-red-500/80 transition-colors duration-200"
        >
          <i className="fas fa-sign-out-alt w-6 h-6 mr-3"></i>
          <span className="font-medium">Cerrar Sesión</span>
        </button>
        <div className="text-center text-slate-500 text-xs mt-4">
            <p>Hecho con ❤️ por SanFosX.</p>
            <p>&copy; {new Date().getFullYear()} GestorPro</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
