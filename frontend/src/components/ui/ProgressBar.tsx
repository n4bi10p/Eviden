import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface ProgressBarProps {
  label: string;
  value: number;
  maxValue?: number;
  color?: string;
  showPercentage?: boolean;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  label,
  value,
  maxValue = 100,
  color,
  showPercentage = true,
  showValue = false,
  size = 'md',
  className = ''
}) => {
  const { theme } = useTheme();
  
  const percentage = Math.min((value / maxValue) * 100, 100);
  
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const getColorClasses = () => {
    if (color) return color;
    
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    if (percentage >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm font-medium ${
          theme === 'dark' ? 'text-white/80' : 'text-slate-700'
        }`}>
          {label}
        </span>
        <div className="flex items-center gap-2">
          {showValue && (
            <span className={`text-sm font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            }`}>
              {value.toLocaleString()}
            </span>
          )}
          {showPercentage && (
            <span className={`text-sm font-medium ${
              theme === 'dark' ? 'text-white/60' : 'text-slate-600'
            }`}>
              {percentage.toFixed(0)}%
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className={`
        w-full rounded-full overflow-hidden
        ${sizeClasses[size]}
        ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-200'}
      `}>
        <div 
          className={`
            h-full rounded-full transition-all duration-500 ease-out
            ${getColorClasses()}
          `}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
