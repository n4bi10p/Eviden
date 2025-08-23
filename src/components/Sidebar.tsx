import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';
import ThemeToggle from './ThemeToggle';

interface SidebarProps {
  userType?: 'organizer' | 'attendee';
}

const Sidebar: React.FC<SidebarProps> = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user, logout } = useUser();

  // Base navigation items available to all users
  const baseNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
    { name: 'Profile', href: '/profile', icon: '👤' },
    { name: 'Settings', href: '/settings', icon: '⚙️' },
  ];

  // Unified navigation for all users
  const allNavigation = [
    { name: 'Events', href: '/events', icon: '📅' },
    { name: 'Create Event', href: '/event-create', icon: '➕' },
    { name: 'Certificates', href: '/certificates', icon: '🏆' },
    { name: 'Analytics', href: '/analytics', icon: '📊' },
  ];

  // Combine navigation
  const navigation = [
    ...baseNavigation.slice(0, 1), // Dashboard first
    ...allNavigation,
    ...baseNavigation.slice(1), // Profile and Settings at the end
  ];

  return (
    <div className={`w-64 h-screen glass-dark fixed left-0 top-0 z-10 border-r flex flex-col ${
      theme === 'dark' ? 'border-cyber-purple/30' : 'border-gray-300/30'
    }`}>
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center space-x-3 mb-8">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-cyber-purple to-cyber-cyan neon-glow' 
              : 'bg-macos-blue-gradient shadow-macos'
          }`}>
            <span className="text-white font-bold text-sm">E</span>
          </div>
          <span className={`text-xl font-semibold ${
            theme === 'dark' ? 'text-white neon-text' : 'text-macos-gray-900'
          }`}>Eviden</span>
        </div>

        {/* User Type Badge */}
        <div className="mb-8">
          <span className={`
            px-3 py-1 rounded-full text-xs font-medium border
            ${theme === 'dark' 
              ? 'bg-cyber-cyan/20 text-cyber-cyan border-cyber-cyan/50' 
              : 'bg-macos-blue/20 text-macos-blue border-macos-blue/50'
            }
          `}>
            🎫 User
          </span>
        </div>

        {/* Navigation */}
        <nav className="space-y-2 mb-8">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 border
                  ${isActive 
                    ? (theme === 'dark' 
                        ? 'bg-cyber-purple/30 text-cyber-cyan border-cyber-cyan/30 neon-glow' 
                        : 'bg-macos-blue/20 text-macos-blue border-macos-blue/30 shadow-macos')
                    : (theme === 'dark' 
                        ? 'text-white/70 hover:bg-cyber-purple/20 hover:text-cyber-cyan hover:border-cyber-purple/30 border-transparent' 
                        : 'text-macos-gray-800 hover:bg-white/40 hover:text-macos-gray-900 hover:border-macos-blue/30 border-transparent')
                  }
                `}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="mb-6">
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className={`
              w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 border
              ${theme === 'dark' 
                ? 'text-red-400 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30 border-transparent' 
                : 'text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 border-transparent'
              }
            `}
          >
            <span className="text-lg">🚪</span>
            <span className="font-medium">Logout</span>
          </button>
        </div>

        {/* Theme Toggle */}
        <div className={`mb-6 p-4 glass rounded-lg border backdrop-blur-lg ${
          theme === 'dark' 
            ? 'border-cyber-purple/30 bg-cyber-dark/30' 
            : 'border-white/40 bg-white/20'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium ${
              theme === 'dark' ? 'text-white/90' : 'text-macos-gray-900'
            }`}>
              {theme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}
            </span>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Bottom Section - Fixed at bottom */}
      <div className="p-6 border-t border-white/10">
        <div className={`glass rounded-lg p-4 border ${
          theme === 'dark' ? 'border-cyber-purple/40' : 'border-gray-300/40'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
              theme === 'dark' 
                ? 'bg-gradient-to-br from-cyber-purple to-cyber-cyan neon-glow' 
                : 'bg-macos-blue-gradient shadow-macos'
            }`}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium truncate ${
                theme === 'dark' ? 'text-white' : 'text-macos-gray-900'
              }`}>
                {user?.name || 'User'}
              </p>
              <p className={`text-xs truncate ${
                theme === 'dark' ? 'text-cyber-cyan/70' : 'text-macos-gray-700'
              }`}>
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
