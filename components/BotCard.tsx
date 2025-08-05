import React from 'react';
import type { Bot } from '../types';

interface BotCardProps {
    bot: Bot;
    isSelected: boolean;
    onSelect: (bot: Bot) => void;
    onEdit: (bot: Bot) => void;
    onDelete: (id: string) => void;
}

const getBotIconColor = (status: string | undefined): string => {
    const upperStatus = status?.toUpperCase();
    if (upperStatus === 'ONLINE' || upperStatus === 'ACTIVE') return 'text-green-500';
    if (upperStatus === 'NOT_FOUND' || upperStatus === 'FAILED' || upperStatus === 'ERROR') return 'text-red-500';
    return 'text-indigo-400';
};


const BotCard: React.FC<BotCardProps> = ({ bot, isSelected, onSelect, onEdit, onDelete }) => {
    const iconColor = getBotIconColor(bot.status);

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onEdit(bot);
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(bot.id);
    };

    return (
        <div 
            className={`
                bg-white rounded-xl shadow-md p-5 flex flex-col justify-between
                transition-all duration-200 ease-in-out transform hover:-translate-y-1 hover:shadow-lg
                border-2 ${isSelected ? 'border-indigo-500 shadow-indigo-100' : 'border-transparent'}
            `}
        >
            <div>
                <div className="flex justify-between items-start mb-2">
                     <div className="flex-grow min-w-0">
                        <h3 className="font-bold text-lg text-gray-800 flex items-center" title={bot.name}>
                            <i className={`fas fa-robot mr-3 flex-shrink-0 ${iconColor}`}></i>
                            <span className="truncate">{bot.name}</span>
                        </h3>
                    </div>
                    <div className="flex items-center space-x-1 flex-shrink-0">
                         <button onClick={handleEditClick} className="text-gray-500 hover:text-indigo-600 p-1 rounded-md transition-colors" aria-label={`Editar ${bot.name}`}><i className="fas fa-pencil-alt fa-fw"></i></button>
                         <button onClick={handleDeleteClick} className="text-gray-500 hover:text-red-600 p-1 rounded-md transition-colors" aria-label={`Eliminar ${bot.name}`}><i className="fas fa-trash-alt fa-fw"></i></button>
                    </div>
                </div>
                <p className="text-gray-600 mt-2 text-sm h-10 line-clamp-2" title={bot.description}>{bot.description || 'Sin descripción.'}</p>
            </div>
            <div className="mt-4 border-t border-gray-100 pt-4">
                <button 
                    onClick={() => onSelect(bot)}
                    className="w-full bg-indigo-50 text-indigo-700 font-bold py-2 px-4 rounded-lg hover:bg-indigo-100 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                    <span>Administrar</span>
                    <i className="fas fa-arrow-right"></i>
                </button>
            </div>
        </div>
    );
};

export default BotCard;