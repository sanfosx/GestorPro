import React, { useState } from 'react';
import type { Project } from '../types';
import NoteManager from './NoteManager';
import LinkManager from './LinkManager';
import PromptManager from './PromptManager';

type Tab = 'notes' | 'links' | 'prompts';

const TabButton: React.FC<{ tabName: Tab; label: string; icon: string; activeTab: Tab; onClick: (tab: Tab) => void; }> = ({ tabName, label, icon, activeTab, onClick }) => (
    <button
      type="button"
      onClick={() => onClick(tabName)}
      className={`flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium rounded-t-lg transition-colors border-b-2 ${
        activeTab === tabName
          ? 'text-indigo-600 border-indigo-600'
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 border-transparent'
      }`}
      aria-current={activeTab === tabName ? 'page' : undefined}
    >
      <i className={`fas ${icon} mr-2 w-5 text-center`}></i>
      {label}
    </button>
);

const ProjectDetailView: React.FC<{
  project: Project;
  onClose: () => void;
}> = ({ project, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('notes');

  return (
    <div className="bg-white h-full rounded-xl shadow-lg flex flex-col animate-slide-in-from-right">
        <header className="p-4 border-b flex items-center justify-between flex-shrink-0">
            <div>
                <h2 className="text-xl font-bold text-gray-800 truncate" title={project.name}>{project.name}</h2>
                <p className="text-sm text-gray-500">{project.clientName}</p>
            </div>
            <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Cerrar vista de detalles"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </header>
        
        <nav className="flex space-x-0 border-b flex-shrink-0" aria-label="Tabs">
            <TabButton tabName="notes" label="Notas" icon="fa-sticky-note" activeTab={activeTab} onClick={setActiveTab} />
            <TabButton tabName="links" label="Links" icon="fa-link" activeTab={activeTab} onClick={setActiveTab} />
            <TabButton tabName="prompts" label="Prompts" icon="fa-robot" activeTab={activeTab} onClick={setActiveTab} />
        </nav>
        
        <main className="p-4 overflow-y-auto flex-grow bg-gray-50/50 rounded-b-xl">
            {activeTab === 'notes' && <NoteManager projectId={project.id} />}
            {activeTab === 'links' && <LinkManager projectId={project.id} />}
            {activeTab === 'prompts' && <PromptManager projectId={project.id} />}
        </main>
    </div>
  );
};

export default ProjectDetailView;
