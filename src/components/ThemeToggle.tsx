import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative inline-flex items-center w-14 h-7 rounded-full transition-all duration-300 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-offset-2 border-2
        ${theme === 'dark' 
          ? 'bg-gradient-to-r from-blue-500 to-purple-600 border-blue-400/50 focus:ring-blue-500 shadow-lg shadow-blue-500/25' 
          : 'bg-gradient-to-r from-gray-200 to-gray-300 border-gray-400/50 focus:ring-gray-400 shadow-lg'
        }
        hover:scale-105 transform
      `}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {/* Sliding Circle with Icon */}
      <span
        className={`
          inline-flex items-center justify-center w-5 h-5 bg-white rounded-full transform transition-all duration-300 ease-in-out
          shadow-lg border border-gray-200/50
          ${theme === 'dark' 
            ? 'translate-x-7' 
            : 'translate-x-1'
          }
        `}
      >
        {/* Theme Icon */}
        <span className="text-xs">
          {theme === 'dark' ? '🌙' : '☀️'}
        </span>
      </span>
      
      {/* Background Icons */}
      <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
        <span className={`text-xs transition-opacity duration-300 ${
          theme === 'dark' ? 'opacity-30' : 'opacity-70'
        }`}>
          ☀️
        </span>
        <span className={`text-xs transition-opacity duration-300 ${
          theme === 'dark' ? 'opacity-70' : 'opacity-30'
        }`}>
          🌙
        </span>
      </div>
    </button>
  );
};

export default ThemeToggle;
