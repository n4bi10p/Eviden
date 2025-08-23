import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface CyberButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  icon?: string;
}

const CyberButton: React.FC<CyberButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  className = '',
  disabled = false,
  icon
}) => {
  const { theme } = useTheme();
  const baseClasses = 'font-inter font-medium rounded-lg transition-all duration-300 ease-out flex items-center justify-center space-x-2';
  
  const variantClasses = {
    primary: theme === 'dark' 
      ? 'btn-cyber text-white hover:scale-105' 
      : 'bg-macos-blue-gradient text-white hover:scale-105 shadow-macos hover:shadow-macos-glow',
    secondary: theme === 'dark' 
      ? 'glass text-cyber-cyan hover:bg-cyber-purple/20 hover:scale-105' 
      : 'glass text-macos-gray-700 hover:bg-white/50 hover:scale-105',
    danger: 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg hover:scale-105 hover:shadow-red-500/50'
  };
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className="text-lg">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

export default CyberButton;
