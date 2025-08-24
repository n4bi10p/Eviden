import React, { useState, useEffect } from 'react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if screen is mobile size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

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
    { name: 'Components Demo', href: '/demo', icon: '🧩' },
  const allNavigation = [
    { name: 'Create Event', href: '/event-create', icon: '➕' },
    { name: 'Certificates', href: '/certificates', icon: '🏆' },
    { name: 'Analytics', href: '/analytics', icon: '📊' },
    { name: 'Components Demo', href: '/demo', icon: '🧩' },
  ];
  ];

  const handleNavClick = () => {
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* Hamburger Menu Button - Only visible on mobile */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className={`md:hidden fixed top-4 left-4 z-50 p-3 rounded-lg glass border transition-all duration-300 ${
          theme === 'dark' 
            ? 'border-cyber-purple/30 text-white hover:bg-cyber-purple/20' 
            : 'border-gray-300/30 text-gray-800 hover:bg-white/40'
        }`}
        aria-label="Toggle menu"
      >
        <div className="w-6 h-6 flex flex-col justify-center space-y-1">
          <span className={`block h-0.5 w-6 transition-all duration-300 ${
            isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''
          } ${theme === 'dark' ? 'bg-white' : 'bg-gray-800'}`} />
          <span className={`block h-0.5 w-6 transition-all duration-300 ${
            isMobileMenuOpen ? 'opacity-0' : ''
          } ${theme === 'dark' ? 'bg-white' : 'bg-gray-800'}`} />
          <span className={`block h-0.5 w-6 transition-all duration-300 ${
            isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
          } ${theme === 'dark' ? 'bg-white' : 'bg-gray-800'}`} />
        </div>
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${isMobile ? 'fixed' : 'sticky'}
        ${isMobile && !isMobileMenuOpen ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}
        w-64 h-screen glass-dark left-0 top-0 z-40 border-r flex flex-col transition-transform duration-300 ease-in-out
        md:sticky md:top-0 md:h-screen md:z-10
        ${theme === 'dark' ? 'border-cyber-purple/30' : 'border-gray-300/30'}
      `}>
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-6 md:mb-8">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              theme === 'dark' 
                ? 'bg-gradient-to-br from-cyber-purple to-cyber-cyan neon-glow' 
                : 'bg-macos-blue-gradient shadow-macos'
            }`}>
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className={`text-lg md:text-xl font-semibold ${
              theme === 'dark' ? 'text-white neon-text' : 'text-macos-gray-900'
            }`}>Eviden</span>
          </div>

          {/* User Type Badge */}
          <div className="mb-6 md:mb-8">
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
          <nav className="space-y-1 md:space-y-2 mb-6 md:mb-8">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={handleNavClick}
                  className={`
                    flex items-center space-x-3 px-3 md:px-4 py-2 md:py-3 rounded-lg transition-all duration-200 border text-sm md:text-base
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
                  <span className="text-base md:text-lg">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="mb-4 md:mb-6">
            <button
              onClick={() => {
                logout();
                navigate('/login');
                handleNavClick();
              }}
              className={`
                w-full flex items-center space-x-3 px-3 md:px-4 py-2 md:py-3 rounded-lg transition-all duration-200 border text-sm md:text-base
                ${theme === 'dark' 
                  ? 'text-red-400 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30 border-transparent' 
                  : 'text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 border-transparent'
                }
              `}
            >
              <span className="text-base md:text-lg">🚪</span>
              <span className="font-medium">Logout</span>
            </button>
          </div>

          {/* Theme Toggle */}
          <div className={`mb-4 md:mb-6 p-3 md:p-4 glass rounded-lg border backdrop-blur-lg ${
            theme === 'dark' 
              ? 'border-cyber-purple/30 bg-cyber-dark/30' 
              : 'border-white/40 bg-white/20'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs md:text-sm font-medium ${
                theme === 'dark' ? 'text-white/90' : 'text-macos-gray-900'
              }`}>
                {theme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}
              </span>
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Bottom Section - Fixed at bottom */}
        <div className="p-4 md:p-6 border-t border-white/10">
          <div className={`glass rounded-lg p-3 md:p-4 border ${
            theme === 'dark' ? 'border-cyber-purple/40' : 'border-gray-300/40'
          }`}>
            <div className="flex items-center space-x-3">
              <div className={`w-8 md:w-10 h-8 md:h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                theme === 'dark' 
                  ? 'bg-gradient-to-br from-cyber-purple to-cyber-cyan neon-glow' 
                  : 'bg-macos-blue-gradient shadow-macos'
              }`}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-xs md:text-sm font-medium truncate ${
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
    </>
  );
};

export default Sidebar;
