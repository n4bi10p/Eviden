import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface CyberButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const CyberButton: React.FC<CyberButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  className = '',
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  type = 'button'
}) => {
  const { theme } = useTheme();
  
  const baseClasses = `
    font-inter font-medium rounded-lg 
    transition-all duration-300 ease-out 
    flex items-center justify-center space-x-2
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    active:scale-95 touch-friendly
    ${fullWidth ? 'w-full' : ''}
  `;
  
  const variantClasses = {
    primary: theme === 'dark' 
      ? `btn-cyber text-white hover:scale-[1.02] 
         focus:ring-cyber-cyan/50 shadow-lg shadow-cyber-cyan/25
         hover:shadow-xl hover:shadow-cyber-cyan/30` 
      : `bg-macos-blue-gradient text-white hover:scale-[1.02] 
         shadow-macos hover:shadow-macos-glow
         focus:ring-blue-500/50`,
    secondary: theme === 'dark' 
      ? `glass text-cyber-cyan hover:bg-cyber-purple/20 hover:scale-[1.02]
         focus:ring-cyber-cyan/50 border border-cyber-purple/30` 
      : `glass text-macos-gray-700 hover:bg-white/50 hover:scale-[1.02]
         focus:ring-blue-500/50 border border-white/30`,
    danger: `bg-gradient-to-r from-red-500 to-pink-500 text-white 
             shadow-lg hover:scale-[1.02] hover:shadow-red-500/50
             focus:ring-red-500/50`,
    ghost: theme === 'dark'
      ? `bg-transparent text-cyber-cyan hover:bg-cyber-purple/20
         focus:ring-cyber-cyan/50`
      : `bg-transparent text-slate-600 hover:bg-slate-100
         focus:ring-blue-500/50`
  };
  
  const sizeClasses = {
    sm: 'px-2 sm:px-3 py-1.5 sm:py-2 text-responsive-xs sm:text-responsive-sm min-h-[36px] sm:min-h-[40px]',
    md: 'px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 text-responsive-sm sm:text-responsive-base min-h-[44px] sm:min-h-[48px]',
    lg: 'px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-4 text-responsive-base sm:text-responsive-lg min-h-[48px] sm:min-h-[52px]'
  };

  const disabledClasses = disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`.trim()}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={typeof children === 'string' ? children : undefined}
    >
      {loading && (
        <svg 
          className="w-4 h-4 animate-spin" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4" 
            fill="none" 
            className="opacity-25"
          />
          <path 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            className="opacity-75"
          />
        </svg>
      )}
      {icon && <span className="text-responsive-base sm:text-responsive-lg" aria-hidden="true">{icon}</span>}
      <span className={loading ? 'opacity-70' : ''}>{children}</span>
    </button>
  );
};

export default CyberButton;
