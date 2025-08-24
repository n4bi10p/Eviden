import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';
import MoonIcon from './MoonIcon';
import ThemeToggle from './ThemeToggle';
import { useWalletAuth } from '../contexts/WalletAuthContext';
import AuthModal from './AuthModal';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout } = useWalletAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <nav className="bg-white/90 dark:bg-cyber-dark/80 backdrop-blur-sm border-b border-macos-gray-200 dark:border-cyber-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <MoonIcon className="flex-shrink-0" size={28} />
                <Link to="/" className="text-xl font-bold text-macos-gray-900 dark:text-white">
                  <span className="text-macos-blue dark:text-cyber-cyan">EV</span>
                  <span className="text-macos-purple dark:text-cyber-purple">ID</span>
                  <span className="text-macos-blue dark:text-cyber-cyan">EN</span>
                </Link>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <Link to="/" className="text-macos-gray-700 hover:text-macos-gray-900 dark:text-gray-300 dark:hover:text-white px-3 py-2 text-sm font-medium transition-colors">
                  HOME
                </Link>
                <Link to="/events" className="text-macos-gray-700 hover:text-macos-gray-900 dark:text-gray-300 dark:hover:text-white px-3 py-2 text-sm font-medium transition-colors">
                  EVENTS
                </Link>
                {user?.role === 'organizer' && (
                  <Link to="/create-event" className="text-macos-gray-700 hover:text-macos-gray-900 dark:text-gray-300 dark:hover:text-white px-3 py-2 text-sm font-medium transition-colors">
                    CREATE EVENT
                  </Link>
                )}
                {user && (
                  <>
                    <Link to="/profile" className="text-macos-gray-700 hover:text-macos-gray-900 dark:text-gray-300 dark:hover:text-white px-3 py-2 text-sm font-medium transition-colors">
                      PROFILE
                    </Link>
                    <Link to="/certificates" className="text-macos-gray-700 hover:text-macos-gray-900 dark:text-gray-300 dark:hover:text-white px-3 py-2 text-sm font-medium transition-colors">
                      CERTIFICATES
                    </Link>
                  </>
                )}
                <Link to="/faq" className="text-macos-gray-700 hover:text-macos-gray-900 dark:text-gray-300 dark:hover:text-white px-3 py-2 text-sm font-medium transition-colors">
                  FAQ
                </Link>
                <Link to="/contact" className="text-macos-gray-700 hover:text-macos-gray-900 dark:text-gray-300 dark:hover:text-white px-3 py-2 text-sm font-medium transition-colors">
                  CONTACT
                </Link>
              </div>
            </div>

            {/* Desktop Theme Toggle and User Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <ThemeToggle />
              
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user?.full_name?.charAt(0)?.toUpperCase() || user?.address?.slice(0, 1)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {user?.full_name || 'User'}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      user?.role === 'organizer' 
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                        : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    }`}>
                      {user?.role}
                    </span>
                  </button>

                  {/* User Dropdown */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          View Profile
                        </Link>
                        <button
                          onClick={() => {
                            logout();
                            setIsUserMenuOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Button onClick={() => setIsAuthModalOpen(true)}>
                  Connect Wallet
                </Button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-2">
              <ThemeToggle />
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-macos-gray-700 dark:text-gray-300 hover:text-macos-gray-900 dark:hover:text-white hover:bg-macos-gray-100 dark:hover:bg-cyber-gray focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {/* Hamburger icon */}
                <svg
                  className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
                {/* Close icon */}
                <svg
                  className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-macos-gray-200 dark:border-cyber-gray mt-2">
              <Link
                to="/"
                className="text-macos-gray-700 hover:text-macos-gray-900 dark:text-gray-300 dark:hover:text-white block px-3 py-2 text-base font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                HOME
              </Link>
              <Link
                to="/events"
                className="text-macos-gray-700 hover:text-macos-gray-900 dark:text-gray-300 dark:hover:text-white block px-3 py-2 text-base font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                EVENTS
              </Link>
              {user?.role === 'organizer' && (
                <Link
                  to="/create-event"
                  className="text-macos-gray-700 hover:text-macos-gray-900 dark:text-gray-300 dark:hover:text-white block px-3 py-2 text-base font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  CREATE EVENT
                </Link>
              )}
              {user && (
                <>
                  <Link
                    to="/profile"
                    className="text-macos-gray-700 hover:text-macos-gray-900 dark:text-gray-300 dark:hover:text-white block px-3 py-2 text-base font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    PROFILE
                  </Link>
                  <Link
                    to="/certificates"
                    className="text-macos-gray-700 hover:text-macos-gray-900 dark:text-gray-300 dark:hover:text-white block px-3 py-2 text-base font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    CERTIFICATES
                  </Link>
                </>
              )}
              <Link
                to="/faq"
                className="text-macos-gray-700 hover:text-macos-gray-900 dark:text-gray-300 dark:hover:text-white block px-3 py-2 text-base font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                FAQ
              </Link>
              <Link
                to="/contact"
                className="text-macos-gray-700 hover:text-macos-gray-900 dark:text-gray-300 dark:hover:text-white block px-3 py-2 text-base font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                CONTACT
              </Link>
              
              {/* Mobile User Actions */}
              <div className="pt-2">
                {user ? (
                  <div className="space-y-2">
                    <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {user?.full_name?.charAt(0)?.toUpperCase() || user?.address?.slice(0, 1)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {user?.full_name || 'User'}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                            {user?.role}
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Button
                    onClick={() => {
                      setIsAuthModalOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full"
                  >
                    Connect Wallet
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </>
  );
};

export default Navbar;
