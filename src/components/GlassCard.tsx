import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'light' | 'medium' | 'dark';
  hover?: boolean;
  onClick?: () => void;
}

const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  variant = 'light',
  hover = true,
  onClick 
}) => {
  const { theme } = useTheme();
  
  const variantClasses = {
    light: theme === 'dark' ? 'glass border-cyber-purple/20' : 'glass border-white/40',
    medium: theme === 'dark' ? 'glass-dark border-cyber-purple/30' : 'glass-dark border-white/50',
    dark: theme === 'dark' ? 'bg-cyber-dark/90 border-cyber-purple/40' : 'bg-white/70 border-macos-blue/20'
  };

  const hoverClass = hover ? (theme === 'dark' 
    ? 'hover:scale-105 hover:shadow-neon hover:border-cyber-cyan/40' 
    : 'hover:scale-105 hover:shadow-macos hover:border-macos-blue/40'
  ) : '';
  const clickableClass = onClick ? 'cursor-pointer' : '';

  return (
    <div 
      className={`
        rounded-xl p-6 
        ${variantClasses[variant]} 
        ${hoverClass}
        ${clickableClass}
        transition-all duration-300 ease-out
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default GlassCard;
