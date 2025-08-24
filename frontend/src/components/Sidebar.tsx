import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useWalletAuth } from '../contexts/WalletAuthContext';
import ThemeToggle from './ThemeToggle';

interface SidebarProps {
  userType?: 'organizer' | 'attendee';
}

const Sidebar: React.FC<SidebarProps> = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user, logout } = useWalletAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Enhanced responsive breakpoint detection
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 1024); // Changed to lg breakpoint (1024px)
      if (width >= 1024) {
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
      { name: 'Certificates', href: '/certificates', icon: '🏆' },
      { name: 'Analytics', href: '/analytics', icon: '📊' },
      { name: 'Components Demo', href: '/demo', icon: '🧩' },
      { name: 'Profile', href: '/profile', icon: '👤' },
      { name: 'Settings', href: '/settings', icon: '⚙️' },
    ];

  // All navigation items in the order shown in the screenshot
  const navigation = baseNavigation;

  const handleNavClick = () => {
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* Enhanced Hamburger Menu Button - Touch-friendly and accessible */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className={`lg:hidden fixed top-4 left-4 z-50 btn-touch rounded-lg glass border transition-all duration-300 shadow-lg ${
          theme === 'dark' 
            ? 'border-cyber-purple/30 text-white hover:bg-cyber-purple/20 bg-gray-900/90' 
            : 'border-gray-300/40 text-gray-800 hover:bg-white/70 bg-white/90'
        }`}
        aria-label="Toggle navigation menu"
        aria-expanded={isMobileMenuOpen}
      >
        <div className="w-5 h-5 sm:w-6 sm:h-6 flex flex-col justify-center space-y-1">
          <span className={`block h-0.5 w-full transition-all duration-300 ${
            isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''
          } ${theme === 'dark' ? 'bg-white' : 'bg-gray-800'}`} />
          <span className={`block h-0.5 w-full transition-all duration-300 ${
            isMobileMenuOpen ? 'opacity-0' : ''
          } ${theme === 'dark' ? 'bg-white' : 'bg-gray-800'}`} />
          <span className={`block h-0.5 w-full transition-all duration-300 ${
            isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
          } ${theme === 'dark' ? 'bg-white' : 'bg-gray-800'}`} />
        </div>
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Responsive Sidebar */}
      <div className={`
        ${isMobile ? 'fixed' : 'sticky'}
        ${isMobile && !isMobileMenuOpen ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}
        w-72 sm:w-80 lg:w-56 xl:w-64 h-screen glass-dark left-0 top-0 z-40 border-r flex flex-col transition-transform duration-300 ease-in-out
        lg:sticky lg:top-0 lg:h-screen lg:z-10
        ${theme === 'dark' ? 'border-cyber-purple/30' : 'border-gray-300/30'}
      `}>
        <div className="flex-1 spacing-responsive-sm overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center space-x-2 mb-4 md:mb-6">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              theme === 'dark' 
                ? 'bg-gradient-to-br from-cyber-purple to-cyber-cyan neon-glow' 
                : 'bg-blue-600 shadow-lg'
            }`}>
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className={`text-xl font-bold ${
              theme === 'dark' ? 'text-white neon-text' : 'text-gray-900'
            }`}>Eviden</span>
          </div>

          {/* User Type Badge */}
          <div className="mb-4 md:mb-6">
            <span className={`
              px-3 py-1 rounded-full text-xs font-medium border
              ${theme === 'dark' 
                ? 'bg-cyber-cyan/20 text-cyber-cyan border-cyber-cyan/50' 
                : 'bg-macos-blue/20 text-macos-blue border-macos-blue/50'
              }
            `}>
              🎫 attendee
            </span>
          </div>

          {/* Enhanced Navigation - Touch-friendly and accessible */}
          <nav className="space-y-1 mb-4 lg:mb-6" role="navigation" aria-label="Main navigation">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={handleNavClick}
                  className={`
                    btn-touch flex items-center space-x-3 px-3 sm:px-4 py-3 rounded-lg transition-all duration-200 border text-responsive-sm sm:text-responsive-base
                    ${isActive 
                      ? (theme === 'dark' 
                          ? 'bg-cyber-purple/30 text-cyber-cyan border-cyber-cyan/30 neon-glow' 
                          : 'bg-macos-blue/20 text-macos-blue border-macos-blue/30 shadow-macos')
                      : (theme === 'dark' 
                          ? 'text-white/70 hover:bg-cyber-purple/20 hover:text-cyber-cyan hover:border-cyber-purple/30 border-transparent focus:outline-none focus:ring-2 focus:ring-cyber-cyan/50' 
                          : 'text-macos-gray-800 hover:bg-white/40 hover:text-macos-gray-900 hover:border-macos-blue/30 border-transparent focus:outline-none focus:ring-2 focus:ring-macos-blue/50')
                    }
                  `}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="text-lg sm:text-xl flex-shrink-0">{item.icon}</span>
                  <span className="font-medium truncate">{item.name}</span>
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
              <div className="flex items-center space-x-2">
                <span className="text-lg">{theme === 'dark' ? '🌙' : '☀️'}</span>
                <span className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-white/90' : 'text-gray-900'
                }`}>
                  Dark Mode
                </span>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Bottom Section - Fixed at bottom */}
        <div className="p-3 md:p-4 border-t border-white/10">
          <div className={`glass rounded-lg p-3 border ${
            theme === 'dark' ? 'border-cyber-purple/40' : 'border-gray-300/40'
          }`}>
            <div className="flex items-center space-x-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                theme === 'dark' 
                  ? 'bg-gradient-to-br from-cyber-purple to-cyber-cyan neon-glow' 
                  : 'bg-blue-600 shadow-lg'
              }`}>
                {user?.full_name?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium truncate ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {user?.role || 'attendee'}
                </p>
                <p className={`text-xs truncate ${
                  theme === 'dark' ? 'text-cyber-cyan/70' : 'text-gray-600'
                }`}>
                  {user?.email || 'user@demo.com'}
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
