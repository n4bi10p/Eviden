import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  onClick, 
  className = '',
  disabled = false,
  icon,
  type = 'button'
}) => {
  const baseClasses = 'font-semibold rounded-lg transition-all duration-300 inline-flex items-center justify-center gap-2';
  
  const variantClasses = {
    primary: 'bg-macos-blue-gradient dark:bg-button-gradient text-white hover:opacity-90 shadow-macos dark:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed',
    secondary: 'bg-macos-gray-200 dark:bg-cyber-gray text-macos-gray-800 dark:text-white hover:bg-macos-gray-300 dark:hover:bg-cyber-gray/80 disabled:opacity-50 disabled:cursor-not-allowed',
    outline: 'border-2 border-macos-blue dark:border-cyber-cyan text-macos-blue dark:text-cyber-cyan hover:bg-macos-blue dark:hover:bg-cyber-cyan hover:text-white disabled:opacity-50 disabled:cursor-not-allowed'
  };
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };
  
  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
