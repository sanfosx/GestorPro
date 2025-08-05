
import React from 'react';
import type { Project } from '../types';
import { ProjectStatus } from '../types';

interface ProjectCardProps {
    project: Project;
    isSelected: boolean;
    onSelect: (project: Project) => void;
    onEdit: (project: Project) => void;
    onDelete: (id: string) => void;
}

const getStatusAppearance = (status: ProjectStatus): { bg: string; text: string; } => {
    switch (status) {
        case ProjectStatus.Completed: return { bg: 'bg-green-100', text: 'text-green-800' };
        case ProjectStatus.InProgress: return { bg: 'bg-blue-100', text: 'text-blue-800' };
        case ProjectStatus.OnHold: return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
        case ProjectStatus.NotStarted: return { bg: 'bg-gray-200', text: 'text-gray-800' };
        default: return { bg: 'bg-gray-100', text: 'text-gray-800' };
    }
}

const InfoRow: React.FC<{ icon: string; text: string | React.ReactNode; className?: string }> = ({ icon, text, className = '' }) => (
    <div className={`flex items-center text-sm text-gray-600 ${className}`}>
        <i className={`fas ${icon} fa-fw w-5 mr-2 text-gray-400`}></i>
        <span>{text}</span>
    </div>
);

const ProjectCard: React.FC<ProjectCardProps> = ({ project, isSelected, onSelect, onEdit, onDelete }) => {
    const statusClasses = getStatusAppearance(project.status);

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onEdit(project);
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(project.id);
    };

    return (
        <div 
            onClick={() => onSelect(project)}
            className={`
                bg-white rounded-xl shadow-md p-5 flex flex-col justify-between cursor-pointer 
                transition-all duration-200 ease-in-out transform hover:-translate-y-1 hover:shadow-lg
                border-2 ${isSelected ? 'border-indigo-500 shadow-indigo-100' : 'border-transparent'}
            `}
        >
            <div>
                <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg text-gray-800 pr-2">{project.name}</h3>
                    <span className={`px-2.5 py-0.5 text-xs font-semibold leading-tight rounded-full ${statusClasses.bg} ${statusClasses.text}`}>
                        {project.status}
                    </span>
                </div>
                <div className="space-y-2 text-gray-700">
                    <InfoRow icon="fa-user-tie" text={project.clientName || 'Sin cliente'} />
                    <InfoRow icon="fa-dollar-sign" text={`$${project.budget.toLocaleString()}`} />
                    <InfoRow 
                        icon="fa-calendar-alt" 
                        text={<>{new Date(project.startDate).toLocaleDateString()} &rarr; {new Date(project.endDate).toLocaleDateString()}</>}
                    />
                </div>
            </div>
            <div className="flex justify-end space-x-3 mt-4 border-t border-gray-100 pt-4">
                <button onClick={handleEditClick} className="text-indigo-600 hover:text-indigo-900 font-medium text-sm p-1 rounded-md transition-colors" aria-label={`Editar ${project.name}`}><i className="fas fa-pencil-alt fa-fw"></i></button>
                <button onClick={handleDeleteClick} className="text-red-500 hover:text-red-800 font-medium text-sm p-1 rounded-md transition-colors" aria-label={`Eliminar ${project.name}`}><i className="fas fa-trash-alt fa-fw"></i></button>
            </div>
        </div>
    );
};

export default ProjectCard;
