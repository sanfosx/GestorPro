
import React from 'react';

interface MobileHeaderProps {
  setSidebarOpen: (isOpen: boolean) => void;
  title: string;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ setSidebarOpen, title }) => {
  return (
    <header className="md:hidden bg-white shadow-sm p-4 flex items-center sticky top-0 z-20">
      <button onClick={() => setSidebarOpen(true)} className="text-gray-500 mr-4" aria-label="Abrir menú">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
      </button>
      <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
    </header>
  );
};

export default MobileHeader;
