import React from 'react';

interface IconProps {
  name: string;
  className?: string;
}

const Icon: React.FC<IconProps> = ({ name, className }) => {
  const iconMap: { [key: string]: string } = {
    dashboard: 'fas fa-th-large',
    projects: 'fas fa-briefcase',
    clients: 'fas fa-users',
    bots: 'fas fa-robot',
  };

  const iconClass = iconMap[name] || 'fas fa-question-circle'; // Fallback icon

  return (
    <i className={`${iconClass} ${className || ''}`} aria-hidden="true"></i>
  );
};

export default Icon;