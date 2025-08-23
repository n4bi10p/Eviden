import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'light' | 'medium' | 'dark';
  hover?: boolean;
  onClick?: () => void;
  interactive?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  variant = 'light',
  hover = true,
  onClick,
  interactive = false
}) => {
  const { theme } = useTheme();
  
  const variantClasses = {
    light: theme === 'dark' ? 'glass border-cyber-purple/20' : 'glass border-white/40',
    medium: theme === 'dark' ? 'glass-dark border-cyber-purple/30' : 'glass-dark border-white/50',
    dark: theme === 'dark' ? 'bg-cyber-dark/90 border-cyber-purple/40' : 'bg-white/70 border-macos-blue/20'
  };

  const hoverClass = hover ? (theme === 'dark' 
    ? 'hover:scale-[1.02] hover:shadow-neon hover:border-cyber-cyan/40 active:scale-[0.98]' 
    : 'hover:scale-[1.02] hover:shadow-macos hover:border-macos-blue/40 active:scale-[0.98]'
  ) : '';
  
  const clickableClass = onClick ? 'cursor-pointer' : '';
  
  const focusClass = interactive || onClick ? `
    focus:outline-none focus:ring-2 focus:ring-offset-2
    ${theme === 'dark' ? 'focus:ring-cyber-cyan/50' : 'focus:ring-blue-500/50'}
  ` : '';

  const Component = (interactive || onClick) ? 'button' : 'div';

  return (
    <Component 
      className={`
        rounded-lg sm:rounded-xl 
        p-2 sm:p-4 lg:p-6
        ${variantClasses[variant]} 
        ${hoverClass}
        ${clickableClass}
        ${focusClass}
        transition-all duration-300 ease-out
        touch-friendly
        min-h-[44px]
        ${className}
      `}
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      {children}
    </Component>
  );
};

export default GlassCard;
