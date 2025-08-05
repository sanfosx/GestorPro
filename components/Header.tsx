
import React from 'react';

interface HeaderProps {
    title: string;
    subtitle: string;
    buttonText: string;
    onButtonClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle, buttonText, onButtonClick }) => {
    return (
        <div className="flex flex-col items-start justify-between gap-4 mb-8 sm:flex-row sm:items-center sm:gap-0">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 sm:text-4xl">{title}</h1>
                <p className="text-lg text-gray-500">{subtitle}</p>
            </div>
            <button
                onClick={onButtonClick}
                className="flex-shrink-0 bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-200 flex items-center space-x-2"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                <span>{buttonText}</span>
            </button>
        </div>
    );
};

export default Header;
