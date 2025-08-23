import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    isPositive: boolean;
  };
  icon?: LucideIcon;
  iconColor?: string;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  iconColor = 'text-blue-500',
  className = ''
}) => {
  const { theme } = useTheme();

  return (
    <div className={`
      relative overflow-hidden rounded-xl p-6 transition-all duration-300 hover:scale-105
      ${theme === 'dark' 
        ? 'bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10' 
        : 'bg-white/80 backdrop-blur-sm border border-white/20 hover:bg-white/90'
      }
      ${className}
    `}>
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-sm font-medium ${
            theme === 'dark' ? 'text-white/70' : 'text-slate-600'
          }`}>
            {title}
          </h3>
          {Icon && (
            <div className={`p-2 rounded-lg ${
              theme === 'dark' ? 'bg-white/5' : 'bg-slate-100/50'
            }`}>
              <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
          )}
        </div>

        {/* Value */}
        <div className={`text-3xl font-bold mb-2 ${
          theme === 'dark' ? 'text-white' : 'text-slate-800'
        }`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>

        {/* Change Indicator */}
        {change && (
          <div className="flex items-center gap-1">
            <span className={`text-sm font-medium ${
              change.isPositive 
                ? 'text-green-500' 
                : 'text-red-500'
            }`}>
              {change.isPositive ? '↗' : '↘'} {change.value}
            </span>
            <span className={`text-xs ${
              theme === 'dark' ? 'text-white/50' : 'text-slate-500'
            }`}>
              from last month
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
