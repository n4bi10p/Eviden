import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';

interface SidebarProps {
  userType: 'organizer' | 'attendee';
}

const Sidebar: React.FC<SidebarProps> = ({ userType }) => {
  const location = useLocation();
  const { theme } = useTheme();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
    { name: 'Events', href: '/events', icon: '📅' },
    { name: 'Certificates', href: '/certificates', icon: '🏆' },
    { name: 'Profile', href: '/profile', icon: '👤' },
    { name: 'Settings', href: '/settings', icon: '⚙️' },
  ];

  if (userType === 'organizer') {
    navigation.splice(2, 0, { name: 'Analytics', href: '/analytics', icon: '📊' });
  }

  return (
    <div className={`w-64 h-screen glass-dark fixed left-0 top-0 z-10 border-r ${
      theme === 'dark' ? 'border-cyber-purple/30' : 'border-gray-300/30'
    }`}>
      <div className="p-6">
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
        <div className="mb-6">
          <span className={`
            px-3 py-1 rounded-full text-xs font-medium border
            ${userType === 'organizer' 
              ? (theme === 'dark' 
                  ? 'bg-cyber-purple/30 text-cyber-cyan border-cyber-purple/50' 
                  : 'bg-macos-purple/20 text-macos-purple border-macos-purple/50')
              : (theme === 'dark' 
                  ? 'bg-cyber-cyan/20 text-cyber-cyan border-cyber-cyan/50' 
                  : 'bg-macos-blue/20 text-macos-blue border-macos-blue/50')
            }
          `}>
            {userType === 'organizer' ? '🎯 Organizer' : '🎫 Attendee'}
          </span>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
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

        {/* Theme Toggle */}
        <div className={`mt-6 p-3 glass rounded-lg border backdrop-blur-lg ${
          theme === 'dark' 
            ? 'border-cyber-purple/20 bg-cyber-dark/20' 
            : 'border-white/30 bg-white/10'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium ${
              theme === 'dark' ? 'text-white/80' : 'text-macos-gray-900'
            }`}>
              {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </span>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="absolute bottom-6 left-6 right-6">
        <div className={`glass rounded-lg p-4 border ${
          theme === 'dark' ? 'border-cyber-purple/40' : 'border-gray-300/40'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full ${
              theme === 'dark' 
                ? 'bg-gradient-to-br from-cyber-purple to-cyber-cyan neon-glow' 
                : 'bg-macos-blue-gradient shadow-macos'
            }`}></div>
            <div>
              <p className={`text-sm font-medium ${
                theme === 'dark' ? 'text-white' : 'text-macos-gray-900'
              }`}>John Doe</p>
              <p className={`text-xs ${
                theme === 'dark' ? 'text-cyber-cyan/70' : 'text-macos-gray-700'
              }`}>john@example.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
