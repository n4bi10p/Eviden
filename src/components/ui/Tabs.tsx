import React, { useState, ReactNode } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface Tab {
  id: string;
  label: string;
  content?: ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTab,
  onChange,
  variant = 'default',
  size = 'md',
  className = ''
}) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || '');

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'lg':
        return 'px-6 py-3 text-lg';
      default:
        return 'px-4 py-2 text-base';
    }
  };

  const getVariantClasses = (tab: Tab, isActive: boolean) => {
    const baseClasses = `
      ${getSizeClasses()}
      font-medium transition-all duration-200 cursor-pointer
      ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''}
    `;

    switch (variant) {
      case 'pills':
        return `
          ${baseClasses}
          rounded-full
          ${isActive
            ? theme === 'dark'
              ? 'bg-blue-500/20 text-blue-400 border border-blue-400/30'
              : 'bg-blue-500/20 text-blue-600 border border-blue-500/30'
            : theme === 'dark'
              ? 'text-white/70 hover:bg-white/5 hover:text-white'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
          }
        `;

      case 'underline':
        return `
          ${baseClasses}
          border-b-2 rounded-none
          ${isActive
            ? theme === 'dark'
              ? 'border-blue-400 text-blue-400'
              : 'border-blue-500 text-blue-600'
            : theme === 'dark'
              ? 'border-transparent text-white/70 hover:text-white hover:border-white/30'
              : 'border-transparent text-slate-600 hover:text-slate-800 hover:border-slate-300'
          }
        `;

      default:
        return `
          ${baseClasses}
          rounded-lg
          ${isActive
            ? theme === 'dark'
              ? 'bg-white/10 text-white border border-white/20'
              : 'bg-white text-slate-800 border border-slate-200 shadow-sm'
            : theme === 'dark'
              ? 'text-white/70 hover:bg-white/5 hover:text-white'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
          }
        `;
    }
  };

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className={`w-full ${className}`}>
      {/* Tab Headers */}
      <div className={`
        flex items-center gap-1
        ${variant === 'underline' ? 'border-b border-slate-200 dark:border-white/10' : ''}
        ${variant === 'default' ? 'p-1 rounded-lg bg-slate-100 dark:bg-white/5' : ''}
      `}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && handleTabChange(tab.id)}
            className={getVariantClasses(tab, activeTab === tab.id)}
            disabled={tab.disabled}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTabContent && (
        <div className="mt-4">
          {activeTabContent}
        </div>
      )}
    </div>
  );
};

export default Tabs;
