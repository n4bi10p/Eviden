import React from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';
import MoonIcon from './MoonIcon';

const Navbar: React.FC = () => {
  return (
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

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link to="/" className="text-macos-gray-700 hover:text-macos-gray-900 dark:text-gray-300 dark:hover:text-white px-3 py-2 text-sm font-medium transition-colors">
                HOME
              </Link>
              <Link to="/events" className="text-macos-gray-700 hover:text-macos-gray-900 dark:text-gray-300 dark:hover:text-white px-3 py-2 text-sm font-medium transition-colors">
                EVENTS
              </Link>
              <Link to="/timeline" className="text-macos-gray-700 hover:text-macos-gray-900 dark:text-gray-300 dark:hover:text-white px-3 py-2 text-sm font-medium transition-colors">
                TIMELINE
              </Link>
              <Link to="/faq" className="text-macos-gray-700 hover:text-macos-gray-900 dark:text-gray-300 dark:hover:text-white px-3 py-2 text-sm font-medium transition-colors">
                FAQ
              </Link>
              <Link to="/contact" className="text-macos-gray-700 hover:text-macos-gray-900 dark:text-gray-300 dark:hover:text-white px-3 py-2 text-sm font-medium transition-colors">
                CONTACT
              </Link>
            </div>
          </div>

          {/* Connect Wallet Button */}
          <div>
            <Button>
              Connect Wallet
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
