import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 ease-in-out 
        focus:outline-none focus:ring-2 focus:ring-offset-1 active:scale-95 hover:scale-105
        ${theme === 'dark' 
          ? 'bg-cyber-dark/50 border border-cyber-purple/30 focus:ring-cyber-cyan/30 hover:bg-cyber-purple/20' 
          : 'bg-white/80 border border-gray-200 focus:ring-macos-blue/30 hover:bg-gray-50 shadow-sm'
        }
      `}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
    >
      <span className={`text-lg transition-all duration-300 ${
        theme === 'dark' ? 'text-cyber-cyan' : 'text-yellow-500'
      }`}>
        {theme === 'dark' ? '🌙' : '☀️'}
      </span>
    </button>
  );
};

export default ThemeToggle;
