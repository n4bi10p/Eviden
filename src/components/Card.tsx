import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'gradient';
}

const Card: React.FC<CardProps> = ({ children, className = '', variant = 'default' }) => {
  const baseClasses = 'rounded-lg border border-macos-gray-200 dark:border-cyber-gray overflow-hidden';
  
  const variantClasses = {
    default: 'bg-white/80 dark:bg-cyber-gray/50',
    glass: 'bg-white/90 dark:bg-cyber-gray/30 backdrop-blur-sm',
    gradient: 'bg-gradient-to-br from-white/80 to-macos-gray-100/90 dark:from-cyber-gray/40 dark:to-cyber-dark/60 backdrop-blur-sm'
  };
  
  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
